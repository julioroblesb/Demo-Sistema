import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {today,addDays} from '../src/crm/domain.js';
const require=createRequire(import.meta.url),axe=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
async function enter(page){await page.goto('/SKYROTE13/');await page.getByRole('button',{name:'Explorar con datos de prueba'}).click();await page.goto('/SKYROTE13/#pipeline');}
const cardFor=(page,id)=>page.locator(`[data-company-card="${id}"]`);
async function contact(page,id='demo-empresa-6'){
 await cardFor(page,id).getByRole('button',{name:'Marcar contactado',exact:true}).click();await page.getByRole('checkbox',{name:'WhatsApp',exact:true}).check();await page.getByRole('checkbox',{name:'Correo',exact:true}).check();await page.getByRole('button',{name:'Guardar contacto',exact:true}).click();await expect(page.locator('#record-dialog')).not.toBeVisible();
}
async function respond(page,positive,id='demo-empresa-6'){
 await cardFor(page,id).getByRole('button',{name:'Registrar respuesta',exact:true}).click();await page.getByRole('radio',{name:positive?/^Positiva/:/^Negativa/}).check();await page.getByRole('button',{name:'Guardar respuesta',exact:true}).click();await expect(page.locator('#record-dialog')).not.toBeVisible();
}

test('Respuesta positiva → Seguimiento con proforma → negativa cierra tareas y mantiene los importes anteriores',async({page})=>{
 await enter(page);await contact(page);await respond(page,true);
 const card=cardFor(page,'demo-empresa-6');await expect(page.locator('.propuesta')).toContainText('Herramientas Norte');await expect(card).toContainText('Respuesta positiva');
 await card.getByRole('button',{name:'Agendar tarea',exact:true}).click();const kind=page.getByLabel('Tipo de tarea',{exact:true});for(const value of ['reunion','cotizacion','proforma','visita'])await expect(kind.locator(`option[value="${value}"]`)).toHaveCount(1);
 await kind.selectOption('proforma');await page.getByLabel('Qué tienes que hacer',{exact:true}).fill('Preparar proforma para Herramientas Norte');await page.getByLabel('Fecha',{exact:true}).fill(addDays(today(),1));await page.getByLabel('Hora de Lima',{exact:false}).fill('10:30');await page.getByRole('button',{name:'Guardar tarea',exact:true}).click();await expect(card).toContainText('Preparar proforma');await expect(card).toContainText('10:30');
 await respond(page,false);await expect(page.locator('.perdida')).toContainText('Herramientas Norte');await expect(card).toContainText('Respuesta negativa');await expect(card.getByRole('button',{name:'Agendar tarea',exact:true})).toHaveCount(0);
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-crm-demo-v1')));expect(data.tasks.find(row=>row.title==='Preparar proforma para Herramientas Norte').status).toBe('cancelada');expect(data.deals.find(row=>row.id==='demo-deal-3').stage).toBe('ganada');expect(data.deals.find(row=>row.id==='demo-deal-3').paid_cents).toBe(260000);expect(data.payments).toHaveLength(1);
 await page.getByRole('button',{name:'Tabla',exact:true}).click();await expect(page.locator('[data-company-row=demo-empresa-6]')).toContainText('Seguimiento cerrado');await page.goto('/SKYROTE13/#agenda');await expect(page.locator('.day-panel')).not.toContainText('Preparar proforma para Herramientas Norte');await page.reload();await page.goto('/SKYROTE13/#pipeline');await expect(card).toContainText('Respuesta negativa');
});

test('Arrastrar a Contactado abre los canales y cancelar conserva Filtrado',async({page})=>{
 await enter(page);const card=cardFor(page,'demo-empresa-3');await card.dragTo(page.locator('[data-drop-stage=demo]>header'),{sourcePosition:{x:10,y:10},targetPosition:{x:15,y:10}});
 await expect(page.locator('#contact-log-form')).toBeVisible();await page.getByRole('button',{name:'Cancelar',exact:true}).click();await expect(page.locator('.diagnostico')).toContainText('Escena Eventos');
 await card.getByRole('button',{name:'Mover',exact:true}).click();await expect(page.locator('.move-stage-list>button')).toHaveCount(5);await page.locator('.move-stage-list [data-type=demo]').click();await page.getByRole('checkbox',{name:'Llamada',exact:true}).check();await page.getByRole('button',{name:'Guardar contacto',exact:true}).click();await expect(page.locator('.demo')).toContainText('Escena Eventos');await expect(card.locator('.contact-channel-list')).toHaveText('Llamada');
});

test('Dos oportunidades de la misma empresa producen una tarjeta y conservan el acceso a ambas',async({page})=>{
 await enter(page);await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('nexo-crm-demo-v1'));data.deals.push({...data.deals[0],id:'second-deal',title:'Segundo proyecto para Andina'});localStorage.setItem('nexo-crm-demo-v1',JSON.stringify(data));});await page.reload();const card=cardFor(page,'demo-empresa-1');await expect(card).toHaveCount(1);await card.getByRole('button',{name:'2 oportunidades',exact:true}).click();await expect(page.locator('.related-deals>button')).toHaveCount(2);await page.getByRole('button',{name:/Segundo proyecto para Andina/}).click();await expect(page.locator('#dialog-title')).toHaveText('Segundo proyecto para Andina');
});

test('Editar una oportunidad para pasarla a Contactado también exige los canales',async({page})=>{
 await enter(page);await cardFor(page,'demo-empresa-1').getByRole('button',{name:'1 oportunidad',exact:true}).click();await page.locator('[data-action=open-deal][data-id=demo-deal-1]').click();await page.getByRole('button',{name:'Editar',exact:true}).click();await page.getByLabel('Etapa',{exact:true}).selectOption('demo');await expect(page.locator('#deal-contact-fields')).toBeVisible();await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await expect(page.locator('#deal-form .form-error')).toContainText('al menos un canal');await page.getByRole('checkbox',{name:'WhatsApp',exact:true}).check();await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await page.locator('#dialog-close').click();await expect(page.locator('.demo')).toContainText('Andina Equipos');await expect(cardFor(page,'demo-empresa-1').locator('.contact-channel-list')).toHaveText('WhatsApp');
});

test('Contacto y respuesta siguen accesibles y sin desbordamiento en 320 px',async({page})=>{
 await page.setViewportSize({width:320,height:740});await enter(page);await expect(page.locator('.pipeline-table')).toBeVisible();await page.getByRole('button',{name:'Tablero',exact:true}).click();await contact(page);await expect(cardFor(page,'demo-empresa-6')).toContainText('Último contacto');
 await cardFor(page,'demo-empresa-6').getByRole('button',{name:'Registrar respuesta',exact:true}).click();await page.addScriptTag({content:axe});expect(await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(row=>({id:row.id,targets:row.nodes.map(node=>node.target)})))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.getByRole('radio',{name:/^Positiva/}).check();await page.getByRole('button',{name:'Guardar respuesta',exact:true}).click();await page.getByRole('button',{name:'Tabla',exact:true}).click();await expect(page.locator('[data-company-row=demo-empresa-6]')).toContainText('Respuesta positiva');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('/SKYROTE13/#empresas');await expect(page.locator('.company-table tbody tr').filter({hasText:'Herramientas Norte'})).toContainText('Respuesta positiva');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('Mover a Ganado pide importe y fecha, registra la venta y conserva una sola tarjeta',async({page})=>{
 await enter(page);const card=cardFor(page,'demo-empresa-6');await card.getByRole('button',{name:'Mover',exact:true}).click();await page.locator('.move-stage-list [data-type=ganada]').click();await page.getByLabel('Importe estimado o acordado',{exact:true}).fill('4500');await page.getByLabel('Fecha de entrega',{exact:false}).fill(addDays(today(),15));await page.getByRole('button',{name:'Crear oportunidad',exact:true}).click();await expect(page.locator('.deal-finance')).toContainText('4,500.00');await expect(page.locator('.milestone-row')).toHaveCount(3);await page.locator('#dialog-close').click();await expect(page.locator('.ganada')).toContainText('Herramientas Norte');await expect(card).toHaveCount(1);const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-crm-demo-v1')));expect(data.companies.find(row=>row.id==='demo-empresa-6').status).toBe('cliente');expect(data.deals.filter(row=>row.company_id==='demo-empresa-6')).toHaveLength(1);
});

test('Editar la entrega de una venta anterior no cambia el ciclo comercial reabierto',async({page})=>{
 await enter(page);const card=cardFor(page,'demo-empresa-5');await card.getByRole('button',{name:'Mover',exact:true}).click();await page.locator('.move-stage-list [data-type=propuesta]').click();await page.getByRole('button',{name:'Reabrir seguimiento',exact:true}).click();await expect(page.locator('.propuesta')).toContainText('Proyección AV');
 await card.getByRole('button',{name:'Agendar tarea',exact:true}).click();await page.getByLabel('Qué tienes que hacer',{exact:true}).fill('Cotización de la segunda etapa');await page.getByLabel('Tipo de tarea',{exact:true}).selectOption('cotizacion');await page.getByLabel('Fecha',{exact:true}).fill(addDays(today(),2));await page.getByRole('button',{name:'Guardar tarea',exact:true}).click();
 await card.getByRole('button',{name:'1 oportunidad',exact:true}).click();await page.locator('[data-action=open-deal][data-id=demo-deal-3]').click();await page.getByRole('tab',{name:'Cobros y entrega',exact:true}).click();await page.getByRole('button',{name:'Editar fechas y estado',exact:true}).click();await page.getByLabel('Fecha de entrega',{exact:false}).fill(addDays(today(),20));await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();await page.locator('#dialog-close').click();
 await expect(page.locator('.propuesta')).toContainText('Proyección AV');await expect(card).toContainText('Cotización de la segunda etapa');const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-crm-demo-v1')));expect(data.deals.find(row=>row.id==='demo-deal-3').stage).toBe('ganada');expect(data.payments[0].amount_cents).toBe(260000);expect(data.tasks.find(row=>row.title==='Cotización de la segunda etapa').status).toBe('pendiente');
});
