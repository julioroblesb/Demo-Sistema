import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

test('La oferta y ambos resultados se entienden sin reproducir la explicación', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Tu empresa en un solo sistema');
  await expect(page.locator('.hero-copy')).toContainText('Software a medida');
  await expect(page.locator('#before-title')).toBeVisible();
  await expect(page.locator('#after-title')).toBeVisible();
  await expect(page.locator('.linked-record')).toContainText('Contrato asociado');
  await expect(page.locator('#demo-disclosure')).not.toHaveAttribute('open', '');
  await page.locator('.service-bridge a').click();
  await expect(page.locator('#demo-disclosure')).toHaveAttribute('open', '');
  await page.locator('[data-guide="asset"]').click();
  await expect(page.locator('#detail-title')).toHaveText('Impresora');
  await page.keyboard.press('Escape');
  await page.locator('[data-guide="document"]').click();
  await expect(page.locator('#detail-title')).toHaveText('Reporte de mantenimiento');
});

test('La explicación puede pausarse, continuar, terminar y repetirse', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('#story-play').click();
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '0');
  await page.clock.runFor(1000);
  await page.locator('#story-play').click();
  await expect(page.locator('#story-play')).toHaveAttribute('aria-pressed', 'false');
  await page.clock.runFor(5000);
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '0');
  await page.locator('#story-play').click();
  await page.clock.runFor(2100);
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '1');
  await page.clock.runFor(6000);
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', 'complete');
  await page.locator('#story-play').click();
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '0');
  await page.locator('[data-story-step="2"]').click();
  await expect(page.locator('#story-play')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#story-caption')).toContainText('historial');
});

test('Movimiento reducido ofrece pasos manuales y nunca inicia una reproducción', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#story-play').click();
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '0');
  await expect(page.locator('#story-play')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#story-play').click();
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '1');
  await page.locator('[data-story-step="2"]').click();
  await expect(page.locator('.comparison')).toHaveAttribute('data-step', '2');
});

test('La comparación conserva su explicación y la demo informa su requisito sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4181/');
  await expect(page.locator('#before-title')).toBeVisible();
  await expect(page.locator('#after-title')).toBeVisible();
  await page.locator('#demo-disclosure > summary').click();
  await expect(page.locator('.demo-instruction-static')).toContainText('activa JavaScript');
  await context.close();
});

test('Clientes, equipos y documentos conservan sus relaciones y el foco del diálogo', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demo-disclosure > summary').click();
  await page.locator('[data-client="2"]').click();
  await expect(page.locator('.detail-heading h4')).toHaveText('Grupo del Pacífico');
  const trigger = page.locator('[data-asset="EQ-031"]').first();
  await trigger.click();
  await expect(page.locator('#detail-title')).toHaveText('Tablet');
  await expect(page.locator('.timeline')).toContainText('Grupo del Pacífico');
  await page.locator('[data-doc="EQ-031-mantenimiento"]').click();
  await expect(page.locator('.document-preview')).toContainText('SG-031');
  await page.keyboard.press('Escape');
  await expect(page.locator('#detail-dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('La búsqueda tolera tildes, muestra vacío y permite restablecer registros', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demo-disclosure > summary').click();
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
  await expect(page.locator('.asset-row')).toHaveCount(6);
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
    await page.locator('[data-story-step="2"]').click();
    await expect(page.locator('.comparison')).toHaveAttribute('data-step', '2');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#demo-disclosure > summary').click();
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
      if (after) {
        await page.locator('[data-story-step="2"]').click();
        await page.locator('#demo-disclosure > summary').click();
      }
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
        return result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
      });
      expect(violations, `width=${width}, connected=${after}`).toEqual([]);
    }
  }
});

test('Cada tipo de equipo tiene su mantenimiento, PDF legible y relación correcta', async ({ page }) => {
  const data = JSON.parse(readFileSync('src/demo-data.json', 'utf8'));
  await page.goto('/#demo');
  await page.locator('[data-view="assets"]').click();
  for (const asset of data.assets) {
    await page.locator(`[data-asset="${asset.id}"]`).click();
    await expect(page.locator('#detail-title')).toHaveText(asset.name);
    await expect(page.locator('.equipment-model-name')).toHaveText(asset.model);
    await expect(page.locator('.timeline')).toContainText(asset.service);
    await page.locator(`[data-doc="${asset.id}-mantenimiento"]`).click();
    await expect(page.locator('.document-preview')).toContainText(asset.finding);
    for (const item of asset.work) await expect(page.locator('.document-preview')).toContainText(item);
    const download = page.locator('.document-actions a[download]');
    await expect(download).toHaveAttribute('href', `/demo/reportes/${asset.id}-mantenimiento.pdf`);
    const file = await page.request.get(await download.getAttribute('href'));
    expect(file.ok()).toBe(true);
    expect((await file.body()).subarray(0, 5).toString()).toBe('%PDF-');
    await page.locator('.document-back').click();
    await expect(page.locator('#detail-title')).toHaveText(asset.name);
    await page.keyboard.press('Escape');
  }
  for (const doc of data.documents) {
    const response = await page.request.get(doc.file);
    expect(response.status(), doc.file).toBe(200);
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  }
});

test('La portada abre la ficha sin registro y restaura el foco al cerrar', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-open-example]').click();
  await expect(page.locator('#detail-title')).toHaveText('Impresora');
  await page.locator('[data-doc="EQ-024-mantenimiento"]').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('.document-actions a[download]').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('EQ-024-mantenimiento.pdf');
  expect(await download.failure()).toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-open-example]')).toBeFocused();
});

test('Favicon y títulos breves en landing, marca, perfiles y contenido', async ({ page }) => {
  for (const route of ['/', '/brand/', '/brand/perfiles/', '/estudio-6e94b8f2c731/']) {
    await page.goto(route);
    expect(await page.title()).toMatch(/^Nexo \| .+/);
    expect((await page.title()).length).toBeLessThanOrEqual(25);
    for (const href of ['/favicon.ico', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png']) {
      await expect(page.locator(`link[href="${href}"]`)).toHaveCount(1);
      const response = await page.request.get(href);
      expect(response.status()).toBe(200);
      expect((await response.body()).length).toBeGreaterThan(100);
    }
  }
});

test('Video bajo demanda, formato adaptable, reproducción y pausa al cerrar', async ({ page }) => {
  const mediaRequests = [];
  page.on('request', req => { if (/recorrido-.*\.mp4/.test(req.url())) mediaRequests.push(req.url()); });
  for (const [width, format] of [[1440, 'escritorio'], [390, 'vertical']]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const before = mediaRequests.length;
    expect(await page.locator('video').count()).toBe(0);
    await page.locator('#watch-demo').click();
    await expect(page.locator('video source')).toHaveAttribute('src', `/demo/recorrido-${format}.mp4`);
    await expect(page.locator('video')).toHaveAttribute('preload', 'none');
    expect(mediaRequests.length).toBe(before);
    await page.locator('video').evaluate(video => video.play());
    await expect.poll(() => page.locator('video').evaluate(video => video.currentTime)).toBeGreaterThan(.1);
    const duration = await page.locator('video').evaluate(video => video.duration);
    expect(duration).toBeGreaterThanOrEqual(17.9);
    expect(duration).toBeLessThanOrEqual(18.2);
    await page.keyboard.press('Escape');
    expect(await page.locator('video').evaluate(video => video.paused)).toBe(true);
    await expect(page.locator('#watch-demo')).toBeFocused();
  }
});

test('Accesibilidad de fichas, reportes y video en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.addScriptTag({ content: axeSource });
  const check = async () => {
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })));
    expect(violations).toEqual([]);
  };
  await page.locator('[data-open-example]').click(); await check();
  await page.locator('[data-doc="EQ-024-mantenimiento"]').click(); await check();
  await page.keyboard.press('Escape');
  await page.locator('#watch-demo').click(); await check();
});
