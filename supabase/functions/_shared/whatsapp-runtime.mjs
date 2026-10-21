import {Buffer} from 'node:buffer';
import {LrWhatsAppClient} from './lr-whatsapp-client.mjs';
import {WhatsAppService,OutboundError} from './whatsapp-core.mjs';
import {WhatsAppStore} from './whatsapp-store.mjs';
import {authorizeSenderOwner} from './whatsapp-http.mjs';
import manifest from '../crm-whatsapp/campaign.json' with {type:'json'};
export function whatsappRuntime(identity,template='general'){
 const token=Deno.env.get('LR_WHATSAPP_TOKEN')||'',endpoint=Deno.env.get('LR_WHATSAPP_ENDPOINT')||'https://www.sistemalr.com/api/bot-action?externalWhatsApp=v1',configured=token.length>=32&&!token.includes('REEMPLAZAR_');
 authorizeSenderOwner(identity.owner,Deno.env.get('NEXO_WHATSAPP_OWNER_ID'),configured);
 const campaign=manifest.sectors?.[template]||manifest;
 return new WhatsAppService({store:new WhatsAppStore(identity),provider:configured?new LrWhatsAppClient({token,endpoint}):null,configured,enabled:Deno.env.get('LR_WHATSAPP_ENABLED')==='true',imageHash:campaign.sha256,loadImage:async()=>{
  const response=await fetch(campaign.url,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok||Number(response.headers.get('content-length')||0)>5242880)throw new OutboundError('IMAGE_UNAVAILABLE','No se pudo cargar la imagen de Nexo.',503);
  const bytes=Buffer.from(await response.arrayBuffer());if(!bytes.length||bytes.length>5242880)throw new OutboundError('IMAGE_UNAVAILABLE','La imagen no tiene el tamaño permitido.',503);return bytes;
 }});
}
