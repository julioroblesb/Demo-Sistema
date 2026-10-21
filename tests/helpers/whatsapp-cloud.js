import {seedDemo} from '../../src/crm/demo.js';
import {today,localTime} from '../../src/crm/domain.js';
export async function mockWhatsAppCloud(context,{configured=true,enabled=true,ready=configured,uncertain=false,delay=0}={}){
 await context.route('https://nexoamedida.com/presentacion/Nexo-WhatsApp-Informacion.jpg',route=>route.fulfill({path:'public/presentacion/Nexo-WhatsApp-Informacion.jpg',contentType:'image/jpeg'}));
 const owner='11111111-1111-4111-8111-111111111111',data=seedDemo();data.companies.find(row=>row.id==='demo-empresa-6').phone='936755465';
 const rows=Object.entries(data).flatMap(([kind,list])=>list.map(record=>({owner_id:owner,kind,id:record.id,data:record,version:record.version||1,created_at:record.created_at,updated_at:record.updated_at})));
 const jobs=[],requests=[];let submits=0;
 const claims=Buffer.from(JSON.stringify({sub:owner,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
 const token=Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')+'.'+claims+'.test-signature';
 await context.route('https://hwilhpcermjxsaplando.supabase.co/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'};let body={};
  if(req.method()==='OPTIONS'){await route.fulfill({status:200,headers,body:''});return;}
  if(path==='/auth/v1/token')body={access_token:token,refresh_token:'test-refresh-token',token_type:'bearer',expires_in:3600,user:{id:owner,email:'julio@example.com',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString()}};
  else if(path==='/auth/v1/logout')body={};
  else if(path==='/rest/v1/crm_members')body=[{user_id:owner}];
  else if(path==='/rest/v1/crm_records')body=rows;
  else if(path==='/functions/v1/crm-whatsapp'){
   if(req.headers().authorization!=='Bearer '+token)throw new Error('Missing authenticated user session');
   const input=req.postDataJSON();requests.push(input);
   if(input.action==='context')body={configured,enabled,ready,senderPhone:'+51936755465',message:configured?(ready?'Conectado al WhatsApp de Julio.':'Vincula el número de Julio en Sistema LR → Campañas → Mi WhatsApp comercial. Puedes validar el mensaje sin enviarlo.'):'Falta configurar la conexión privada de LR en el servidor.',jobs:jobs.filter(row=>row.company_id===input.companyId)};
   else if(input.action==='submit'){
    submits++;if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    let job=jobs.find(row=>row.id===input.requestId);
    if(!job){job={id:input.requestId,company_id:input.companyId,recipient:'+51936755465',caption:input.caption,created_at:new Date().toISOString(),logged_at:null};jobs.push(job);}
    job.status=input.dryRun?'validated':uncertain?'uncertain':'queued';job.error_message=job.status==='uncertain'?'No se pudo confirmar el resultado. Revisa este mismo intento; no crees otro envío.':null;
    if(!input.dryRun&&!uncertain)job.provider_message_id='370bcf0b-9910-4f8b-bd80-57d6f665e044';body={job};
   }else if(input.action==='refresh'){
    const job=jobs.find(row=>row.id===input.jobId);
    if(job.status==='queued'){
     job.status='sent';job.sent_at=new Date().toISOString();job.logged_at=job.sent_at;
     const company=rows.find(row=>row.kind==='companies'&&row.id===job.company_id);company.data={...company.data,status:'contactada',pipeline_stage:'demo'};company.version++;
     const activity={id:'wa-'+job.id,company_id:job.company_id,deal_id:'',kind:'contacto',channels:['whatsapp'],outcome:'sin_respuesta',body:job.caption,occurred_at:job.sent_at,date:today(),time:localTime()};
     rows.push({owner_id:owner,kind:'activities',id:activity.id,data:activity,version:1,created_at:job.sent_at,updated_at:job.sent_at});
    }body={job};
   }else if(input.action==='recover'){const job=jobs.find(row=>row.id===input.jobId);job.status='queued';job.provider_message_id='370bcf0b-9910-4f8b-bd80-57d6f665e044';job.error_message=null;body={job};}
   else if(input.action==='cancel'){const job=jobs.find(row=>row.id===input.jobId);job.status='cancelled';body={job};}
   else throw new Error('Unexpected WhatsApp action');
  }else{await route.fulfill({status:404,headers,json:{message:'Unmocked endpoint'}});return;}
  await route.fulfill({status:200,headers,json:body});
 });
 return {rows,jobs,requests,get submits(){return submits;}};
}
export async function loginWhatsApp(page){await page.goto('/SKYROTE13/');await page.getByLabel('Tu correo',{exact:true}).fill('julio@example.com');await page.getByLabel('Tu contraseña',{exact:true}).fill('not-a-real-password');await page.getByLabel('Recordarme en este dispositivo').check();await page.getByRole('button',{name:'Entrar a mi CRM'}).click();await page.goto('/SKYROTE13/#empresas');await page.locator('[data-action=open-company][data-id=demo-empresa-6]').first().click();await page.getByRole('button',{name:'Enviar WhatsApp',exact:true}).click();}
export async function fillWhatsAppRequirements(page){await page.getByRole('checkbox',{name:'Ya envié el correo mencionado a esta empresa.',exact:true}).check();await page.getByRole('checkbox',{name:'El destinatario autorizó recibir mensajes por WhatsApp.',exact:true}).check();await page.getByLabel('Origen de esa autorización',{exact:true}).fill('Solicitud real del contacto por conversación.');}
