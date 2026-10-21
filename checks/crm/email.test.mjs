import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ZohoMailClient,EmailService} from '../../supabase/functions/_shared/email-core.mjs';
const id='e64237db-c4ea-4382-8c0d-d47d4424f591';
const data={companies:[{id:'c1',name:'Empresa Norte',email:'cliente@example.com'}],contacts:[]};
test('Correo seco prepara el correo y personaliza asunto sin llamar al proveedor',async()=>{const provider=new ZohoMailClient({clientId:'id',clientSecret:'secret',refreshToken:'refresh',accountId:'account',fromAddress:'asesoria@nexoamedida.com',fetcher:async()=>{throw new Error('No debe enviar');}});const service=new EmailService({provider,enabled:false,store:{loadData:async()=>data}});const result=await service.send({sendId:id,companyId:'c1',dryRun:true});assert.equal(result.status,'validated');assert.equal(result.toAddress,'cliente@example.com');assert.match(result.subject,/Empresa Norte/);});
test('Correo real requiere habilitación',async()=>{const provider=new ZohoMailClient({clientId:'id',clientSecret:'secret',refreshToken:'refresh',accountId:'account',fromAddress:'asesoria@nexoamedida.com',fetcher:async()=>{throw new Error('No debe enviar');}});const service=new EmailService({provider,enabled:false,store:{loadData:async()=>data}});await assert.rejects(()=>service.send({sendId:id,companyId:'c1',dryRun:false}),error=>error.code==='SENDING_DISABLED');});
