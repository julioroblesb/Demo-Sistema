import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {WHATSAPP_TEXT} from '../integrations/outreach/templates.mjs';
import {mockWhatsAppCloud,loginWhatsApp,fillWhatsAppRequirements} from './helpers/whatsapp-cloud.js';
const require=createRequire(import.meta.url),axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');

test('WhatsApp usa el texto e imagen de Julio, valida sin enviar y registra contacto solo tras confirmación sent',async({page,context})=>{
 const mock=await mockWhatsAppCloud(context);await loginWhatsApp(page);await expect(page.locator('.wa-connection')).toContainText('WhatsApp de Julio conectado');await expect(page.getByLabel('Mensaje',{exact:true})).toHaveValue(WHATSAPP_TEXT);await expect(page.locator('.wa-preview img')).toHaveAttribute('src','https://nexoamedida.com/presentacion/Nexo-WhatsApp-Informacion.jpg');
 await fillWhatsAppRequirements(page);await page.getByRole('button',{name:'Validar sin enviar',exact:true}).click();await expect(page.locator('.wa-history')).toContainText('Validación correcta · sin envío');expect(mock.rows.filter(row=>row.kind==='activities'&&row.data.kind==='contacto')).toHaveLength(0);
 await page.getByRole('button',{name:'Enviar imagen y mensaje',exact:true}).click();await expect(page.locator('.wa-history')).toContainText('En cola');expect(mock.rows.find(row=>row.kind==='companies'&&row.id==='demo-empresa-6').data.status).toBe('nueva');
 const submissions=mock.requests.filter(row=>row.action==='submit');expect(submissions).toHaveLength(2);expect(submissions[0].requestId).toBe(submissions[1].requestId);expect(submissions[1].caption).toBe(WHATSAPP_TEXT);expect(submissions[1].dryRun).toBe(false);expect(submissions[1].consent.confirmed).toBe(true);
 await page.getByRole('button',{name:'Consultar estado',exact:true}).click();await expect(page.locator('.wa-history')).toContainText('Enviado a WhatsApp');await expect(page.locator('.wa-history')).toContainText('Esto no confirma recepción ni lectura');await page.getByRole('button',{name:'Volver',exact:true}).click();await page.getByRole('tab',{name:/Actividad/}).click();await expect(page.locator('.activity-timeline')).toContainText(WHATSAPP_TEXT.slice(0,6));expect(mock.rows.filter(row=>row.kind==='activities'&&row.data.channels?.includes('whatsapp'))).toHaveLength(1);
});

test('Un doble envío en el navegador conserva una sola solicitud',async({page,context})=>{
 const mock=await mockWhatsAppCloud(context,{delay:150});await loginWhatsApp(page);await expect(page.getByRole('button',{name:'Enviar imagen y mensaje',exact:true})).toBeEnabled();await fillWhatsAppRequirements(page);
 await page.locator('#whatsapp-send-form').evaluate(form=>{const button=form.querySelector('button[value=send]');form.requestSubmit(button);form.requestSubmit(button);});await expect(page.locator('.wa-history')).toContainText('En cola');expect(mock.submits).toBe(1);expect(mock.jobs).toHaveLength(1);
});

test('Un resultado incierto no se muestra como enviado ni repite automáticamente el mensaje',async({page,context})=>{
 const mock=await mockWhatsAppCloud(context,{uncertain:true});await loginWhatsApp(page);await fillWhatsAppRequirements(page);await page.getByRole('button',{name:'Enviar imagen y mensaje',exact:true}).click();await expect(page.locator('.wa-history')).toContainText('Resultado por verificar');expect(mock.submits).toBe(1);await expect(page.getByRole('button',{name:'Enviar imagen y mensaje',exact:true})).toBeDisabled();const id=mock.jobs[0].id;
 await page.getByRole('button',{name:'Revisar este intento',exact:true}).click();await expect(page.locator('.wa-history')).toContainText('En cola');expect(mock.requests.find(row=>row.action==='recover').jobId).toBe(id);expect(mock.jobs).toHaveLength(1);expect(mock.submits).toBe(1);
});

test('La conexión pendiente permite revisar el mensaje, pero no fingir que se puede enviar',async({page,context})=>{
 await mockWhatsAppCloud(context,{configured:false,enabled:false});await loginWhatsApp(page);await expect(page.locator('.wa-connection')).toContainText('Conexión pendiente');await expect(page.getByRole('button',{name:'Enviar imagen y mensaje',exact:true})).toBeDisabled();await expect(page.getByRole('link',{name:/Pasos de activación/})).toHaveAttribute('href','/SKYROTE13/whatsapp/');await expect(page.getByLabel('Mensaje',{exact:true})).toHaveValue(WHATSAPP_TEXT);
});

for(const width of [320,390,1280])test(`WhatsApp accesible y sin desbordamiento a ${width}px`,async({page,context})=>{
 await page.setViewportSize({width,height:900});await mockWhatsAppCloud(context);await loginWhatsApp(page);await expect(page.locator('.wa-connection')).toContainText('WhatsApp de Julio conectado');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.addScriptTag({content:axe});expect(await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(row=>({id:row.id,nodes:row.nodes.map(node=>node.target)})))).toEqual([]);
});

test('La plantilla de correo, imagen y paquete de activación existen y mantienen el formato móvil',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.route('https://nexoamedida.com/brand/nexo-logo-email.png',route=>route.fulfill({path:'public/brand/nexo-logo-email.png',contentType:'image/png'}));await page.goto('/SKYROTE13/plantillas/correo.html');await expect(page.getByText('Hola, equipo de [Empresa]:',{exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Explorar la demo',exact:true})).toHaveAttribute('href','https://nexoamedida.com/#demo');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('/SKYROTE13/whatsapp/');await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,nofollow');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);for(const path of ['/SKYROTE13/instalar-whatsapp.sql','/SKYROTE13/whatsapp/Nexo-WhatsApp-Supabase.zip','/presentacion/Nexo-WhatsApp-Informacion.jpg'])expect((await page.request.get(path)).ok()).toBe(true);
});

test('LR publicado permite validar sin vincular WhatsApp y mantiene bloqueado el envío real',async({page,context})=>{const mock=await mockWhatsAppCloud(context,{ready:false});await loginWhatsApp(page);await expect(page.locator('.wa-connection')).toContainText('Mi WhatsApp comercial');await expect(page.getByRole('button',{name:'Validar sin enviar',exact:true})).toBeEnabled();await expect(page.getByRole('button',{name:'Enviar imagen y mensaje',exact:true})).toBeDisabled();await fillWhatsAppRequirements(page);await page.getByRole('button',{name:'Validar sin enviar',exact:true}).click();await expect(page.locator('.wa-history')).toContainText('Validación correcta · sin envío');expect(mock.requests.filter(row=>row.action==='submit').every(row=>row.dryRun===true)).toBe(true);expect(mock.rows.filter(row=>row.kind==='activities'&&row.data.channels?.includes('whatsapp'))).toHaveLength(0);});
