import {OutboundError} from './whatsapp-core.mjs';
import {companyStage} from './crm/domain.js';
import {recipientChoices} from './whatsapp-domain.mjs';
import {sectorFor,sectorWhatsApp,TEMPLATE_VERSION} from './sectors.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const terminal=['sent','failed','uncertain','skipped','cancelled'];
const fail=(message,code='INVALID_CAMPAIGN',status=400)=>{throw new OutboundError(code,message,status);};
export class CampaignService{
 constructor({store,emailApi,whatsappFor,now=()=>new Date(),uuid=()=>crypto.randomUUID()}){Object.assign(this,{store,emailApi,whatsappFor,now,uuid});}
 async create(input){
  if(!UUID.test(input.campaignId||'')||!Array.isArray(input.companyIds)||!input.companyIds.length||input.companyIds.length>1000||!['correo','whatsapp','ambos'].includes(input.channel))fail('Selecciona el canal y entre 1 y 1000 empresas.');
  if(!['auto','general','impresion','computadoras'].includes(input.template||'auto'))fail('Selecciona una plantilla válida.');
  const emailInterval=Number(input.emailInterval||60),whatsappInterval=Number(input.whatsappInterval||30);
  if(![60,120,180,300].includes(emailInterval)||![30,60,120].includes(whatsappInterval))fail('Selecciona un intervalo válido.');
  const campaignId='campaign-'+input.campaignId,existing=await this.store.get(campaignId);if(existing)return {campaign:existing,version:TEMPLATE_VERSION};
  const data=await this.store.loadData(),ids=[...new Set(input.companyIds)],companies=ids.map(id=>data.companies.find(c=>c.id===id));if(companies.some(c=>!c||c.archived||['no_contactar','no_encaja'].includes(c.status)||companyStage(c,data)==='perdida'))fail('Hay empresas archivadas o con seguimiento cerrado en la selección.');
  const channels=input.channel==='ambos'?['correo','whatsapp']:[input.channel],deliveries=[];let rank=0;
  for(const company of companies){if(data.settings.some(j=>j.category==='outreach_delivery'&&j.company_id===company.id&&channels.includes(j.channel)&&!['sent','failed','skipped','cancelled'].includes(j.status)))continue;const choices=recipientChoices(data,company),email=company.email||data.contacts.find(c=>c.company_id===company.id&&c.email)?.email||'',template=sectorFor(company,input.template||'auto');for(const channel of channels){const recipient=channel==='correo'?email:choices[0]?.phone||'';if(!recipient)continue;deliveries.push({id:'delivery-'+this.uuid(),category:'outreach_delivery',campaign_id:campaignId,company_id:company.id,channel,recipient,contact_id:channel==='whatsapp'?choices[0].id:'',template,send_id:this.uuid(),rank:rank++,status:'pending',caption:channel==='whatsapp'?sectorWhatsApp(company,template,{emailSent:input.channel==='ambos'&&!!email}):'',error:'',sent_at:'',last_poll_at:''});}}
  if(!deliveries.length)fail('No hay destinatarios disponibles: faltan datos o ya tienen un envío pendiente en ese canal.');
  const name=String(input.name||'Campaña '+this.now().toLocaleDateString('es-PE',{timeZone:'America/Lima'})).trim().slice(0,120);
  let campaign=await this.store.put({id:campaignId,category:'outreach_campaign',name,channel:input.channel,template:input.template||'auto',email_interval:emailInterval,whatsapp_interval:whatsappInterval,status:'preparing',total:deliveries.length,company_count:companies.length,filters:input.filters&&typeof input.filters==='object'?JSON.stringify(input.filters).slice(0,2500):''});
  await this.store.insertMany(deliveries);campaign=await this.store.put({...campaign,status:'queued'});
  return {campaign,version:TEMPLATE_VERSION};
 }
 async control(input){const campaign=await this.store.get(input.id);if(campaign?.category!=='outreach_campaign')fail('No se encontró la campaña.');if(!['pause','resume','cancel'].includes(input.operation))fail('Acción no disponible.');if(['completed','cancelled','preparing'].includes(campaign.status))fail('Esta campaña ya terminó o no está preparada.');if(input.operation==='cancel'){const data=await this.store.loadData();for(const job of data.settings.filter(j=>j.category==='outreach_delivery'&&j.campaign_id===campaign.id&&j.status==='pending'))await this.store.put({...job,status:'cancelled'});}return {campaign:await this.store.put({...campaign,status:input.operation==='pause'?'paused':input.operation==='resume'?'queued':'cancelled',error:''})};}
 async tick(){
  const now=this.now(),lock=await this.store.acquire(now);if(!lock)return {busy:true,version:TEMPLATE_VERSION};let schedule={};
  try{
   const data=await this.store.loadData(),campaigns=data.settings.filter(r=>r.category==='outreach_campaign'),jobs=data.settings.filter(r=>r.category==='outreach_delivery');
   // A process stopped after contacting a provider is never blindly replayed.
   const interrupted=jobs.find(j=>j.status==='sending'&&Date.parse(j.lease_until||'')<=now.getTime());
   if(interrupted){
    const logged=data.activities.find(a=>a.outbound_id===interrupted.send_id||a.id==='mail-'+interrupted.send_id||a.id==='wa-'+interrupted.send_id);
    if(logged){await this.store.put({...interrupted,status:'sent',sent_at:logged.occurred_at||logged.created_at||now.toISOString(),error:''});return {changed:true};}
    if(interrupted.channel==='whatsapp')try{const result=await this.whatsappFor(interrupted.template).refresh(interrupted.send_id);if(['sent','queued','processing','uncertain','failed'].includes(result.status)){await this.store.put({...interrupted,status:result.status,provider_id:result.id,last_poll_at:now.toISOString(),sent_at:result.sent_at||'',error:result.error_message||''});return {changed:true};}}catch{}
    await this.store.put({...interrupted,status:'uncertain',error:'El intento se interrumpió. Revisa el proveedor antes de repetirlo.'});return {changed:true};
   }
   const awaiting=jobs.find(j=>['queued','processing'].includes(j.status)&&(!j.last_poll_at||now.getTime()-Date.parse(j.last_poll_at)>15000));
   if(awaiting){try{const api=this.whatsappFor(awaiting.template),result=await api.refresh(awaiting.provider_id);await this.store.put({...awaiting,status:result.status,provider_id:result.id,last_poll_at:now.toISOString(),sent_at:result.sent_at||'',error:result.error_message||''});}catch{/* Keep the known state when polling fails. */}return {changed:true};}
   const active=campaigns.filter(c=>c.status==='queued').sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))||a.id.localeCompare(b.id));
   for(const campaign of active){
    const items=jobs.filter(j=>j.campaign_id===campaign.id).sort((a,b)=>a.rank-b.rank);
    if(items.every(j=>terminal.includes(j.status))){await this.store.put({...campaign,status:'completed'});continue;}
    const job=items.find(j=>j.status==='pending');if(!job)continue;
    const company=data.companies.find(c=>c.id===job.company_id);
    if(!company||company.archived||['no_contactar','no_encaja'].includes(company.status)||companyStage(company,data)==='perdida'){await this.store.put({...job,status:'skipped',error:'Empresa cerrada o archivada desde que se creó la campaña.'});return {changed:true};}
    if(job.channel==='whatsapp'&&campaign.channel==='ambos'){
     const email=items.find(j=>j.company_id===job.company_id&&j.channel==='correo');
     if(email&&email.status!=='sent'){if(terminal.includes(email.status)){await this.store.put({...job,status:'skipped',error:'El correo previo no se confirmó; el mensaje lo menciona.'});return {changed:true};}return {waiting:true};}
    }
    const key=job.channel==='correo'?'next_email_at':'next_whatsapp_at';if(Date.parse(lock[key]||'')>now.getTime())return {nextAt:lock[key]};
    let claimed=await this.store.put({...job,status:'sending',lease_until:new Date(now.getTime()+180000).toISOString()});
    // Reserve the interval before the provider call; it applies across every campaign.
    const interval=job.channel==='correo'?campaign.email_interval:campaign.whatsapp_interval;
    schedule[key]=new Date(now.getTime()+interval*1000).toISOString();
    try{
     if(job.channel==='correo'){
      if(![company.email,...data.contacts.filter(c=>c.company_id===company.id).map(c=>c.email)].some(email=>email&&email.toLowerCase()===job.recipient.toLowerCase()))fail('El correo cambió; revisa la empresa antes de enviar.','RECIPIENT_CHANGED');
      const result=await this.emailApi.send({sendId:job.send_id,companyId:job.company_id,toAddress:job.recipient,template:job.template,dryRun:false});
      if(result.status!=='sent')throw new OutboundError('EMAIL_UNCERTAIN','Zoho no confirmó el resultado.',503);
      await this.store.put({...claimed,status:'sent',sent_at:this.now().toISOString(),provider_id:result.providerId||'',error:''});
     }else{
      const choices=recipientChoices(data,company),choice=choices.find(c=>(c.id||'')===job.contact_id);if(choice?.phone!==job.recipient)fail('El teléfono cambió; revisa la empresa antes de enviar.','RECIPIENT_CHANGED');
      const result=await this.whatsappFor(job.template).submit({requestId:job.send_id,companyId:job.company_id,contactId:job.contact_id,caption:job.caption,emailAlreadySent:campaign.channel==='ambos'&&items.some(j=>j.company_id===job.company_id&&j.channel==='correo'&&j.status==='sent'),consent:{confirmed:true,source:'Confirmación del operador al crear campaña',capturedAt:now.toISOString()},dryRun:false});
      if(result.id!==job.send_id){await this.store.put({...claimed,status:'skipped',provider_id:result.id,error:'Este mismo WhatsApp ya estaba registrado en LR; no se solicitó otro envío.'});return {changed:true};}
      await this.store.put({...claimed,status:['prepared','validated'].includes(result.status)?'failed':result.status,provider_id:result.id,last_poll_at:now.toISOString(),sent_at:result.sent_at||'',error:result.error_message||''});
      if(result.retry_at){schedule[key]=result.retry_at;await this.store.put({...campaign,status:'paused',error:'El proveedor pidió esperar. Revisa el plazo del intento antes de continuar.'});}else if(['prepared','validated','uncertain','failed'].includes(result.status)){await this.store.put({...campaign,status:'paused',error:'WhatsApp no confirmó el envío. Revisa el intento antes de continuar.'});}
     }
    }catch(error){const definite=['SENDING_DISABLED','EMAIL_REQUIRED','COMPANY_NOT_FOUND','CONTACT_BLOCKED','RECIPIENT_CHANGED','ZOHO_NOT_CONFIGURED','ZOHO_AUTH_FAILED','ZOHO_ACCOUNT_FAILED','ZOHO_SEND_REJECTED','RATE_LIMITED','SENDER_NOT_AUTHORIZED','SENDER_OWNER_NOT_CONFIGURED','LR_NOT_CONFIGURED'].includes(error.code);try{await this.store.put({...claimed,status:definite?'failed':'uncertain',error:error instanceof OutboundError?error.message:'No se pudo confirmar el envío. Revisa el proveedor antes de repetirlo.'});}catch{}await this.store.put({...campaign,status:'paused',error:'La campaña se pausó por un error. El historial conserva el intento.'});if(error.code==='RATE_LIMITED')schedule[key]=new Date(now.getTime()+300000).toISOString();}
    return {changed:true,version:TEMPLATE_VERSION};
   }
   return {idle:true,version:TEMPLATE_VERSION};
  }finally{await this.store.release(lock,schedule);}
 }
}
