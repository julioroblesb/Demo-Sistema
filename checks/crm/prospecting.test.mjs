import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,TASK_KINDS,emptyData,companyStage,contactHistory,dealStageKey,validateRecord} from '../../src/crm/domain.js';
import {contactOperations,responseOperations,stageOperations} from '../../src/crm/prospecting.js';
import {checkOperations,ConflictError} from '../../src/crm/repository.js';
import {backup,parseBackup} from '../../src/crm/import-export.js';

const now=new Date('2026-10-20T03:12:45.000Z');
function initial(){const data=emptyData();data.companies=[{id:'company',name:'Alquileres Perú',status:'nueva',version:1}];return data;}
function apply(data,operations){const next=checkOperations(data,operations);for(const {type,record} of operations){const row=next[type].find(row=>row.id===record.id);row.version=(data[type].find(row=>row.id===record.id)?.version||0)+1;}return next;}
const company=data=>data.companies[0];
const contact=(data,channels=['correo','whatsapp'],options={})=>apply(data,contactOperations(data,company(data),channels,{now,...options}));

test('Solo cinco etapas, con lectura compatible de los estados y oportunidades anteriores',()=>{
 assert.deepEqual(Object.values(STAGES),['Filtrado','Contactado','Seguimiento','Ganado','Perdido']);
 const data=initial(),snapshot=JSON.stringify(data);
 for(const [status,stage] of Object.entries({nueva:'diagnostico',investigada:'diagnostico',contactada:'demo',conversacion:'propuesta',calificada:'propuesta',cliente:'ganada',no_encaja:'perdida',no_contactar:'perdida'}))assert.equal(companyStage({...company(data),status},data),stage,status);
 data.deals=[{id:'old',company_id:'company',stage:'demo'}];assert.equal(companyStage(company(data),data),'propuesta');
 assert.equal(dealStageKey({stage:'demo',pipeline_version:2}),'demo');assert.equal(dealStageKey({stage:'negociacion'}),'propuesta');
 data.deals=[];assert.equal(JSON.stringify(data),snapshot);
});

test('Contactado exige canales reales, admite multiselección y guarda el instante y la hora de Lima',()=>{
 const data=initial();
 assert.throws(()=>contactOperations(data,company(data),[]),/al menos un canal/);
 assert.throws(()=>contactOperations(data,company(data),['inventado']),/canales/);
 assert.throws(()=>stageOperations(data,company(data),'demo'),/canales/);
 const next=contact(data,['whatsapp','correo','whatsapp']);
 assert.equal(companyStage(company(next),next),'demo');assert.equal(next.deals.length,0);
 const history=contactHistory('company',next);
 assert.deepEqual(history.channels,['correo','whatsapp']);assert.equal(history.at,now.toISOString());
 assert.equal(history.contact.date,'2026-10-19');assert.equal(history.contact.time,'22:12');assert.equal(history.response,null);
 assert.equal(data.activities.length,0);assert.equal(company(data).status,'nueva');
});

test('Una respuesta positiva abre Seguimiento y no altera la fecha del contacto saliente',()=>{
 const data=contact(initial());const next=apply(data,responseOperations(data,company(data),'conversacion',{now:new Date('2026-10-21T14:40:00Z'),contactId:contactHistory('company',data).contact.id}));
 assert.equal(companyStage(company(next),next),'propuesta');assert.equal(next.deals.length,0);
 const history=contactHistory('company',next);assert.equal(history.at,now.toISOString());assert.equal(history.response.outcome,'conversacion');assert.equal(history.response.occurred_at,'2026-10-21T14:40:00.000Z');
});

test('Un nuevo contacto en Seguimiento conserva la etapa y deja pendiente su propia respuesta',()=>{
 let data=contact(initial());data=apply(data,responseOperations(data,company(data),'conversacion',{now:new Date('2026-10-20T14:00:00Z')}));
 const next=contact(data,['llamada'],{now:new Date('2026-10-22T16:00:00Z')});
 assert.equal(companyStage(company(next),next),'propuesta');assert.equal(next.activities.filter(row=>row.kind==='contacto').length,2);
 assert.equal(contactHistory('company',next).response,null);assert.deepEqual(contactHistory('company',next).channels,['llamada']);
});

test('Una respuesta negativa cierra oportunidades y tareas comerciales, conservando ventas, cobros y entregas',()=>{
 let data=contact(initial());
 const open={id:'open',company_id:'company',title:'Nueva implementación',stage:'propuesta',amount_cents:20000,paid_cents:0,currency:'PEN',next_step:'Visitar',next_action_date:'2026-10-21',version:1};
 const won={...open,id:'won',title:'Proyecto anterior',stage:'ganada',amount_cents:100000,paid_cents:25000,closed_date:'2026-10-01',delivery_date:'2026-11-01'};
 data.deals=[open,won];data.payments=[{id:'payment',deal_id:'won',amount_cents:25000,date:'2026-10-01',voided:false,version:1}];
 data.milestones=[{id:'milestone',deal_id:'won',title:'Entregar',done:false,version:1}];
 const task={title:'Acción pendiente',company_id:'company',due_date:'2026-10-21',status:'pendiente',kind:'reunion',version:1};
 data.tasks=[{...task,id:'commercial',deal_id:'open'},{...task,id:'unlinked',deal_id:''},{...task,id:'delivery',kind:'entrega',deal_id:''},{...task,id:'won-task',deal_id:'won'},{...task,id:'done',status:'hecha',deal_id:'open'}];
 const preserved=JSON.stringify({deal:won,payments:data.payments,milestones:data.milestones});
 const next=apply(data,responseOperations(data,company(data),'no_interes',{body:'No desea continuar.',now}));
 assert.equal(companyStage(company(next),next),'perdida');assert.equal(company(next).status,'no_contactar');
 assert.equal(next.deals[0].stage,'perdida');assert.equal(next.deals[0].next_step,'');assert.equal(next.deals[0].lost_reason,'No desea continuar.');
 assert.deepEqual(next.tasks.map(row=>row.status),['cancelada','cancelada','pendiente','pendiente','hecha']);
 assert.equal(JSON.stringify({deal:next.deals[1],payments:next.payments,milestones:next.milestones}),preserved);
 assert.equal(contactHistory('company',next).response.outcome,'no_interes');
 assert.throws(()=>contactOperations(next,company(next),['correo']),/cerrado/);
 assert.throws(()=>responseOperations(next,company(next),'conversacion'),/cerrada/);
});

test('No se puede guardar una respuesta sin contacto salvo registros anteriores ya contactados',()=>{
 const data=initial();assert.throws(()=>responseOperations(data,company(data),'conversacion'),/primero el contacto/);
 company(data).status='contactada';const next=apply(data,responseOperations(data,company(data),'conversacion',{now}));
 assert.equal(companyStage(company(next),next),'propuesta');assert.equal(contactHistory('company',next).contact,null);assert.equal(contactHistory('company',next).response.outcome,'conversacion');
});

test('Una edición o respuesta desde un dispositivo atrasado no pisa contactos nuevos',()=>{
 const data=contact(initial()),oldContact=contactHistory('company',data).contact.id;
 const stale=responseOperations(data,company(data),'conversacion',{now});
 const next=contact(data,['llamada'],{now:new Date('2026-10-21T16:00:00Z')});
 assert.throws(()=>checkOperations(next,stale),ConflictError);
 assert.throws(()=>responseOperations(next,company(next),'conversacion',{contactId:oldContact}),/otro contacto/);
});

test('Los canales de registros antiguos simultáneos se reúnen con su respuesta sin fabricar fechas',()=>{
 const data=initial();data.activities=[{id:'a',company_id:'company',kind:'correo',date:'2026-10-20',time:'09:30',outcome:'sin_respuesta'},{id:'b',company_id:'company',kind:'whatsapp',date:'2026-10-20',time:'09:30',outcome:'conversacion'}];
 const snapshot=JSON.stringify(data);const history=contactHistory('company',data);
 assert.deepEqual(history.channels,['correo','whatsapp']);assert.equal(history.at,'2026-10-20T14:30:00.000Z');assert.equal(history.response.outcome,'conversacion');assert.equal(companyStage(company(data),data),'propuesta');assert.equal(JSON.stringify(data),snapshot);
});

test('Respaldos conservan los canales, las respuestas y los códigos antiguos admitidos por PostgreSQL',()=>{
 let data=contact(initial());data=apply(data,responseOperations(data,company(data),'conversacion',{now}));
 data.deals=[{id:'legacy',company_id:'company',title:'Negociación anterior',stage:'negociacion',currency:'PEN',amount_cents:0,paid_cents:0}];
 const restored=parseBackup(backup(data));assert.deepEqual(restored.companies,data.companies);assert.deepEqual(restored.activities,data.activities);assert.equal(restored.deals[0].stage,'negociacion');
 assert.throws(()=>validateRecord('companies',{...company(data),pipeline_stage:'inventada'}),/etapa/);
 assert.throws(()=>validateRecord('activities',{...data.activities.find(row=>row.kind==='contacto'),channels:[]}),/canal/);
});

test('Seguimiento admite reuniones, cotizaciones, proformas y visitas en agenda',()=>{
 const data=initial();for(const kind of ['reunion','cotizacion','proforma','visita']){assert.ok(TASK_KINDS[kind]);const next=checkOperations(data,[{type:'tasks',expected:0,record:{id:kind,company_id:'company',title:TASK_KINDS[kind],kind,status:'pendiente',due_date:'2026-10-21'}}]);assert.equal(next.tasks[0].kind,kind);}
});
