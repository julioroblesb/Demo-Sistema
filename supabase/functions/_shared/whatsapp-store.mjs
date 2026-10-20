import {emptyData} from './crm/domain.js';
import {OutboundError} from './whatsapp-core.mjs';
export function databaseError(error){
 const message=error?.message||'',code=error?.code||'';
 if(['42P01','PGRST202','PGRST205'].includes(code))return new OutboundError('BACKEND_NOT_INSTALLED','Falta instalar el SQL adicional de WhatsApp en Supabase.',503);
 const known={RATE_LIMITED:['LR pidió esperar antes de volver a intentar.',429],RECIPIENT_CHANGED:['El teléfono cambió. Revisa el destinatario antes de enviar.',409],NOT_AUTHORIZED:['La cuenta no está autorizada.',403],COMPANY_NOT_FOUND:['La empresa no está disponible.',404],CONTACT_BLOCKED:['La empresa está cerrada o archivada.',400],JOB_NOT_FOUND:['No se encontró este intento.',404],IDEMPOTENCY_CONFLICT:['Este identificador ya se usó con otro contenido. Conserva el intento original.',409],JOB_PENDING:['Ya hay un intento pendiente para este destinatario. Revisa el historial.',409],JOB_BUSY:['Este intento está siendo procesado. Consulta su estado antes de repetirlo.',409]};
 for(const [key,[text,status]] of Object.entries(known))if(message.includes(key))return new OutboundError(key,text,status);
 if(code==='PGRST116'||code==='23505')return new OutboundError('JOB_BUSY','El intento cambió desde otro dispositivo. Consulta su estado.',409);
 return new OutboundError('DATABASE_ERROR','No se pudo confirmar el registro. Consulta el historial antes de volver a intentar.',503);
}
export class WhatsAppStore{
 constructor({service,user,owner}){Object.assign(this,{service,user,owner});}
 async loadData(){const result=emptyData();let offset=0;while(true){const {data,error}=await this.user.from('crm_records').select('*').order('kind').order('id').range(offset,offset+999);if(error)throw databaseError(error);for(const row of data)if(result[row.kind])result[row.kind].push({...row.data,id:row.id,version:row.version,created_at:row.created_at,updated_at:row.updated_at});if(data.length<1000)break;offset+=1000;}return result;}
 async listJobs(companyId){const {data,error}=await this.service.from('crm_whatsapp_jobs').select('*').eq('owner_id',this.owner).eq('company_id',companyId).order('created_at',{ascending:false}).limit(20);if(error)throw databaseError(error);return data;}
 async getJob(id){const {data,error}=await this.service.from('crm_whatsapp_jobs').select('*').eq('owner_id',this.owner).eq('id',id).maybeSingle();if(error)throw databaseError(error);if(!data)throw new OutboundError('JOB_NOT_FOUND','No se encontró este intento.',404);return data;}
 async prepareJob(job){const {data,error}=await this.service.rpc('crm_whatsapp_prepare',{actor:this.owner,job});if(error)throw databaseError(error);return Array.isArray(data)?data[0]:data;}
 async claimJob(job,dryRun){const {data,error}=await this.service.rpc('crm_whatsapp_claim',{actor:this.owner,job_id:job.id,expected:job.version,is_dry_run:dryRun});if(error)throw databaseError(error);return Array.isArray(data)?data[0]:data;}
 async updateJob(job,patch){const {data,error}=await this.service.from('crm_whatsapp_jobs').update({...patch,version:job.version+1,updated_at:new Date().toISOString()}).eq('id',job.id).eq('owner_id',this.owner).eq('version',job.version).select('*').single();if(error)throw databaseError(error);return data;}
 async commit(operations){const {error}=await this.user.rpc('crm_commit',{operations});if(error)throw databaseError(error);}
}
