import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

test('El archivo del editor es autónomo y conserva el rechazo de acceso sin sesión',async()=>{
 const source=await readFile(new URL('../../public/SKYROTE13/whatsapp/crm-whatsapp-editor.txt',import.meta.url),'utf8');
 assert.doesNotMatch(source,/from\s+["']\.\.?\//);
 assert.doesNotMatch(source,/lrwa_[A-Za-z0-9_-]{20,}/);
 assert.match(source,/Deno\.env\.get\("LR_WHATSAPP_TOKEN"\)/);
 assert.match(source,/Deno\.env\.get\("NEXO_WHATSAPP_OWNER_ID"\)/);
 const require=createRequire(import.meta.url);
 const sdk=pathToFileURL(require.resolve('@supabase/supabase-js')).href;
 const local=source.replace('npm:@supabase/supabase-js@2.118.0',sdk);
 let handler;const previous=globalThis.Deno;
 globalThis.Deno={serve:fn=>{handler=fn;},env:{get:()=>undefined}};
 try{
  await import('data:text/javascript;base64,'+Buffer.from(local).toString('base64'));
  assert.equal(typeof handler,'function');
  const url='https://project.supabase.co/functions/v1/crm-whatsapp';
  assert.equal((await handler(new Request(url))).status,405);
  assert.equal((await handler(new Request(url,{method:'POST',body:'{}'}))).status,401);
  assert.equal((await handler(new Request(url,{method:'OPTIONS',headers:{Origin:'https://nexoamedida.com'}}))).status,204);
  const response=await handler(new Request(url,{method:'POST',headers:{Authorization:'Bearer not-a-session'},body:'{}'}));
  assert.equal(response.status,503);
  assert.equal((await response.json()).error.code,'BACKEND_NOT_CONFIGURED');
 }finally{if(previous===undefined)delete globalThis.Deno;else globalThis.Deno=previous;}
});
