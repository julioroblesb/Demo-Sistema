import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),shared=new URL('supabase/functions/_shared/',root);
await mkdir(new URL('crm/',shared),{recursive:true});
for(const name of ['domain.js','prospecting.js'])await copyFile(new URL('src/crm/'+name,root),new URL('crm/'+name,shared));
await copyFile(new URL('integrations/outreach/whatsapp-domain.mjs',root),new URL('whatsapp-domain.mjs',shared));
await copyFile(new URL('integrations/outreach/zoho-mail.mjs',root),new URL('outreach-templates.mjs',shared));
await copyFile(new URL('integrations/outreach/templates.mjs',root),new URL('templates.mjs',shared));
await copyFile(new URL('integrations/outreach/sectors.mjs',root),new URL('sectors.mjs',shared));
const sectorImages={};for(const key of ['impresion','computadoras']){const bytes=await readFile(new URL(`public/presentacion/Nexo-${key}${key==='impresion'?'-v2':''}-WhatsApp.jpg`,root));sectorImages[key]={url:`https://nexoamedida.com/presentacion/Nexo-${key}${key==='impresion'?'-v2':''}-WhatsApp.jpg`,sha256:createHash('sha256').update(bytes).digest('hex')};}
// Keep the original artwork available for recovering pre-existing WhatsApp attempts.
const previousPrint=await readFile(new URL('public/presentacion/Nexo-impresion-WhatsApp.jpg',root));
sectorImages.impresion_v1={url:'https://nexoamedida.com/presentacion/Nexo-impresion-WhatsApp.jpg',sha256:createHash('sha256').update(previousPrint).digest('hex')};
const bytes=await readFile(new URL('public/presentacion/Nexo-WhatsApp-Informacion.jpg',root));
await writeFile(new URL('supabase/functions/crm-whatsapp/campaign.json',root),JSON.stringify({sectors:sectorImages,url:'https://nexoamedida.com/presentacion/Nexo-WhatsApp-Informacion.jpg',sha256:createHash('sha256').update(bytes).digest('hex')},null,2)+'\n');
console.log('Dominio compartido y huella de imagen preparados para la función privada.');
