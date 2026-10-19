import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

test('La ficha inicial conserva equipo y permite recorrer sus tres fechas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#dossier-client')).toHaveText('Constructora Horizonte');
  await page.locator('[data-dossier="0"]').click();
  await expect(page.locator('#dossier-client')).toHaveText('Grupo del Pacífico');
  await expect(page.locator('[data-dossier="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-dossier="1"]').click();
  await expect(page.locator('#dossier-client')).toHaveText('Mantenimiento preventivo');
  await page.locator('[data-dossier="2"]').click();
  await expect(page.locator('#dossier-client')).toHaveText('Constructora Horizonte');
  await expect(page.locator('#dossier-title')).toHaveText('EQ-024');
});

test('La transformación anima archivos y puede interrumpirse y repetirse', async ({ page }) => {
  await page.goto('/');
  await page.locator('#unify-button').click();
  await expect(page.locator('.tr-flying-file').first()).toBeAttached();
  await page.locator('#before-button').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-phase', 'before');
  await expect(page.locator('.tr-flying-file')).toHaveCount(0);
  await page.locator('#unify-button').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-phase', 'after');
  await page.locator('[data-tr-asset="1"]').click();
  await expect(page.locator('#tr-contract-name')).toHaveText('Contrato de alquiler · EQ-018');
  await page.locator('#unify-button').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-phase', 'after');
  await expect(page.locator('#tr-contract-name')).toHaveText('Contrato de alquiler · EQ-024');
});

test('El modo de movimiento reducido muestra el resultado sin archivos animados', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#unify-button').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-phase', 'after');
  await expect(page.locator('.tr-flying-file')).toHaveCount(0);
});

test('Clientes, equipos y documentos conservan sus relaciones y el foco del diálogo', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-client="2"]').click();
  await expect(page.locator('.detail-heading h4')).toHaveText('Grupo del Pacífico');
  const trigger = page.locator('[data-asset="EQ-031"]').first();
  await trigger.click();
  await expect(page.locator('#detail-title')).toHaveText('Canon imageRUNNER');
  await expect(page.locator('.timeline')).toContainText('Grupo del Pacífico');
  await page.locator('[data-doc="EQ-031"]').click();
  await expect(page.locator('.fake-document')).toContainText('DEMO-CN031');
  await page.keyboard.press('Escape');
  await expect(page.locator('#detail-dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('La búsqueda tolera tildes, muestra vacío y permite restablecer registros', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-view="clients"]').click();
  await page.locator('#search').fill('pacifico');
  await expect(page.locator('.client-card')).toHaveCount(1);
  await expect(page.locator('.detail-heading h4')).toHaveText('Grupo del Pacífico');
  await page.locator('#search').fill('no existe');
  await expect(page.locator('.empty')).toBeVisible();
  await page.locator('[data-reset-search]').click();
  await expect(page.locator('.client-card')).toHaveCount(3);
  await page.locator('[data-client="1"]').click();
  await page.locator('[data-client-docs="1"]').click();
  await expect(page.locator('.asset-row')).toHaveCount(2);
  await expect(page.locator('#search')).toHaveValue('Constructora Horizonte');
});

test('El contacto prepara la consulta con el número y correo autorizados', async ({ page }) => {
  await page.goto('/');
  // Capture the URL locally: the test never contacts WhatsApp or sends a message.
  await page.evaluate(() => { window.open = url => { window.__contactURL = url; return null; }; });
  await page.locator('#name').fill('Ana Pérez');
  await page.locator('#email').fill('ana@example.com');
  await page.locator('#need').fill('Clientes en Excel y contratos en carpetas.');
  await page.getByRole('button', { name: 'Continuar en WhatsApp' }).click();
  const captured = await page.evaluate(() => window.__contactURL);
  const url = new URL(captured);
  expect(url.origin + url.pathname).toBe('https://wa.me/51936755465');
  expect(url.searchParams.get('text')).toContain('Ana Pérez');
  expect(url.searchParams.get('text')).toContain('ana@example.com');
  expect(url.searchParams.get('text')).toContain('Clientes en Excel');
  await expect(page.locator('#contact-result')).toBeVisible();
  await expect(page.locator('#email-message')).toHaveAttribute('href', /^mailto:asesoria@nexoamedida\.com\?/);
});

test('El menú móvil funciona con teclado y mantiene contacto accesible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('#menu-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.locator('#main-nav a[href="#contacto"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#name')).toBeInViewport();
});

test('Las dudas se pueden abrir con teclado', async ({ page }) => {
  await page.goto('/');
  const question = page.locator('.faq-list summary').first();
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '');
  await expect(page.locator('.faq-list details').first().locator('p')).toBeVisible();
});

for (const viewport of [
  { width: 320, height: 740 }, { width: 375, height: 812 }, { width: 390, height: 844 },
  { width: 650, height: 900 }, { width: 768, height: 1024 }, { width: 820, height: 1180 },
  { width: 844, height: 390 }, { width: 1024, height: 768 }, { width: 1280, height: 800 },
  { width: 1440, height: 1000 }, { width: 1920, height: 1080 },
]) {
  test(`Sin desbordamiento y con controles utilizables a ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#after-button').click();
    await expect(page.locator('#scene')).toHaveAttribute('data-phase', 'after');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('[data-tr-asset="1"]').click();
    await expect(page.locator('#tr-asset-name')).toHaveText('HP DesignJet T650');
    await page.locator('[data-client="1"]').click();
    await page.locator('[data-asset="EQ-024"]').first().click();
    await expect(page.locator('#detail-dialog')).toBeVisible();
    const box = await page.locator('#detail-dialog').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    await page.keyboard.press('Escape');
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    const fontSize = await page.locator('#name').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize));
    if (viewport.width <= 650) expect(fontSize).toBeGreaterThanOrEqual(16);
    expect(errors).toEqual([]);
  });
}

test('Reflujo a 640 px, equivalente a 1280 px con zoom de navegador al 200 %', async ({ page }) => {
  // Native browser zoom changes the CSS viewport; the CSS zoom property does not.
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.hero h1')).toBeVisible();
});

test('Dominio, logotipo maestro y descargas permanecen disponibles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nexoamedida.com/');
  for (const path of ['/CNAME', '/brand/nexo-logo.svg', '/brand/Nexo-Identidad-v1.zip', '/brand/perfiles/']) {
    const response = await page.request.get(path);
    expect(response.status()).toBe(200);
    if (path === '/CNAME') expect((await response.text()).trim()).toBe('nexoamedida.com');
  }
});

test('Accesibilidad automática en escritorio y móvil, antes y después', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: axeSource });
    for (const after of [false, true]) {
      if (after) await page.locator('#after-button').click();
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
        return result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
      });
      expect(violations, `width=${width}, connected=${after}`).toEqual([]);
    }
  }
});
