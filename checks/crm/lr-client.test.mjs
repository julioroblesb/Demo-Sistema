import test from 'node:test';
import assert from 'node:assert/strict';
import { LrWhatsAppClient, LrApiError, LrTransportError, renderTemplate, MAX_IMAGE_BYTES } from '../../supabase/functions/_shared/lr-whatsapp-client.mjs';

// Fixtures solo para comprobar el cliente; no son una validación/decodificación de imagen del servidor.
const SEND = 'e64237db-c4ea-4382-8c0d-d47d4424f591';
const MEDIA = '240a6cca-2028-45fb-a887-c74041de730e';
const MESSAGE = '370bcf0b-9910-4f8b-bd80-57d6f665e044';
const KEY = 'TEST_ONLY_NOT_A_REAL_KEY_000000000000000000000000';
const R2 = 'https://private.example.r2.cloudflarestorage.com/staging/image.png?signature=TEST';
const input = () => ({
  sendId: SEND, to: '+51999999999', caption: 'Hola *Cliente*\nNuestra propuesta.',
  image: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), mime: 'image/png', externalContactId: 'contact-123',
  consent: { confirmed: true, source: 'Prueba ficticia local', capturedAt: '2026-01-01T12:00:00.000Z' },
});
const permission = () => ({ mediaId: MEDIA, uploadRequired: true, uploadUrl: R2, requiredHeaders: { 'Content-Type': 'image/png' } });
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
function harness(responses) {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url: String(url), ...options });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    assert.ok(next instanceof Response, 'Se hizo una petición no prevista por la prueba.');
    return next;
  };
  return { client: new LrWhatsAppClient({ token: KEY, fetcher }), calls };
}

test('imagen + caption usa subida y una única solicitud JSON de mensaje; prueba por defecto', async () => {
  const { client, calls } = harness([json(permission()), new Response(null, { status: 200 }), json({ dryRun: true, enqueued: false, valid: true })]);
  const result = await client.submitImage(input());
  assert.equal(result.enqueued, false);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].headers['Idempotency-Key'], `${SEND}:image`);
  const media = JSON.parse(calls[0].body);
  assert.match(media.sha256, /^[a-f0-9]{64}$/);
  assert.equal(calls[1].method, 'PUT');
  assert.equal(calls[1].headers.Authorization, undefined, 'La clave LR no se envía a R2.');
  const message = JSON.parse(calls[2].body);
  assert.equal(message.mediaId, MEDIA);
  assert.equal(message.caption, input().caption);
  assert.equal(message.dryRun, true);
  assert.equal(message.from, undefined);
  assert.equal(calls[2].headers['Idempotency-Key'], SEND);
  assert.ok(calls.every(c => !c.url.includes(KEY)));
});

test('envío real requiere false explícito y devuelve UUID de LR', async () => {
  const { client, calls } = harness([json({ mediaId: MEDIA, uploadRequired: false }), json({ messageId: MESSAGE, status: 'queued' }, 202)]);
  assert.equal((await client.submitImage({ ...input(), dryRun: false })).messageId, MESSAGE);
  assert.equal(calls.length, 2);
});

test('reintento conserva ambas claves, no genera UUID ni duplica subidas verificadas', async () => {
  const responses = Array.from({ length: 2 }, () => [json({ mediaId: MEDIA, uploadRequired: false }), json({ messageId: MESSAGE, status: 'queued' }, 200)]).flat();
  const { client, calls } = harness(responses);
  await client.submitImage({ ...input(), dryRun: false });
  await client.submitImage({ ...input(), dryRun: false });
  assert.deepEqual(calls.map(c => c.headers['Idempotency-Key']), [`${SEND}:image`, SEND, `${SEND}:image`, SEND]);
});

for (const [name, change] of [
  ['teléfono sin país', { to: '999999999' }],
  ['JID/grupo como destino', { to: '123@g.us' }],
  ['texto vacío', { caption: '  ' }],
  ['texto mayor a 1024', { caption: 'x'.repeat(1025) }],
  ['imagen excesiva', { image: Buffer.alloc(MAX_IMAGE_BYTES + 1) }],
  ['MIME falso', { mime: 'image/jpeg' }],
  ['SVG', { image: Buffer.from('<svg/>'), mime: 'image/svg+xml' }],
  ['sin autorización', { consent: { confirmed: false } }],
  ['UUID incorrecto', { sendId: 'nuevo' }],
  ['modo de envío ambiguo', { dryRun: 'false' }],
]) {
  test(`rechaza ${name} antes de cualquier llamada HTTP`, async () => {
    const { client, calls } = harness([]);
    await assert.rejects(client.submitImage({ ...input(), ...change }), TypeError);
    assert.equal(calls.length, 0);
  });
}

test('rechaza URL de subida arbitraria antes de enviar bytes', async () => {
  const { client, calls } = harness([json({ ...permission(), uploadUrl: 'https://evil.example/image' })]);
  await assert.rejects(client.submitImage(input()), /no autorizado/);
  assert.equal(calls.length, 1);
});

test('rechaza intento de mandar autorización a otro dominio', async () => {
  const { client, calls } = harness([json({ ...permission(), requiredHeaders: { 'Content-Type': 'image/png', Authorization: 'SECRET' } })]);
  await assert.rejects(client.submitImage(input()), /Cabeceras/);
  assert.equal(calls.length, 1);
});

test('subida fallida nunca encola mensaje', async () => {
  const { client, calls } = harness([json(permission()), new Response(null, { status: 403 })]);
  await assert.rejects(client.submitImage(input()), error => error instanceof LrApiError && error.code === 'UPLOAD_FAILED');
  assert.equal(calls.length, 2);
});

test('conflicto de idempotencia se conserva como error 409', async () => {
  const { client } = harness([json({ error: { code: 'IDEMPOTENCY_CONFLICT', message: 'La clave ya se usó con otro contenido.' } }, 409)]);
  await assert.rejects(client.submitImage(input()), error => error instanceof LrApiError && error.status === 409);
});

test('límite de cuota expone Retry-After y no reintenta solo', async () => {
  const { client, calls } = harness([json({ error: { code: 'RATE_LIMITED', message: 'Espera antes de reintentar.' } }, 429, { 'Retry-After': '30' })]);
  await assert.rejects(client.submitImage(input()), error => error instanceof LrApiError && error.retryAfter === '30');
  assert.equal(calls.length, 1);
});

test('timeout al encolar informa aceptación incierta sin reenvío automático', async () => {
  const { client, calls } = harness([json({ mediaId: MEDIA, uploadRequired: false }), new Error('timeout')]);
  await assert.rejects(client.submitImage({ ...input(), dryRun: false }), error => error instanceof LrTransportError && error.mayHaveBeenAccepted);
  assert.equal(calls.length, 2);
});

test('consulta uncertain sin convertirlo en enviado ni reintentar', async () => {
  const { client, calls } = harness([json({ messageId: MESSAGE, status: 'uncertain', whatsappMessageId: null })]);
  assert.equal((await client.status(MESSAGE)).status, 'uncertain');
  assert.equal(calls.length, 1);
});

test('consulta de remitente exige exactamente el número de Julio', async () => {
  const { client } = harness([json({ ready: true, senderPhone: '+51900000000' })]);
  await assert.rejects(client.connection(), /remitente/);
});

test('consulta válida de conexión no requiere ni devuelve QR', async () => {
  const { client } = harness([json({ ready: true, senderPhone: '+51936755465', status: 'connected' })]);
  assert.equal((await client.connection()).ready, true);
});

test('plantilla conserva formato WhatsApp y resuelve variables', () => {
  assert.equal(renderTemplate('Hola {{nombre}}\n*{{producto}}*: S/ {{precio}}', { nombre: 'Ana', producto: 'Propuesta', precio: 100 }), 'Hola Ana\n*Propuesta*: S/ 100');
});

test('plantilla rechaza variables ausentes y exceso de texto final', () => {
  assert.throws(() => renderTemplate('{{nombre}}', {}), /Falta/);
  assert.throws(() => renderTemplate('{{nombre}}', { nombre: 'x'.repeat(1025) }), /1024/);
});
