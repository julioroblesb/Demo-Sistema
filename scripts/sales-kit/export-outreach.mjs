import {sectorWhatsApp} from '../../integrations/outreach/sectors.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {emailHtml,emailText,emailSubject,WHATSAPP_TEXT,OUTREACH} from '../../integrations/outreach/templates.mjs';
const output=new URL('../../public/SKYROTE13/plantillas/',import.meta.url);
await mkdir(output,{recursive:true});
await writeFile(new URL('correo.html',output),emailHtml('[Empresa]'));
await writeFile(new URL('correo.txt',output),`ASUNTO: ${emailSubject('[Empresa]')}\n\n${emailText('[Empresa]')}\n`);
await writeFile(new URL('whatsapp.txt',output),WHATSAPP_TEXT+'\n');
await writeFile(new URL('LEEME.txt',output),`NEXO · PLANTILLAS DE PROSPECCIÓN\n\nLos archivos correo.html y whatsapp.txt conservan la presentación general original. Las variantes impresion y computadoras incluyen mensajes específicos de cada rubro.\n\nLos PDF y las imágenes por rubro están disponibles en https://nexoamedida.com/SKYROTE13/campanas/ . Allí también se explica cómo actualizar las dos funciones privadas del CRM, conservando los secretos existentes.\n\nEl CRM permite correo, WhatsApp independiente o ambos. El mensaje solo debe afirmar que se envió un correo cuando ese envío esté confirmado. Los archivos de referencia no envían mensajes ni contienen credenciales.\n`);
console.log('Plantillas exportadas a public/SKYROTE13/plantillas/. No se envió ningún mensaje.');

for(const sector of ['impresion','computadoras']){await writeFile(new URL(`correo-${sector}.html`,output),emailHtml('[Empresa]',sector));await writeFile(new URL(`correo-${sector}.txt`,output),`ASUNTO: ${emailSubject('[Empresa]',sector)}\n\n${emailText('[Empresa]',sector)}\n`);await writeFile(new URL(`whatsapp-${sector}.txt`,output),sectorWhatsApp({},sector)+'\n');}
