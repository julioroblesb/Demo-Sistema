import {test} from 'node:test';
import assert from 'node:assert/strict';
import {invokePrivate} from '../../src/crm/private-functions.js';

function client(result) {
  let calls = 0;
  return {functions: {invoke: async () => { calls++; return result; }}, get calls() { return calls; }};
}

test('Una interrupción de red no se confunde con falta de autorización ni repite el envío', async () => {
  const api = client({error: new Error('Failed to fetch')});
  await assert.rejects(() => invokePrivate(api, 'crm-email', {action: 'send'}), error => {
    assert.equal(error.code, 'FUNCTION_CONNECTION_FAILED');
    assert.match(error.message, /Revisa internet/);
    assert.match(error.message, /historial/);
    assert.doesNotMatch(error.message, /Falta autorizar/);
    return true;
  });
  assert.equal(api.calls, 1);
});

test('Distingue sesión vencida, función ausente, límite y caída del servidor sin respuesta JSON', async () => {
  for (const [status, code] of [[401, 'UNAUTHENTICATED'], [403, 'FUNCTION_ACCESS_DENIED'], [404, 'FUNCTION_NOT_DEPLOYED'], [429, 'FUNCTION_RATE_LIMITED'], [503, 'FUNCTION_SERVER_ERROR']]) {
    const api = client({error: {context: new Response('upstream error', {status})}});
    await assert.rejects(() => invokePrivate(api, 'crm-email', {action: 'context'}), error => error.code === code);
  }
});

test('Conserva las causas concretas del backend, incluyendo Zoho no configurado', async () => {
  for (const result of [
    {error: {context: Response.json({error: {code: 'ZOHO_NOT_CONFIGURED', message: 'Falta autorizar Zoho Mail en el servidor.'}}, {status: 503})}},
    {data: {error: {code: 'ZOHO_NOT_CONFIGURED', message: 'Falta autorizar Zoho Mail en el servidor.'}}}
  ]) {
    await assert.rejects(() => invokePrivate(client(result), 'crm-email', {action: 'context'}), error => error.code === 'ZOHO_NOT_CONFIGURED' && error.message === 'Falta autorizar Zoho Mail en el servidor.');
  }
  const data = {configured: true, enabled: true};
  assert.equal(await invokePrivate(client({data}), 'crm-email', {action: 'context'}), data);
});
