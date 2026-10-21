import manifest from './campaign.json' with {type:'json'};
import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {OutboundError} from '../_shared/whatsapp-core.mjs';
import {authenticateSupabase,createWhatsAppHandler} from '../_shared/whatsapp-http.mjs';
import {whatsappRuntime} from '../_shared/whatsapp-runtime.mjs';
import {sectorFor,TEMPLATE_VERSION} from '../_shared/sectors.mjs';
Deno.serve(createWhatsAppHandler({
 authenticate:async(authorization:string)=>{
  const url=Deno.env.get('SUPABASE_URL'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),anonKey=Deno.env.get('SUPABASE_ANON_KEY');
  if(!url||!serviceKey||!anonKey)throw new OutboundError('BACKEND_NOT_CONFIGURED','La función no tiene configurada su conexión interna.',503);
  const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  return authenticateSupabase(authorization,{service,makeUser:header=>createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:header}}})});
 },
 makeService:async(identity,input)=>{
  let template=input.template;
  if(['refresh','recover','cancel'].includes(input.action)){
   const {data}=await identity.service.from('crm_whatsapp_jobs').select('image_sha256').eq('owner_id',identity.owner).eq('id',input.jobId).maybeSingle();
   template=Object.entries(manifest.sectors||{}).find(([,asset])=>asset.sha256===data?.image_sha256)?.[0]||'general';
  }else if(!template){const {data}=await identity.user.from('crm_records').select('data').eq('kind','companies').eq('id',input.companyId).maybeSingle();template=sectorFor(data?.data);}
  const api=whatsappRuntime(identity,template),context=api.context.bind(api);api.context=async companyId=>({...await context(companyId),templateVersion:TEMPLATE_VERSION,sector:template});return api;
 }
}));
