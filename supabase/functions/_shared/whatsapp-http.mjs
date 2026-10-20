import {OutboundError} from './whatsapp-core.mjs';
export async function authenticateSupabase(authorization,{service,makeUser}){
 if(!/^Bearer \S+$/i.test(authorization||''))throw new OutboundError('UNAUTHENTICATED','Inicia sesión para acceder a los envíos.',401);
 const {data,error}=await service.auth.getUser(authorization.replace(/^Bearer /i,''));
 if(error||!data?.user)throw new OutboundError('UNAUTHENTICATED','La sesión no es válida. Vuelve a iniciar sesión.',401);
 const user=makeUser(authorization);const {data:member,error:membershipError}=await user.from('crm_members').select('user_id').eq('user_id',data.user.id).maybeSingle();
 if(membershipError||!member)throw new OutboundError('NOT_AUTHORIZED','Esta cuenta no está autorizada en Nexo CRM.',403);
 return {service,user,owner:data.user.id};
}

export function authorizeSenderOwner(owner,expectedOwner,configured){
 if(!configured)return;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(expectedOwner||''))throw new OutboundError('SENDER_OWNER_NOT_CONFIGURED','Falta vincular el WhatsApp de Julio a su usuario del CRM. Revisa los pasos de activación.',503);
 if(owner!==expectedOwner)throw new OutboundError('SENDER_NOT_AUTHORIZED','Esta cuenta no está autorizada para usar el WhatsApp de Julio.',403);
}

export function createWhatsAppHandler({authenticate,makeService,origin='https://nexoamedida.com'}){
 const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store','Vary':'Origin'};
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json; charset=utf-8'}});
 return async req=>{
  if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({error:{code:'ORIGIN_DENIED',message:'Origen no autorizado.'}},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return reply({error:{code:'METHOD_NOT_ALLOWED',message:'Usa POST.'}},405);
  try{
   const authorization=req.headers.get('authorization')||'';
   if(!/^Bearer \S+$/i.test(authorization))throw new OutboundError('UNAUTHENTICATED','Inicia sesión para acceder a los envíos.',401);
   const identity=await authenticate(authorization);
   if(Number(req.headers.get('content-length')||0)>12000)throw new OutboundError('INVALID_REQUEST','La solicitud es demasiado grande.',413);
   const text=await req.text();if(text.length>12000)throw new OutboundError('INVALID_REQUEST','La solicitud es demasiado grande.',413);
   let input;try{input=JSON.parse(text);}catch{throw new OutboundError('INVALID_REQUEST','La solicitud no es válida.');}
   if(!input||typeof input!=='object'||Array.isArray(input))throw new OutboundError('INVALID_REQUEST','La solicitud no es válida.');
   const api=await makeService(identity);
   if(input.action==='context')return reply(await api.context(input.companyId));
   if(input.action==='submit')return reply({job:await api.submit(input)});
   if(input.action==='refresh')return reply({job:await api.refresh(input.jobId)});
   if(input.action==='recover')return reply({job:await api.recover(input.jobId)});
   if(input.action==='cancel')return reply({job:await api.cancel(input.jobId)});
   throw new OutboundError('INVALID_REQUEST','Acción no disponible.');
  }catch(error){const problem=error instanceof OutboundError?error:new OutboundError('INTEGRATION_ERROR','No se pudo completar la operación. Consulta el historial antes de repetirla.',503);return reply({error:{code:problem.code,message:problem.message}},problem.status);}
 };
}
