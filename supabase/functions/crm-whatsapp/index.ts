import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {Buffer} from 'node:buffer';
import {LrWhatsAppClient} from '../_shared/lr-whatsapp-client.mjs';
import {WhatsAppService,OutboundError} from '../_shared/whatsapp-core.mjs';
import {WhatsAppStore} from '../_shared/whatsapp-store.mjs';
import {authenticateSupabase,createWhatsAppHandler,authorizeSenderOwner} from '../_shared/whatsapp-http.mjs';
import campaign from './campaign.json' with {type:'json'};

Deno.serve(createWhatsAppHandler({
 authenticate:async(authorization:string)=>{
  const url=Deno.env.get('SUPABASE_URL'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),anonKey=Deno.env.get('SUPABASE_ANON_KEY');
  if(!url||!serviceKey||!anonKey)throw new OutboundError('BACKEND_NOT_CONFIGURED','La función no tiene configurada su conexión interna.',503);
  const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  return authenticateSupabase(authorization,{service,makeUser:header=>createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:header}}})});
 },
 makeService:({service,user,owner})=>{
  const token=Deno.env.get('LR_WHATSAPP_TOKEN')||'',endpoint=Deno.env.get('LR_WHATSAPP_ENDPOINT')||'https://www.sistemalr.com/api/bot-action?externalWhatsApp=v1';
  const configured=token.length>=32&&!token.includes('REEMPLAZAR_');
  authorizeSenderOwner(owner,Deno.env.get('NEXO_WHATSAPP_OWNER_ID'),configured);
  const provider=configured?new LrWhatsAppClient({token,endpoint}):null;
  return new WhatsAppService({store:new WhatsAppStore({service,user,owner}),provider,configured,enabled:Deno.env.get('LR_WHATSAPP_ENABLED')==='true',imageHash:campaign.sha256,loadImage:async()=>{
   const response=await fetch(campaign.url,{redirect:'error',signal:AbortSignal.timeout(20000)});
   if(!response.ok||Number(response.headers.get('content-length')||0)>5242880)throw new OutboundError('IMAGE_UNAVAILABLE','No se pudo cargar la imagen de Nexo.',503);
   const image=Buffer.from(await response.arrayBuffer());if(!image.length||image.length>5242880)throw new OutboundError('IMAGE_UNAVAILABLE','La imagen no tiene el tamaño permitido.',503);return image;
  }});
 }
}));
