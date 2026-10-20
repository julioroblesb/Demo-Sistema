import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authenticateSupabase,createWhatsAppHandler,authorizeSenderOwner} from '../../supabase/functions/_shared/whatsapp-http.mjs';
import {OutboundError} from '../../supabase/functions/_shared/whatsapp-core.mjs';
const request=(body,headers={})=>new Request('https://project.supabase.co/functions/v1/crm-whatsapp',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});

test('HTTP: sin sesión o con sesión inválida no se construye el servicio ni se consulta LR',async()=>{let called=0;const handler=createWhatsAppHandler({authenticate:async()=>{throw new OutboundError('UNAUTHENTICATED','Sesión inválida.',401);},makeService:()=>{called++;}});assert.equal((await handler(request({action:'context',companyId:'company'}))).status,401);assert.equal((await handler(request({action:'submit'},{Authorization:'Bearer forged'}))).status,401);assert.equal(called,0);});
test('HTTP: el propietario viene de la sesión verificada, nunca del JSON enviado por el navegador',async()=>{let identity;const handler=createWhatsAppHandler({authenticate:async()=>({owner:'verified-owner'}),makeService:auth=>{identity=auth;return {context:async()=>({configured:false})};}});const response=await handler(request({action:'context',companyId:'company',owner:'attacker'},{Authorization:'Bearer valid-user-session'}));assert.equal(response.status,200);assert.equal(identity.owner,'verified-owner');assert.equal((await response.json()).configured,false);assert.equal(response.headers.get('cache-control'),'no-store');});
test('HTTP: origen ajeno, JSON inválido y errores internos no revelan secretos',async()=>{const handler=createWhatsAppHandler({authenticate:async()=>({owner:'a'}),makeService:()=>{throw new Error('SECRET_TOKEN_DO_NOT_EXPOSE');}});const rejected=await handler(request({action:'context'},{Origin:'https://evil.example',Authorization:'Bearer token'}));assert.equal(rejected.status,403);const error=await handler(request({action:'context'},{Authorization:'Bearer token'}));assert.equal(error.status,503);assert.equal((await error.text()).includes('SECRET_TOKEN'),false);});
test('Auth: getUser valida el token y la membresía antes de devolver acceso',async()=>{
 let checkedToken='',checkedOwner='';
 const service={auth:{getUser:async token=>{checkedToken=token;return {data:{user:{id:'owner-from-auth'}}};}}};
 const user={from:table=>{assert.equal(table,'crm_members');return {select:()=>({eq:(_key,value)=>{checkedOwner=value;return {maybeSingle:async()=>({data:{user_id:value}})};}})};}};
 const result=await authenticateSupabase('Bearer session',{service,makeUser:authorization=>{assert.equal(authorization,'Bearer session');return user;}});
 assert.equal(checkedToken,'session');assert.equal(checkedOwner,'owner-from-auth');assert.equal(result.owner,'owner-from-auth');
 await assert.rejects(()=>authenticateSupabase('Bearer bad',{service:{auth:{getUser:async()=>({error:new Error('bad')})}},makeUser:()=>{throw new Error('No debe consultar miembros');}}),error=>error.code==='UNAUTHENTICATED');
 const denied={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null})})})})};
 await assert.rejects(()=>authenticateSupabase('Bearer valid',{service,makeUser:()=>denied}),error=>error.code==='NOT_AUTHORIZED');
});


test('La clave LR solo se puede utilizar con el propietario fijado en servidor',()=>{const owner='11111111-1111-4111-8111-111111111111';assert.doesNotThrow(()=>authorizeSenderOwner(owner,owner,true));assert.throws(()=>authorizeSenderOwner(owner,null,true),error=>error.code==='SENDER_OWNER_NOT_CONFIGURED');assert.throws(()=>authorizeSenderOwner('22222222-2222-4222-8222-222222222222',owner,true),error=>error.code==='SENDER_NOT_AUTHORIZED');assert.doesNotThrow(()=>authorizeSenderOwner(owner,null,false));});
