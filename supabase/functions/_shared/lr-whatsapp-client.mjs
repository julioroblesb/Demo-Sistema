/**
 * Cliente de referencia para BACKEND Node.js 20.19+ / 22+.
 * Contrato v1 del puente comercial LR. Requiere la clave privada de integración.
 * Sin dependencias, sin conexión directa a Baileys ni acceso a Supabase.
 */
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CAPTION_LENGTH = 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MESSAGE_STATES = new Set(['queued', 'processing', 'sent', 'failed', 'uncertain', 'cancelled']);

export class LrApiError extends Error {
  constructor(status, code, message, retryAfter = null) {
    super(message);
    this.name = 'LrApiError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export class LrTransportError extends Error {
  constructor(phase, mayHaveBeenAccepted) {
    super(mayHaveBeenAccepted
      ? 'No se pudo confirmar la respuesta. Consulta o repite con la MISMA clave de idempotencia.'
      : 'No se pudo completar la conexión con LR. Conserva el mismo identificador al reintentar.');
    this.name = 'LrTransportError';
    this.phase = phase;
    this.mayHaveBeenAccepted = mayHaveBeenAccepted;
  }
}

function ensure(condition, message) {
  if (!condition) throw new TypeError(message);
}

function imageMime(bytes) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

function validateSend(input) {
  ensure(UUID.test(input.sendId), 'sendId debe ser un UUID persistido para este envío.');
  ensure(typeof input.to === 'string' && /^\+[1-9][0-9]{7,14}$/.test(input.to), 'Usa teléfono internacional, por ejemplo +51 seguido del celular.');
  ensure(typeof input.caption === 'string' && input.caption.trim().length > 0, 'Escribe el texto del mensaje.');
  ensure(input.caption.length <= MAX_CAPTION_LENGTH, 'El texto con imagen admite hasta 1024 unidades UTF-16.');
  ensure(Buffer.isBuffer(input.image), 'image debe ser un Buffer.');
  ensure(input.image.length > 0 && input.image.length <= MAX_IMAGE_BYTES, 'La imagen debe pesar como máximo 5 MiB.');
  ensure(imageMime(input.image) === input.mime && ['image/jpeg', 'image/png', 'image/webp'].includes(input.mime), 'El archivo no coincide con el tipo JPEG, PNG o WebP indicado.');
  ensure(typeof input.externalContactId === 'string' && input.externalContactId.length > 0 && input.externalContactId.length <= 128, 'Indica el identificador del contacto en tu CRM.');
  ensure(input.consent?.confirmed === true, 'Debes confirmar autorización del destinatario.');
  ensure(typeof input.consent.source === 'string' && input.consent.source.trim().length > 0 && input.consent.source.length <= 200, 'Indica el origen de la autorización.');
  const consentDate = input.consent.capturedAt;
  ensure(typeof consentDate === 'string' && /^\d{4}-\d\d-\d\dT/.test(consentDate) && Number.isFinite(Date.parse(consentDate)) && Date.parse(consentDate) <= Date.now() + 300_000, 'capturedAt debe ser una fecha ISO real, no futura.');
  ensure(input.dryRun === undefined || typeof input.dryRun === 'boolean', 'dryRun debe ser booleano.');
}

/** Sustituye variables sin interpretar HTML ni ejecutar expresiones. */
export function renderTemplate(template, variables) {
  ensure(typeof template === 'string', 'La plantilla debe ser texto.');
  const result = template.replace(/\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g, (_match, name) => {
    ensure(Object.hasOwn(variables, name), `Falta la variable ${name}.`);
    const value = variables[name];
    ensure(typeof value === 'string' || typeof value === 'number', `La variable ${name} debe ser texto o número.`);
    return String(value);
  });
  ensure(!/\{\{[^{}]*\}\}/.test(result), 'Quedan variables sin resolver.');
  ensure(result.trim().length > 0 && result.length <= MAX_CAPTION_LENGTH, 'El texto final debe tener entre 1 y 1024 unidades UTF-16.');
  return result;
}

export class LrWhatsAppClient {
  constructor({ token, endpoint = 'https://www.sistemalr.com/api/bot-action?externalWhatsApp=v1', fetcher = globalThis.fetch }) {
    ensure(typeof token === 'string' && token.length >= 32 && !/[\r\n]/.test(token) && !token.includes('REEMPLAZAR_'), 'Configura una clave privada de integración válida.');
    const url = new URL(endpoint);
    ensure(url.protocol === 'https:' && !url.username && !url.password && !url.hash, 'El endpoint debe usar HTTPS sin credenciales en la URL.');
    ensure(url.searchParams.get('externalWhatsApp') === 'v1', 'El endpoint debe seleccionar el contrato externalWhatsApp=v1.');
    ensure(typeof fetcher === 'function', 'Se requiere fetch de Node.js.');
    this.endpoint = url;
    this.token = token;
    this.fetcher = fetcher;
  }

  async request(action, { method = 'GET', body, key, messageId } = {}) {
    const url = new URL(this.endpoint);
    url.searchParams.set('action', action);
    if (messageId) url.searchParams.set('messageId', messageId);
    const headers = { Authorization: `Bearer ${this.token}`, Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (key) headers['Idempotency-Key'] = key;
    let response;
    try {
      response = await this.fetcher(url, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'error', signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new LrTransportError(action, action === 'messages' && body?.dryRun === false);
    }
    let result;
    try { result = await response.json(); }
    catch { throw new LrTransportError(action, action === 'messages' && body?.dryRun === false); }
    if (!response.ok) {
      throw new LrApiError(response.status, result.error?.code || 'LR_ERROR',
        result.error?.message || 'LR rechazó la solicitud.', response.headers.get('Retry-After'));
    }
    return result;
  }

  /** No devuelve QR ni permite conectar, desconectar o cambiar la sesión. */
  async connection() {
    const result = await this.request('connection');
    ensure(result.senderPhone === '+51936755465' && typeof result.ready === 'boolean', 'LR no confirmó el remitente autorizado.');
    return result;
  }

  /**
   * Reintentar siempre con los mismos bytes, campos y sendId.
   * dryRun es true por defecto: para un envío real se exige false explícito.
   */
  async submitImage(input) {
    validateSend(input);
    const dryRun = input.dryRun ?? true;
    const sha256 = createHash('sha256').update(input.image).digest('hex');
    const media = await this.request('media', {
      method: 'POST', key: `${input.sendId}:image`,
      body: { mime: input.mime, size: input.image.length, sha256 },
    });
    ensure(UUID.test(media.mediaId) && typeof media.uploadRequired === 'boolean', 'LR devolvió un permiso de imagen inválido.');
    if (media.uploadRequired) {
      const url = new URL(media.uploadUrl);
      ensure(url.protocol === 'https:' && url.hostname.endsWith('.r2.cloudflarestorage.com') && !url.username && !url.password && !url.port, 'LR devolvió un destino de subida no autorizado.');
      const signedHeaders = media.requiredHeaders;
      ensure(signedHeaders && Object.keys(signedHeaders).length === 1 && signedHeaders['Content-Type'] === input.mime, 'Cabeceras de subida no autorizadas.');
      let response;
      try {
        response = await this.fetcher(url, {
          method: 'PUT', headers: signedHeaders, body: input.image,
          redirect: 'error', signal: AbortSignal.timeout(60_000),
        });
      } catch { throw new LrTransportError('upload', false); }
      if (!response.ok) throw new LrApiError(response.status, 'UPLOAD_FAILED', 'No se pudo subir la imagen; repite el flujo con el mismo sendId.');
    }
    const result = await this.request('messages', {
      method: 'POST', key: input.sendId,
      body: {
        to: input.to, caption: input.caption, mediaId: media.mediaId,
        externalContactId: input.externalContactId,
        consent: input.consent, dryRun,
      },
    });
    if (dryRun) ensure(result.dryRun === true && result.enqueued === false && result.valid === true, 'LR no confirmó el modo de prueba sin envío.');
    else ensure(UUID.test(result.messageId) && MESSAGE_STATES.has(result.status), 'LR no devolvió un registro de envío válido; consulta con el mismo sendId.');
    return result;
  }

  async status(messageId) {
    ensure(UUID.test(messageId), 'messageId debe ser el UUID de LR.');
    const result = await this.request('message', { messageId });
    ensure(result.messageId === messageId && MESSAGE_STATES.has(result.status), 'LR devolvió un estado inválido.');
    return result;
  }
}
