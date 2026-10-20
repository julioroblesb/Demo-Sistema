// Branded sales documents: concrete benefit, illustrative comparison, one meeting goal.
import {readFileSync, writeFileSync} from 'node:fs';
import {chromium} from '@playwright/test';

const font = readFileSync('src/fonts/dm-sans-latin.woff2').toString('base64');
const heading = readFileSync('src/fonts/manrope-latin.woff2').toString('base64');
const logo = 'data:image/svg+xml;base64,' + readFileSync('public/brand/nexo-logo.svg').toString('base64');
const whatsapp = 'https://wa.me/51936755465?text=' + encodeURIComponent('Hola, Julio. Quisiera coordinar una demostración de Nexo de 15 minutos para mi empresa.');
const shared = `
@font-face{font-family:DM;src:url(data:font/woff2;base64,${font})}
@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${heading})}
*{box-sizing:border-box}body{margin:0;color:#202730;font-family:DM,sans-serif}
h1,h2,h3{font-family:Manrope,sans-serif;letter-spacing:-.035em}
p,h1,h2,h3{margin:0}a{color:inherit;text-underline-offset:3px}
`;

const pdf = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><link rel="icon" href="/favicon.ico"><title>Nexo | Menos búsquedas, más respuestas</title>
<style>${shared}
@page{size:A4;margin:0}
body{background:#eef2ee;font-size:10.5pt;line-height:1.55}
.sheet{width:210mm;min-height:297mm;background:white;margin:auto;padding:12mm 17mm 11mm}
header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dce4df;padding-bottom:4mm}
header img{width:34mm;height:auto}header p{font-size:9.5pt;color:#52675b;text-align:right;line-height:1.5}
h1{font-size:30pt;font-weight:750;line-height:1.15;margin:6mm 0 3mm}h1 span{color:#247459}
.lead{font-size:11.5pt;line-height:1.6;color:#52675b;max-width:168mm}
.comparison{margin-top:5mm;padding-top:4mm;border-top:1px solid #dce4df}
.comparison h2{font-size:14pt;line-height:1.4;max-width:165mm}
.comparison h2 span{display:block;font:500 9pt/1.5 DM,sans-serif;color:#607168;letter-spacing:0;margin-bottom:1mm}
.compare-grid{display:grid;grid-template-columns:1fr 8mm 1fr;gap:2mm;align-items:stretch;margin-top:3mm}
.before,.after{padding:4mm;border-radius:2mm;min-width:0}
.before{background:#f3f5f2;border:1px solid #e1e7e3}.after{background:#247459;color:white}
.label{font-size:9pt;font-weight:700;letter-spacing:.07em;line-height:1.4;margin-bottom:3mm}
.before .label{color:#52675b}.after .label{color:#fff}
.before ol{list-style:none;padding:0;margin:0;display:grid;gap:2mm;counter-reset:steps}
.before li{display:flex;gap:2.5mm;font-size:10.5pt;line-height:1.5;counter-increment:steps}
.before li::before{content:counter(steps,decimal-leading-zero);font-size:8.5pt;font-weight:600;color:#607168;padding-top:.5mm}
.connector{display:flex;align-items:center;justify-content:center;color:#247459;font-size:20pt}
.after h3{font-size:16pt;line-height:1.25;margin-bottom:3mm;max-width:66mm}
.after p{font-size:10.5pt;line-height:1.55;color:#fff}.after .relation{font-size:10pt;font-weight:600;border-top:1px solid #82b6a3;padding-top:2.5mm;margin-top:3mm}
.benefits{margin-top:5mm}.benefits h2{font-size:13pt;margin-bottom:3mm}
.benefit-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm}
.benefit{padding-top:2.5mm;border-top:2px solid #247459;min-width:0}
.benefit h3{font-size:11pt;line-height:1.4;margin-bottom:1.5mm}.benefit p{font-size:9.5pt;color:#52675b;line-height:1.6}
.meeting{margin-top:5mm;background:#20352b;color:white;padding:5mm 5.5mm;border-radius:2mm}
.meeting h2{font-size:17pt;line-height:1.3;margin-bottom:2mm}.meeting>p{font-size:10.5pt;color:#fff;max-width:155mm;line-height:1.6}
.meeting-action{display:flex;align-items:center;gap:5mm;margin-top:3mm}
.meeting-action a{display:inline-flex;align-items:center;gap:2mm;border-radius:1mm;background:white;color:#20352b;padding:2.5mm 4mm;font-size:10pt;font-weight:700;text-decoration:none;white-space:nowrap}
.meeting-action svg{width:12px;height:12px;flex:none}.meeting-action p{font-size:9pt;color:#e2ede6;line-height:1.5}
.meeting .mode{font-size:9pt;color:#e2ede6;margin-top:2.5mm}
.scope{font-size:8.5pt;color:#52675b;margin-top:3mm;line-height:1.55}
footer{display:flex;justify-content:space-between;gap:5mm;border-top:1px solid #dce4df;margin-top:3mm;padding-top:3mm;font-size:9pt;line-height:1.7}
footer a{color:#247459;text-decoration:none}footer .address{color:#52675b}
@media screen and (max-width:800px){
 .sheet{width:100%;min-height:0;padding:24px}h1{font-size:36px;margin-top:28px}.lead{font-size:17px}
 .compare-grid{grid-template-columns:1fr;gap:12px}.connector{height:20px;transform:rotate(90deg)}
 .before,.after{padding:20px}.before li,.after p{font-size:16px}.after h3{font-size:24px;max-width:none}
 .label{font-size:13px}.after .relation{font-size:15px}.comparison h2{font-size:21px}.comparison h2 span{font-size:14px}
 .benefit-grid{grid-template-columns:1fr;gap:18px}.benefit h3{font-size:18px}.benefit p{font-size:16px}
 .benefits h2{font-size:20px}.meeting h2{font-size:24px}.meeting>p{font-size:16px}.meeting-action{flex-wrap:wrap}
 .meeting-action a{font-size:15px;white-space:normal}.meeting-action p,.meeting .mode{font-size:14px}
 .scope{font-size:13px}footer{flex-wrap:wrap;font-size:14px}header p{font-size:13px}
}
@media print{body{background:white}}
</style></head><body><main class="sheet">
<header><img src="${logo}" alt="Nexo"><p>Para empresas<br>de alquiler</p></header>
<h1>Menos búsquedas.<br><span>Más respuestas.</span></h1>
<p class="lead">En Nexo desarrollamos sistemas de información a medida para que su equipo encuentre lo que necesita y continúe su trabajo.</p>
<section class="comparison" aria-labelledby="comparison-title">
<h2 id="comparison-title"><span>Una consulta cotidiana</span>¿Dónde está el contrato de este equipo?</h2>
<div class="compare-grid">
<div class="before"><p class="label">ANTES</p><ol><li>Revisar varios archivos.</li><li>Buscar entre carpetas.</li><li>Preguntar quién lo tiene.</li></ol></div>
<div class="connector" aria-hidden="true">→</div>
<div class="after"><p class="label">CON NEXO</p><h3>Consultar<br>y continuar.</h3><p>La información a mano para atender la consulta.</p><p class="relation">Equipo · Cliente · Contrato</p></div>
</div></section>
<section class="benefits" aria-labelledby="benefits-title"><h2 id="benefits-title">Lo que buscamos mejorar para su equipo</h2><div class="benefit-grid">
<div class="benefit"><h3>Atender con más agilidad.</h3><p>Encontrar la respuesta para continuar la conversación con su cliente.</p></div>
<div class="benefit"><h3>Coordinar con más claridad.</h3><p>Las áreas consultan la información que les corresponde.</p></div>
<div class="benefit"><h3>Recuperar el contexto.</h3><p>Documentos e historial relacionados con cada equipo.</p></div>
</div></section>
<section class="meeting"><h2>Veámoslo funcionar en 15 minutos.</h2><p>Le mostramos un proyecto desarrollado y revisamos juntos si ese enfoque encaja con la operación de su empresa.</p>
<div class="meeting-action"><a href="${whatsapp}">Coordinar por WhatsApp <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8"/></svg></a><p>También puede responder<br>al correo de Julio.</p></div>
<p class="mode">Reunión virtual o presencial en Lima, previa coordinación.</p></section>
<p class="scope">El sistema se diseña según sus procesos. La demostración permite evaluar qué tendría sentido desarrollar para su empresa.</p>
<footer><div><strong>Julio · Nexo</strong><br><a href="mailto:asesoria@nexoamedida.com">asesoria@nexoamedida.com</a><br><a href="https://wa.me/51936755465">+51 936 755 465</a></div><div><a href="https://nexoamedida.com">nexoamedida.com</a><br><span class="address">Jirón Tarapacá 670<br>Magdalena del Mar, Lima</span></div></footer>
</main></body></html>`;

const poster = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><link rel="icon" href="/favicon.ico"><title>Nexo | Menos búsquedas, más respuestas</title>
<style>${shared}
body{background:white;width:1080px;height:1350px}
.poster{width:1080px;height:1350px;padding:62px 72px;position:relative}
header{display:flex;justify-content:space-between;align-items:center}header img{width:242px;height:auto}
header p{color:#52675b;text-align:right;font-size:29px;line-height:1.4}
h1{font-size:82px;font-weight:750;line-height:1.12;margin-top:44px}h1 span{color:#247459}
.intro{font-size:38px;line-height:1.4;color:#52675b;margin-top:24px;max-width:925px}
.comparison{margin-top:28px}.comparison h2{font:550 36px/1.4 DM,sans-serif;letter-spacing:-.015em}
.compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}
.before,.after{min-width:0;padding:24px 28px 26px;border-radius:12px}
.before{background:#f3f5f2;border:1px solid #dce4df}.after{background:#247459;color:white}
.label{font-size:34px;font-weight:650;letter-spacing:.035em;margin-bottom:18px;line-height:1.3}
.before .label{color:#52675b}.steps{font-size:38px;line-height:1.5}
.after .result{font:650 42px/1.23 Manrope,sans-serif;letter-spacing:-.03em}
.after .relation{font-size:36px;line-height:1.45;margin-top:17px;padding-top:17px;border-top:1px solid #82b6a3}
.cta{margin-top:28px;padding:28px 32px 30px;background:#20352b;color:white;border-radius:12px}
.cta>p{font-size:35px;line-height:1.4}.cta h2{font-size:47px;font-weight:650;line-height:1.3;margin-top:7px}
.cta .action{font-size:35px;line-height:1.4;margin-top:11px;color:#fff}
footer{position:absolute;bottom:49px;left:72px;right:72px;font-size:36px;line-height:1.4;color:#52675b;display:flex;justify-content:space-between;gap:28px}
</style></head><body><main class="poster">
<header><img src="${logo}" alt="Nexo"><p>Para empresas<br>de alquiler</p></header>
<h1>Menos búsquedas.<br><span>Más respuestas.</span></h1>
<p class="intro">En Nexo creamos sistemas a medida para que su equipo encuentre la información y siga avanzando.</p>
<section class="comparison" aria-labelledby="poster-comparison-title"><h2 id="poster-comparison-title">Una consulta: «¿Dónde está el contrato?»</h2>
<div class="compare-grid"><div class="before"><p class="label">ANTES</p><p class="steps">Abrir archivos.<br>Buscar en carpetas.<br>Preguntar al equipo.</p></div><div class="after"><p class="label">CON NEXO</p><p class="result">La respuesta,<br>a mano.</p><p class="relation">Equipo, cliente<br>y contrato conectados.</p></div></div></section>
<section class="cta"><p>Vea un proyecto real, funcionando.</p><h2>¿Lo vemos en 15 minutos?</h2><p class="action">Responda a Julio para coordinar.</p></section>
<footer><span>nexoamedida.com</span><span>+51 936 755 465</span></footer>
</main></body></html>`;

writeFileSync('public/presentacion/nexo-informacion-conectada.html', pdf);
writeFileSync('public/presentacion/nexo-whatsapp-informacion.html', poster);
const browser = await chromium.launch({executablePath:'/usr/bin/chromium', args:['--no-sandbox']});
try {
  const page = await browser.newPage({viewport:{width:794,height:1123}});
  await page.setContent(pdf);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({media:'print'});
  const sheet = await page.locator('.sheet').boundingBox();
  if (sheet.height > 297 * 96 / 25.4 + 1) throw new Error('El PDF excede una página A4: ' + sheet.height);
  await page.pdf({path:'public/presentacion/Nexo-Informacion-Conectada.pdf', format:'A4', printBackground:true, tagged:true, margin:{top:'0',right:'0',bottom:'0',left:'0'}});
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:1080,height:1350});
  await page.setContent(poster);
  await page.evaluate(() => document.fonts.ready);
  const bounds = await page.evaluate(() => ({
    cta:document.querySelector('.cta').getBoundingClientRect().bottom,
    footer:document.querySelector('footer').getBoundingClientRect().top,
    width:document.documentElement.scrollWidth,
    overflow:[...document.querySelectorAll('h1,h2,p,footer')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent),
  }));
  if (bounds.cta > bounds.footer - 28 || bounds.width > 1080 || bounds.overflow.length) {
    throw new Error('El contenido del JPG excede su formato: ' + JSON.stringify(bounds));
  }
  await page.screenshot({path:'public/presentacion/Nexo-WhatsApp-Informacion.jpg',type:'jpeg',quality:94});
} finally {
  await browser.close();
}
console.log('Campaña actualizada: PDF de una página A4 y JPG 1080 × 1350 para WhatsApp.');
