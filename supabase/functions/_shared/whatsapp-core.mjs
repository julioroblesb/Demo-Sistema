import {createHash} from 'node:crypto';
import {contactOperations} from './crm/prospecting.js';
import {companyStage,today,localTime} from './crm/domain.js';
import {normalizeWhatsAppPhone,priorEmail} from './whatsapp-domain.mjs';
import {LrApiError,LrTransportError} from './lr-whatsapp-client.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LR_STATES=['queued','processing','sent','failed','uncertain','cancelled'];
export class OutboundError extends Error{constructor(code,message,status=400){super(message);this.code=code;this.status=status;}}
const fail=(code,message,status)=>{throw new OutboundError(code,message,status);};
const digest=value=>createHash('sha256').update(value).digest('hex');
const blocked=company=>!company||company.archived||['no_contactar','no_encaja'].includes(company.status)||company.pipeline_stage==='perdida';
const PUBLIC_JOB_FIELDS=new Set(['id','company_id','recipient','caption','contact_id','status','provider_message_id','provider_whatsapp_id','error_code','error_message','sent_at','logged_at','version','created_at','updated_at','log_pending','refresh_pending']);
export const publicJob=job=>{if(!job)return null;const result=Object.fromEntries(Object.entries(job).filter(([key])=>PUBLIC_JOB_FIELDS.has(key)));if(job.status==='prepared'&&['RATE_LIMITED','QUEUE_LIMIT'].includes(job.error_code)&&job.lease_until)result.retry_at=job.lease_until;return result;};
const SAFE_LR_CODES=new Set(['INVALID_REQUEST','INVALID_INTEGRATION_KEY','INTEGRATION_DISABLED','SCOPE_DENIED','NOT_FOUND','IDEMPOTENCY_CONFLICT','IMAGE_TOO_LARGE','UNSUPPORTED_MEDIA_TYPE','MEDIA_NOT_READY','MEDIA_INTEGRITY_MISMATCH','RATE_LIMITED','QUEUE_LIMIT','SESSION_NOT_READY','SENDER_IDENTITY_MISMATCH','UPLOAD_FAILED']);
export class WhatsAppService{
 constructor({store,provider,loadImage,imageHash,configured=false,enabled=false,now=()=>new Date()}){Object.assign(this,{store,provider,loadImage,imageHash,configured,enabled,now});}
 async company(companyId){const data=await this.store.loadData();const company=data.companies.find(row=>row.id===companyId);if(!company)fail('COMPANY_NOT_FOUND','No se encontró esta empresa.',404);return {data,company};}
 async context(companyId){await this.company(companyId);const jobs=await this.store.listJobs(companyId);let ready=false,message=this.configured?'La conexión está pendiente de comprobar.':'Falta configurar la conexión privada de LR en el servidor.';if(this.configured){try{const connection=await this.provider.connection();ready=connection.ready;message=ready?'Conectado al WhatsApp de Julio.':'Vincula el número de Julio en Sistema LR → Campañas → Mi WhatsApp comercial. Puedes validar el mensaje sin enviarlo.';}catch{message='LR todavía no confirmó su conexión. Revisa que el puente esté habilitado y la clave sea válida.';}}return {configured:this.configured,enabled:this.enabled,ready,senderPhone:'+51936755465',message,jobs:jobs.map(publicJob)};}
 async prepare(input){
  if(!this.configured)fail('LR_NOT_CONFIGURED','Falta configurar la conexión privada de LR.',503);
  if(!UUID.test(input.requestId||''))fail('INVALID_REQUEST','No se pudo identificar este intento. Vuelve a abrir el mensaje.');
  const {data,company}=await this.company(input.companyId);if(blocked(company)||companyStage(company,data)==='perdida')fail('CONTACT_BLOCKED','El seguimiento de esta empresa está cerrado o archivado.');
  const contact=input.contactId?data.contacts.find(row=>row.id===input.contactId&&row.company_id===company.id):company;
  const recipient=normalizeWhatsAppPhone(contact?.phone);if(!recipient)fail('INVALID_PHONE','Registra un teléfono internacional válido en la empresa o contacto.');
  const caption=typeof input.caption==='string'?input.caption:'';if(!caption.trim()||caption.length>1024)fail('INVALID_CAPTION','El mensaje debe tener entre 1 y 1024 caracteres.');
  const email=priorEmail(data,company.id);if(!email&&input.emailAlreadySent!==true)fail('EMAIL_REQUIRED','Este mensaje dice que ya enviaste un correo. Registra o confirma ese envío primero.');
  const consent=input.consent;if(consent?.confirmed!==true||typeof consent.source!=='string'||!consent.source.trim()||consent.source.length>200||typeof consent.capturedAt!=='string'||!/^\d{4}-\d\d-\d\dT/.test(consent.capturedAt)||!Number.isFinite(Date.parse(consent.capturedAt))||Date.parse(consent.capturedAt)>this.now().getTime()+300000)fail('CONSENT_REQUIRED','La conexión LR exige registrar la autorización del destinatario y su origen.');
  const normalizedConsent={confirmed:true,source:consent.source.trim(),capturedAt:consent.capturedAt};
  const hash=digest(JSON.stringify({company:company.id,contact:input.contactId||'',recipient,caption,image:this.imageHash,consentSource:normalizedConsent.source}));
  return this.store.prepareJob({id:input.requestId,company_id:company.id,contact_id:input.contactId||'',recipient,caption,image_sha256:this.imageHash,payload_hash:hash,consent:normalizedConsent,email_evidence:email?{type:'activity',id:email.id}:{type:'manual',recorded_at:this.now().toISOString()}});
 }
 async ensureEligible(job){const {data,company}=await this.company(job.company_id);if(blocked(company)||companyStage(company,data)==='perdida')fail('CONTACT_BLOCKED','La empresa cerró su seguimiento. No se solicitará otro envío.');const contact=job.contact_id?data.contacts.find(row=>row.id===job.contact_id&&row.company_id===company.id):company;if(normalizeWhatsAppPhone(contact?.phone)!==job.recipient)fail('RECIPIENT_CHANGED','El teléfono cambió desde que preparaste este mensaje. Revisa el intento antes de enviar.');}
 async submit(input){if(input.dryRun!==true&&input.dryRun!==false)fail('INVALID_REQUEST','Indica si deseas validar o enviar.');if(input.dryRun===false&&!this.enabled)fail('SENDING_DISABLED','El envío real todavía no está activado en el servidor.',503);const job=await this.prepare(input);return this.dispatch(job,input.dryRun);}
 async dispatch(job,dryRun,recover=false){
  if(['queued','processing','sent','cancelled','failed'].includes(job.status)||job.status==='uncertain'&&!recover)return publicJob(await this.refreshInternal(job));
  if(['submitting','validating'].includes(job.status))return publicJob(await this.refreshInternal(job));
  if(!this.configured)fail('LR_NOT_CONFIGURED','Falta configurar LR.',503);if(!dryRun&&!this.enabled)fail('SENDING_DISABLED','El envío real todavía no está activado.',503);
  if(['RATE_LIMITED','QUEUE_LIMIT'].includes(job.error_code)&&Date.parse(job.lease_until)>this.now().getTime())fail('RATE_LIMITED','LR pidió esperar antes de volver a intentar.',429);
  await this.ensureEligible(job);job=await this.store.claimJob(job,dryRun);let mayHaveSent=false;
  try{
   // LR resuelve los reintentos por el mismo UUID; no se crea otro identificador.
   if(!recover&&!dryRun){const connection=await this.provider.connection();if(!connection.ready)fail('SESSION_NOT_READY','El WhatsApp de Julio no está conectado en LR.',503);}
   const image=await this.loadImage();if(digest(image)!==job.image_sha256)fail('IMAGE_CHANGED','La imagen cambió. Es necesario revisar la versión antes de enviar.');
   await this.ensureEligible(job);
   mayHaveSent=!dryRun;
   const result=await this.provider.submitImage({sendId:job.id,to:job.recipient,caption:job.caption,image,mime:'image/jpeg',externalContactId:job.contact_id||job.company_id,consent:job.consent,dryRun});
   if(dryRun){job=await this.store.updateJob(job,{status:'validated',lease_until:null,error_code:null,error_message:null});return publicJob(job);}
   job=await this.applyProvider(job,result);
   if(job.status==='sent'){try{job=await this.logSent(job);}catch{job={...job,log_pending:true};}}
   return publicJob(job);
  }catch(error){
   const uncertain=mayHaveSent&&!(error instanceof LrTransportError&&!error.mayHaveBeenAccepted)&&!(error instanceof LrApiError&&error.status>=400&&error.status<500);
   const code=error instanceof OutboundError?error.code:error instanceof LrApiError&&SAFE_LR_CODES.has(error.code)?error.code:uncertain?'ACCEPTANCE_UNCERTAIN':'CONNECTION_FAILED';
   const message=uncertain?'No se pudo confirmar el resultado. Revisa este mismo intento; no crees otro envío.':error instanceof OutboundError?error.message:'LR no aceptó el envío. Revisa la conexión o la configuración antes de volver a intentar.';
   let retryAt=null;if(error instanceof LrApiError&&error.status===429){const raw=String(error.retryAfter||'');const time=/^\d+$/.test(raw)?this.now().getTime()+Number(raw)*1000:Date.parse(raw);retryAt=new Date(Number.isFinite(time)&&time>this.now().getTime()&&time<this.now().getTime()+2592000000?time:this.now().getTime()+60000).toISOString();}
   job=await this.store.updateJob(job,{status:uncertain?'uncertain':'prepared',lease_until:retryAt,error_code:retryAt?(code==='QUEUE_LIMIT'?'QUEUE_LIMIT':'RATE_LIMITED'):code,error_message:retryAt?'LR alcanzó su límite de envío. Espera el plazo indicado antes de volver a intentar.':message});return publicJob(job);
  }
 }
 async applyProvider(job,result){
  if(!result||!UUID.test(result.messageId||'')||!LR_STATES.includes(result.status)||result.senderPhone&&result.senderPhone!=='+51936755465')fail('INVALID_PROVIDER_RESPONSE','LR devolvió un estado que no se pudo comprobar.',502);
  // La v1 confirma envío a WhatsApp, no recepción ni lectura del destinatario.
  const reported=result.updatedAt;const time=typeof reported==='string'&&Number.isFinite(Date.parse(reported))&&Date.parse(reported)<=this.now().getTime()+300000?new Date(reported).toISOString():this.now().toISOString();
  return this.store.updateJob(job,{status:result.status,provider_message_id:result.messageId,provider_whatsapp_id:typeof result.whatsappMessageId==='string'?result.whatsappMessageId.slice(0,200):null,sent_at:result.status==='sent'?(job.sent_at||time):null,lease_until:null,error_code:result.status==='failed'?'LR_SEND_FAILED':null,error_message:result.status==='failed'?'LR informó que no se pudo enviar. Revisa el intento antes de repetirlo.':null});
 }
 async logSent(job){
  if(job.logged_at)return job;const activityId='wa-'+job.id;
  for(let attempt=0;attempt<2;attempt++){
   const data=await this.store.loadData();
   if(data.activities.some(row=>row.id===activityId))return this.store.updateJob(job,{logged_at:this.now().toISOString(),error_code:null,error_message:null});
   const company=data.companies.find(row=>row.id===job.company_id);if(!company)return job;const now=new Date(job.sent_at||this.now());
   const operations=companyStage(company,data)==='perdida'||company.archived?[{type:'activities',expected:0,record:{id:activityId,company_id:company.id,deal_id:'',kind:'contacto',channels:['whatsapp'],outcome:'sin_respuesta',body:job.caption,occurred_at:now.toISOString(),date:today(now),time:localTime(now)}}]:contactOperations(data,company,['whatsapp'],{body:job.caption,now});
   const record=operations.find(op=>op.type==='activities'&&op.record.kind==='contacto').record;record.id=activityId;record.outbound_id=job.id;record.provider_message_id=job.provider_message_id;
   try{await this.store.commit(operations);return await this.store.updateJob(job,{logged_at:this.now().toISOString(),error_code:null,error_message:null});}catch{ /* Solo se reintenta registrar el historial, nunca el envío. */ }
  }
  return {...job,log_pending:true};
 }
 async refreshInternal(job){
  if(job.status==='sent'){try{return await this.logSent(job);}catch{return {...job,log_pending:true};}}
  if(['submitting','validating'].includes(job.status)&&job.lease_until&&Date.parse(job.lease_until)<=this.now().getTime())return this.store.updateJob(job,{status:job.status==='submitting'?'uncertain':'prepared',lease_until:null,error_code:'INTERRUPTED',error_message:job.status==='submitting'?'El intento se interrumpió. Puede haberse aceptado; revisa este mismo intento.':'La validación se interrumpió sin solicitar envío.'});
  if(!job.provider_message_id||!['queued','processing','uncertain'].includes(job.status))return job;
  if(!this.configured)return job;
  try{job=await this.applyProvider(job,await this.provider.status(job.provider_message_id));}catch{return {...job,refresh_pending:true};}
  if(job.status==='sent'){try{return await this.logSent(job);}catch{return {...job,log_pending:true};}}return job;
 }
 async refresh(id){if(!UUID.test(id||''))fail('INVALID_REQUEST','Identificador de envío inválido.');return publicJob(await this.refreshInternal(await this.store.getJob(id)));}
 async recover(id){if(!UUID.test(id||''))fail('INVALID_REQUEST','Identificador de envío inválido.');let job=await this.store.getJob(id);job=await this.refreshInternal(job);if(job.provider_message_id||job.status!=='uncertain')return publicJob(job);return this.dispatch(job,false,true);}
 async cancel(id){if(!UUID.test(id||''))fail('INVALID_REQUEST','Identificador de envío inválido.');const job=await this.store.getJob(id);if(!['prepared','validated'].includes(job.status))fail('JOB_BUSY','Solo se puede descartar un borrador que todavía no se ha solicitado.');return publicJob(await this.store.updateJob(job,{status:'cancelled',lease_until:null}));}
}
