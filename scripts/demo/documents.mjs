// Rebuild the downloadable documents from the same records used by the interactive demo.
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
const data = JSON.parse(readFileSync('src/demo-data.json', 'utf8'));
const font = readFileSync('src/fonts/dm-sans-latin.woff2').toString('base64');
const logo = readFileSync('public/brand/nexo-logo.svg').toString('base64');
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
mkdirSync('public/demo/reportes', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage();
for (const doc of data.documents) {
  const asset = data.assets.find(asset => asset.id === doc.asset);
  const client = data.clients.find(client => client.id === asset.client);
  await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Nexo | ${escape(doc.title)} | ${asset.id}</title><style>
  @font-face{font-family:DM;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;font-family:DM,sans-serif;color:#202730;line-height:1.65;font-size:12pt}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #CAD8CE;padding-bottom:20px}header img{width:145px}header span{font-size:10pt;color:#607168}h1{font-size:27pt;line-height:1.2;letter-spacing:-1px;margin:12px 0 30px}h2{font-size:13pt;margin:24px 0 7px}p{margin:0 0 12px}.ref{color:#607168;font-size:10pt;margin-top:30px}dl{display:grid;grid-template-columns:1fr 1fr;gap:18px 24px;background:#EEF2EE;padding:22px;margin:0 0 26px}dt{font-size:9pt;color:#607168}dd{margin:3px 0 0;font-size:11pt}ul{padding-left:20px}li{margin:8px 0}.result{background:#EEF2EE;color:#247459;padding:14px 20px;margin-top:25px;font-weight:bold}footer{margin-top:35px;border-top:1px solid #CAD8CE;padding-top:16px;font-size:9pt;color:#607168}</style></head><body>
  <header><img src="data:image/svg+xml;base64,${logo}" alt="Nexo"><span>Demo · Alquiler de equipos</span></header><p class="ref">${escape(doc.date)} · ${escape(doc.id)}</p><h1>${escape(doc.title)}</h1>
  <dl><div><dt>Cliente</dt><dd>${escape(client.name)}</dd></div><div><dt>Equipo</dt><dd>${escape(asset.name)} ${escape(asset.model)}</dd></div><div><dt>Código / Serie</dt><dd>${asset.id} / ${asset.serial}</dd></div><div><dt>Ubicación</dt><dd>${escape(asset.location)}</dd></div></dl>
  <h2>${doc.kind === 'mantenimiento' ? 'Motivo de la revisión' : 'Detalle del registro'}</h2><p>${escape(doc.summary)}</p><h2>${doc.kind === 'mantenimiento' ? 'Trabajo realizado' : 'Información asociada'}</h2><ul>${doc.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul><p class="result">${escape(doc.result)}</p>${doc.next ? `<h2>Recomendación</h2><p>${escape(doc.next)}</p>` : ''}
  <footer>Documento de la demo de Nexo · nexoamedida.com<br>${doc.kind === 'contrato' ? 'Resumen ilustrativo: no constituye un contrato de alquiler.' : 'Este registro forma parte de un ejemplo de uso del sistema.'}</footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: 'public' + doc.file, format: 'A4', printBackground: true, tagged: true, margin: { top: '19mm', bottom: '19mm', left: '20mm', right: '20mm' } });
}
await browser.close();
console.log(`Generated ${data.documents.length} linked PDFs.`);
