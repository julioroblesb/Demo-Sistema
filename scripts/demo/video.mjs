// Record the actual demo, not a separate invented interface. Native video is loaded on demand.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const origin = process.env.NEXO_PREVIEW_URL || 'http://127.0.0.1:4192';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
mkdirSync('/tmp/nexo-demo-video', { recursive: true });
for (const [format, viewport] of [['escritorio', { width: 1280, height: 900 }], ['vertical', { width: 540, height: 960 }]]) {
  const context = await browser.newContext({ viewport, recordVideo: { dir: '/tmp/nexo-demo-video', size: viewport }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `html{scroll-behavior:auto!important}body{background:#EEF2EE}.header,.hero,.service-bridge,.process-section,.faq-section,.contact-section,.footer,.demo-heading,.demo-outro,.demo-disclosure>summary,.demo-guide,.demo-instruction,.demo-hint{display:none!important}.demo-section{width:100%;padding:115px 35px 25px!important}.demo-disclosure{margin:0;border:0;padding:0;background:none}.app-shell{min-height:0}.app-content{padding:25px}.app-topbar{display:none}.client-grid{margin-top:20px}.app-brand,.workspace{display:none}.sidebar{width:170px;padding-top:22px}.demo-caption{position:fixed;z-index:100;top:0;left:0;width:100%;height:96px;padding:21px 35px;background:#20352B;color:white;display:flex;align-items:center;gap:18px;font-size:23px;line-height:1.4}.demo-caption b{border:1px solid #729D80;border-radius:50%;width:43px;height:43px;display:grid;place-items:center;flex-shrink:0;font-size:18px}.demo-caption small{font-size:12px;color:#BED0C3;display:block;margin-top:3px}dialog{margin:115px auto 20px;max-height:calc(100vh - 135px);width:720px;padding:26px}dialog::backdrop{background:#EEF2EE}.dialog-close,.modal-note{display:none}.equipment-heading{margin:0}.equipment-picture{width:120px;height:105px}.equipment-facts{padding:15px 0;gap:13px}.history-heading{margin-top:18px}.timeline{margin-top:12px}.timeline li{padding-bottom:18px}.timeline p{margin-top:4px}.report-link{margin-top:8px}.document-preview{padding:19px}.document-preview h3{margin-top:17px}.document-context{padding-bottom:14px;gap:8px}.document-preview .modal-title{margin-bottom:15px}.document-back{display:none}.document-actions{margin-top:14px}@media(max-width:650px){.demo-section{padding:112px 15px 20px!important}.demo-caption{padding:18px 20px;font-size:19px}.demo-caption b{width:35px;height:35px;font-size:15px}.sidebar{width:100%;padding:0}.app-content{padding:18px!important}.client-grid{gap:6px;margin-block:12px}.client-card{min-height:60px;padding-block:8px!important}.detail-heading{padding:12px}.demo-disclosure .asset-row{padding:10px 12px;gap:2px 8px}.demo-disclosure .row-arrow{min-height:25px}.app-title{margin-bottom:12px}.search-box{display:none}dialog{width:calc(100% - 30px);margin-top:112px;padding:22px;max-height:calc(100vh - 128px)}.equipment-facts{padding:15px 0;gap:13px}.equipment-heading .modal-title{font-size:30px}.timeline strong{font-size:14px}.timeline li{padding-bottom:17px}.document-preview>p,.document-preview li{font-size:14px}.document-preview h3{margin-top:15px}.document-masthead{margin-bottom:15px;padding-bottom:10px}.document-preview .modal-title{font-size:25px}.document-actions .button{width:100%}.document-actions .quiet-link{display:none}}` });
  await page.evaluate(() => {
    document.querySelector('#demo-disclosure').open = true;
    const bar = document.createElement('div'); bar.className = 'demo-caption'; bar.id = 'recording-caption'; document.body.append(bar);
  });
  const chapter = async (n, label) => {
    // The caption is included in the modal when open so it stays above the native top layer.
    await page.evaluate(({ n, label }) => {
      const bar = document.querySelector('#recording-caption');
      const dialog = document.querySelector('#detail-dialog');
      (dialog.open ? dialog : document.body).append(bar);
      bar.innerHTML = `<b>${n}</b><div>${label}<small>Nexo · Recorrido de la demo</small></div>`;
    }, { n, label });
  };
  await chapter(1, 'Elige un cliente. Aquí están sus equipos.');
  await page.locator('[data-client="1"]').click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(200);
  const start = Date.now();
  // A poster that is meaningful before the video is loaded.
  await page.screenshot({ path: `public/demo/recorrido-${format}.jpg`, type: 'jpeg', quality: 87 });
  const waitUntil = async seconds => { const ms = start + seconds * 1000 - Date.now(); if (ms > 0) await page.waitForTimeout(ms); };
  await waitUntil(5);
  await page.locator('[data-asset="EQ-024"]').first().click();
  await chapter(2, 'Abre la impresora. Consulta su historial.');
  await waitUntil(10);
  // Preserve the overlay before replacing the dialog contents.
  await page.evaluate(() => document.body.append(document.querySelector('#recording-caption')));
  await page.locator('[data-doc="EQ-024-mantenimiento"]').click();
  await chapter(3, 'Lee el mantenimiento. Descarga su PDF.');
  await waitUntil(18.5);
  const video = page.video();
  await context.close();
  const path = await video.path();
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path], { encoding: 'utf8' }).trim());
  const offset = Math.max(0, duration - 18.5);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', String(offset), '-i', path, '-t', '18', '-an', '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `public/demo/recorrido-${format}.mp4`]);
  console.log(`Recorded ${format}: 18 seconds.`);
}
await browser.close();
