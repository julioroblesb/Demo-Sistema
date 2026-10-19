import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const path='/estudio-6e94b8f2c731/';

test('El portal no aparece en la landing y solicita no indexación',async({page})=>{
 await page.goto('/');
 await expect(page.locator(`a[href*="${path}"]`)).toHaveCount(0);
 await page.goto(path);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await expect(page.locator('.privacy')).toContainText('sin contraseña');
 await expect(page.locator('.post')).toHaveCount(12);
 await expect(page.locator('.story-item')).toHaveCount(8);
 await expect(page.locator('.calendar li')).toHaveCount(20);
});

test('Los filtros y enlaces del calendario permiten encontrar cada pieza',async({page})=>{
 await page.goto(path);
 await page.locator('[data-filter="launch"]').click();
 await expect(page.locator('.post:visible')).toHaveCount(6);
 await page.locator('[data-filter="paid"]').click();
 await expect(page.locator('.post:visible')).toHaveCount(3);
 await page.locator('#search').fill('p04');
 await expect(page.locator('.post:visible')).toHaveCount(1);
 await page.locator('#search').fill('no existe');
 await expect(page.locator('#empty')).toBeVisible();
 await page.locator('.calendar a[href="#P01"]').click();
 await expect(page.locator('#P01')).toBeVisible();
 await expect(page.locator('#search')).toHaveValue('');
 await page.locator('#P01 .post-cover').click();
 await expect(page.locator('#detail-P01')).toHaveAttribute('open','');
});

test('El copy se copia y la marca de publicado persiste sólo en el navegador',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto(path+'#P01');
 await page.locator('#detail-P01 > summary').click();
 await page.locator('[data-copy="P01-fb"]').click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('Creamos software a medida');
 await page.locator('[data-done="P01"]').check();
 await page.reload();
 await expect(page.locator('[data-done="P01"]')).toBeChecked();
 await page.locator('#detail-P01 > summary').click();
 const download=page.waitForEvent('download');
 await page.locator('#P01 a[download][href$="P01-paquete.zip"]').click();
 const downloaded=await download;
 expect(downloaded.suggestedFilename()).toBe('P01-paquete.zip');
 expect(await downloaded.failure()).toBeNull();
});

test('Los archivos anunciados existen y el calendario contiene 20 eventos',async({request})=>{
 const response=await request.get(path+'plan.json');
 expect(response.ok()).toBe(true);const data=await response.json();
 const assets=[...data.posts,...data.storyItems].flatMap(item=>item.assets);
 expect(assets.filter(a=>a.type==='video')).toHaveLength(8);
 expect(assets.filter(a=>a.type==='gif')).toHaveLength(4);
 expect(assets.filter(a=>a.type==='image')).toHaveLength(57);
 for(const asset of assets){const result=await request.get(path+asset.file);expect(result.status(),asset.file).toBe(200);expect(Number(result.headers()['content-length'])).toBeGreaterThan(1000);}
 for(const name of ['Nexo-Contenido-Completo.zip','Nexo-Lanzamiento-6-publicaciones.zip','Nexo-Grilla-Calendario-y-Copies.xlsx']){const result=await request.get(path+'archivos/'+name);expect(result.status()).toBe(200);expect((await result.body()).subarray(0,2).toString()).toBe('PK');}
 const calendar=await request.get(path+'archivos/Calendario-Nexo.ics');const text=await calendar.text();expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(20);expect(text).toContain('DTSTART:20261020T150000Z');
});

test('Los videos se reproducen con controles y el GIF sólo se carga al pedirlo',async({page})=>{
 await page.goto(path+'#detail-P02');
 const video=page.locator('#P02 video').first();
 await expect(video).toHaveAttribute('controls','');
 const metadata=await video.evaluate(async el=>{el.load();await new Promise((resolve,reject)=>{el.addEventListener('loadedmetadata',resolve,{once:true});el.addEventListener('error',reject,{once:true});});return {duration:el.duration,width:el.videoWidth,height:el.videoHeight};});
 expect(metadata.duration).toBeGreaterThan(23.8);expect(metadata.duration).toBeLessThan(24.3);expect(metadata.width).toBe(1080);expect(metadata.height).toBe(1920);
 const gif=page.locator('#P02 .gif-preview');await expect(gif.locator('img')).not.toHaveAttribute('src',/.+/);
 await gif.locator('summary').click();await expect(gif.locator('img')).toHaveAttribute('src',/\.gif$/);
 await gif.locator('summary').click();await expect(gif.locator('img')).not.toHaveAttribute('src',/.+/);
});

test('Portal adaptable y auditoría automática con piezas y copies abiertos',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [320,390,820,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(path+'#detail-P01');await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.addScriptTag({content:axe});const violations=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});expect(violations,`width ${width}`).toEqual([]);
 }
 expect(errors).toEqual([]);
});
