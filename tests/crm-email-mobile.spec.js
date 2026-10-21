import {test, expect} from '@playwright/test';
import {mockWhatsAppCloud} from './helpers/whatsapp-cloud.js';
import {TEMPLATE_VERSION} from '../integrations/outreach/sectors.mjs';

async function setup(page, context, mode = 'ready') {
  const cloud = await mockWhatsAppCloud(context);
  cloud.rows.find(row => row.kind === 'companies' && row.id === 'demo-empresa-6').data.email = 'ventas@example.com';
  const requests = [];
  const state = {mode};
  await context.route('**/functions/v1/crm-email', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({headers: {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST,OPTIONS'}, body: ''});
    const input = route.request().postDataJSON();
    requests.push(input);
    if (state.mode === 'offline') return route.abort('failed');
    const headers = {'access-control-allow-origin': '*'};
    if (state.mode === 'expired') return route.fulfill({status: 401, headers, json: {message: 'Invalid JWT'}});
    if (input.action === 'context') return route.fulfill({headers, json: {
      templateVersion: state.mode === 'old' ? 'sector-queue-v2' : TEMPLATE_VERSION,
      configured: true, enabled: true, message: 'Correo Nexo listo para validar.'
    }});
    if (input.action === 'send') return route.fulfill({headers, json: {email: {
      status: input.dryRun ? 'validated' : 'sent', logged: true
    }}});
    if (input.action === 'capabilities') return route.fulfill({headers, json: {templateVersion: state.mode === 'old' ? 'sector-queue-v2' : TEMPLATE_VERSION, queue: state.mode !== 'no-queue'}});
    return route.fulfill({headers, json: {}});
  });
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/SKYROTE13/');
  await page.getByLabel('Tu correo', {exact: true}).fill('julio@example.com');
  await page.getByLabel('Tu contraseña', {exact: true}).fill('test-password');
  await page.getByRole('button', {name: 'Entrar a mi CRM'}).click();
  await expect(page.locator('.workspace')).toBeVisible();
  return {requests, state};
}

async function openEmail(page) {
  await page.goto('/SKYROTE13/#empresas');
  await page.locator('[data-action=open-company][data-id=demo-empresa-6]').first().click();
  await page.getByRole('button', {name: 'Enviar correo', exact: true}).click();
}

test('En celular, una sesión personal valida y envía por la misma conexión del servidor', async ({page, context}) => {
  const {requests} = await setup(page, context);
  await openEmail(page);
  await expect(page.locator('.wa-connection')).toContainText('Correo listo para validar');
  await page.getByRole('button', {name: 'Validar sin enviar', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText('Validación correcta');
  await page.getByRole('button', {name: 'Enviar correo', exact: true}).click();
  await expect(page.getByRole('alert')).toContainText('Correo enviado y registrado');
  expect(requests.filter(r => r.action === 'send').map(r => r.dryRun)).toEqual([true, false]);
  expect(await page.locator('#record-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

test('Un fallo móvil no dice que Zoho esté desvinculado; comprobar de nuevo conserva el asunto', async ({page, context}) => {
  const {state, requests} = await setup(page, context, 'offline');
  await openEmail(page);
  await expect(page.locator('.wa-connection')).toContainText('Conexión sin comprobar');
  await expect(page.getByRole('alert')).toContainText('Revisa internet');
  await expect(page.getByRole('button', {name: 'Enviar correo', exact: true})).toBeDisabled();
  await page.getByLabel('Asunto', {exact: true}).fill('Asunto personalizado');
  state.mode = 'ready';
  await page.getByRole('button', {name: 'Comprobar conexión', exact: true}).click();
  await expect(page.locator('.wa-connection')).toContainText('Correo listo para validar');
  await expect(page.getByLabel('Asunto', {exact: true})).toHaveValue('Asunto personalizado');
  await expect(page.getByRole('button', {name: 'Enviar correo', exact: true})).toBeEnabled();
  expect(requests.filter(r => r.action === 'send')).toHaveLength(0);
});

test('La sesión vencida y las plantillas antiguas muestran acciones distintas en móvil', async ({page, context}) => {
  const {state} = await setup(page, context, 'expired');
  await openEmail(page);
  await expect(page.getByRole('alert')).toContainText('sesión del CRM venció');
  state.mode = 'old';
  await page.getByRole('button', {name: 'Comprobar conexión', exact: true}).click();
  await expect(page.locator('.wa-connection')).toContainText('Actualización pendiente');
  await expect(page.getByRole('alert')).toContainText('Actualizar conexión');
  await expect(page.getByRole('button', {name: 'Enviar correo', exact: true})).toBeDisabled();
});

test('Puede crear una campaña de correo desde el celular sin volver a vincular Zoho', async ({page, context}) => {
  const {requests} = await setup(page, context);
  await page.goto('/SKYROTE13/#envios');
  await page.getByRole('button', {name: 'Crear campaña', exact: true}).first().click();
  await page.getByLabel('Nombre de la campaña', {exact: true}).fill('Campaña móvil');
  await page.getByRole('button', {name: 'Añadir a la cola', exact: true}).click();
  await page.getByRole('button', {name: 'Confirmar campaña', exact: true}).click();
  await expect(page.locator('#record-dialog')).not.toBeVisible();
  const created = requests.filter(r => r.action === 'campaign-create');
  expect(created).toHaveLength(1);
  expect(created[0]).toMatchObject({name: 'Campaña móvil', channel: 'correo', emailInterval: 60});
});

for (const mode of ['old', 'no-queue']) test(`En móvil, el bloqueo por servidor ${mode} enlaza al actualizador y conserva la campaña`, async ({page, context}) => {
  const {state, requests} = await setup(page, context, mode);
  await page.goto('/SKYROTE13/#envios');
  await page.getByRole('button', {name: 'Crear campaña', exact: true}).first().click();
  await page.getByLabel('Nombre de la campaña', {exact: true}).fill('Campaña por conservar');
  await page.getByRole('button', {name: 'Añadir a la cola', exact: true}).click();
  await expect(page.locator('#campaign-form [role=alert]')).toContainText('La campaña aún no se ha creado');
  await expect(page.getByRole('link', {name: 'Actualizar servidor de envíos', exact: true})).toHaveAttribute('href', '/SKYROTE13/campanas/');
  expect(requests.filter(r => r.action === 'campaign-create')).toHaveLength(0);
  await expect(page.locator('#confirm-dialog')).not.toBeVisible();
  // An updated server can be used from the same form, without recreating it.
  state.mode = 'ready';
  await page.getByRole('button', {name: 'Añadir a la cola', exact: true}).click();
  await page.getByRole('button', {name: 'Confirmar campaña', exact: true}).click();
  await expect(page.locator('#record-dialog')).not.toBeVisible();
  expect(requests.find(r => r.action === 'campaign-create').name).toBe('Campaña por conservar');
});
