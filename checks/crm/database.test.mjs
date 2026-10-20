import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const sql=readFileSync(new URL('../../supabase/migrations/202610200001_crm.sql',import.meta.url),'utf8');
assert.equal(sql,readFileSync(new URL('../../public/SKYROTE13/instalar-crm.sql',import.meta.url),'utf8'),'El SQL descargable debe coincidir con la migración probada.');
const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
async function setup(){const db=new PGlite();await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon; insert into auth.users values('${owner}'),('${other}');`);await db.exec(sql);await db.exec(sql);await db.query('insert into crm_members(user_id) values($1)',[owner]);return db;}
const company={id:'company1',name:'Alquileres Lima',status:'nueva'};
const deal={id:'deal1',title:'Sistema de alquileres',company_id:'company1',amount_cents:100000,paid_cents:0,stage:'ganada',currency:'PEN',closed_date:'2026-10-20'};
const op=(type,record,expected=0)=>({type,record,expected});
async function as(db,user=owner,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role '+role);}
async function commit(db,ops){return db.query('select * from public.crm_commit($1::jsonb)',[JSON.stringify(ops)]);}
test('SQL: instalación repetible, RLS, cuenta autorizada y denegación anónima',async()=>{const db=await setup();try{await as(db);await commit(db,[op('companies',company)]);assert.equal((await db.query('select * from crm_records')).rows.length,1);await assert.rejects(()=>db.query("insert into crm_records(owner_id,kind,id,data) values($1,'companies','b','{}')",[owner]),/permission denied/);await as(db,other);assert.equal((await db.query('select * from crm_records')).rows.length,0);await assert.rejects(()=>commit(db,[op('companies',{...company,id:'other'})]),/autorizada/);await as(db,'','anon');await assert.rejects(()=>db.query('select * from crm_records'),/permission denied/);await assert.rejects(()=>commit(db,[op('companies',company)]),/permission denied/);}finally{await db.close();}});
test('SQL: transacciones atómicas, conflictos, cobros y aislamiento por propietario',async()=>{const db=await setup();try{await as(db);await commit(db,[op('companies',company),op('deals',deal)]);await assert.rejects(()=>commit(db,[op('companies',{...company,name:'No debe guardarse'},1),op('deals',{...deal,company_id:'missing'},1)]),/empresa vinculada/);assert.equal((await db.query("select data->>'name' name from crm_records where kind='companies'")).rows[0].name,company.name);await assert.rejects(()=>commit(db,[op('companies',company,0)]),/CONFLICT_UI/);const payment={id:'pay1',deal_id:deal.id,amount_cents:25000,voided:false};await assert.rejects(()=>commit(db,[op('payments',payment)]),/saldo/);await commit(db,[op('payments',payment),op('deals',{...deal,paid_cents:25000},1)]);await assert.rejects(()=>commit(db,[op('deals',{...deal,paid_cents:25000,currency:'USD'},2)]),/moneda/);await assert.rejects(()=>commit(db,[op('payments',{...payment,id:'pay2',amount_cents:90000}),op('deals',{...deal,paid_cents:115000},2)]),/saldo/);await assert.rejects(()=>commit(db,[op('payments',{...payment,amount_cents:20000},1)]),/se anula/);await commit(db,[op('payments',{...payment,voided:true},1),op('deals',deal,2)]);assert.equal((await db.query("select data->>'paid_cents' paid from crm_records where kind='deals'")).rows[0].paid,'0');await db.exec('reset role');await db.query('insert into crm_members(user_id) values($1)',[other]);await as(db,other);await commit(db,[op('companies',{...company,name:'Otra cuenta'})]);assert.equal((await db.query('select * from crm_records')).rows.length,1);await as(db);assert.equal((await db.query('select * from crm_records')).rows.length,3);}finally{await db.close();}});

test('SQL existente: contacto multicanal, respuesta, tareas y cierres sincronizables sin migración',async()=>{
 const {emptyData,companyStage,contactHistory}=await import('../../src/crm/domain.js');
 const {contactOperations,responseOperations}=await import('../../src/crm/prospecting.js');
 const db=await setup();
 async function read(){const data=emptyData();for(const row of (await db.query('select * from crm_records')).rows)data[row.kind].push({...row.data,id:row.id,version:row.version,created_at:row.created_at,updated_at:row.updated_at});return data;}
 try{
  await as(db);
  const won={...deal,paid_cents:25000};
  const open={...deal,id:'open',title:'Segunda etapa',stage:'negociacion',closed_date:'',paid_cents:0};
  const tasks=['reunion','cotizacion','proforma','visita','entrega'].map(kind=>({id:kind,title:kind,kind,company_id:company.id,deal_id:kind==='entrega'?won.id:open.id,due_date:'2026-10-21',status:'pendiente'}));
  await commit(db,[op('companies',company),op('deals',won),op('deals',open),op('payments',{id:'p',deal_id:won.id,amount_cents:25000,voided:false}),op('milestones',{id:'m',deal_id:won.id,title:'Entrega pendiente',done:false}),...tasks.map(row=>op('tasks',row))]);
  let data=await read();const before=JSON.stringify({won:data.deals.find(row=>row.id===won.id),payments:data.payments,milestones:data.milestones});
  await commit(db,contactOperations(data,data.companies[0],['correo','whatsapp'],{move:true,now:new Date('2026-10-20T03:12:45Z')}));
  data=await read();assert.equal(companyStage(data.companies[0],data),'demo');assert.equal(data.deals.find(row=>row.id==='open').pipeline_version,2);
  assert.deepEqual(contactHistory(company.id,data).channels,['correo','whatsapp']);assert.equal(contactHistory(company.id,data).contact.time,'22:12');
  const stale=responseOperations(data,data.companies[0],'no_interes');
  await commit(db,responseOperations(data,data.companies[0],'conversacion'));
  data=await read();assert.equal(companyStage(data.companies[0],data),'propuesta');
  await assert.rejects(()=>commit(db,stale),/CONFLICT_UI/);
  assert.equal((await read()).activities.filter(row=>row.kind==='respuesta').length,1);
  await commit(db,responseOperations(data,data.companies[0],'no_interes',{body:'No desea continuar.'}));
  data=await read();assert.equal(companyStage(data.companies[0],data),'perdida');assert.equal(data.deals.find(row=>row.id==='open').stage,'perdida');
  assert.equal(data.tasks.filter(row=>row.status==='cancelada').length,4);assert.equal(data.tasks.find(row=>row.id==='entrega').status,'pendiente');
  assert.equal(JSON.stringify({won:data.deals.find(row=>row.id===won.id),payments:data.payments,milestones:data.milestones}),before);
  assert.equal(contactHistory(company.id,data).response.outcome,'no_interes');
 }finally{await db.close();}
});
