import { chromium } from '@playwright/test';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

import { execFileSync } from 'node:child_process';
const root = resolve('../deliverables/nexo-identidad');
if (!existsSync(root)) throw new Error('Run scripts/brand/generate.py first.');
const server = createServer((req, res) => {
  const path = resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
  try {
    const type = path.endsWith('.html') ? 'text/html; charset=utf-8' : path.endsWith('.woff2') ? 'font/woff2' : path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.png') ? 'image/png' : 'application/octet-stream';
    const body = readFileSync(path);
    res.writeHead(200, { 'Content-Type': type }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/01-Manual/Nexo-Manual-de-Identidad.html`);
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: root + '/01-Manual/Nexo-Manual-de-Identidad.pdf', preferCSSPageSize: true, printBackground: true, tagged: true });
await browser.close();
server.close();
for (const file of ['Nexo-Manual-de-Identidad.pdf', 'Nexo-Brand-Board.png', 'Nexo-Brand-Board.jpg']) copyFileSync(root + '/01-Manual/' + file, 'public/brand/' + file);
copyFileSync(root + '/02-Logos/SVG/nexo-horizontal-principal.svg', 'public/brand/nexo-logo.svg');
for (const [file, target] of [['favicon.ico', 'favicon.ico'], ['icono-32.png', 'favicon-32.png'], ['icono-180.png', 'apple-touch-icon.png']]) copyFileSync(root + '/05-Aplicaciones/' + file, 'public/' + target);
execFileSync('python3', ['-c', `import pathlib, zipfile, sys
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile('public/brand/Nexo-Identidad-v1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file(): z.write(p,'Nexo-Identidad/'+str(p.relative_to(root)))
with zipfile.ZipFile('public/brand/Nexo-Identidad-v1.zip') as z: assert z.testzip() is None
`, root]);
await import('../site-icons.mjs');
console.log('Brand manual, logo exports, archive and site icons updated.');
