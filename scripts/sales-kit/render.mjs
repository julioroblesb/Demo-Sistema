import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();
await page.setContent(readFileSync('public/presentacion/nexo-alquileres.html','utf8'),{waitUntil:'load'});
await page.evaluate(()=>document.fonts.ready);
await page.pdf({path:'public/presentacion/Nexo-Alquileres-Presentacion.pdf',format:'A4',printBackground:true,tagged:true,margin:{top:'0',right:'0',bottom:'0',left:'0'}});
await browser.close();
