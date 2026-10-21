import {mkdir,writeFile} from 'node:fs/promises';
import {emailHtml,emailText,emailSubject,WHATSAPP_TEXT,OUTREACH} from '../../integrations/outreach/templates.mjs';
const output=new URL('../../public/SKYROTE13/plantillas/',import.meta.url);
await mkdir(output,{recursive:true});
await writeFile(new URL('correo.html',output),emailHtml('[Empresa]'));
await writeFile(new URL('correo.txt',output),`ASUNTO: ${emailSubject('[Empresa]')}\n\n${emailText('[Empresa]')}\n`);
await writeFile(new URL('whatsapp.txt',output),WHATSAPP_TEXT+'\n');
await writeFile(new URL('LEEME.txt',output),`NEXO · PLANTILLAS DE PROSPECCIÓN\n\nCorreo reconstruido con el texto y diseño de las capturas de Julio. Reemplazar [Empresa] en asunto y saludo.\n\nAdjunto del correo: ${OUTREACH.emailAttachment}\nImagen de WhatsApp: ${OUTREACH.whatsappImage}\n\nWhatsApp conserva el texto proporcionado. Usarlo después de enviar realmente el correo mencionado.\n\nEstado: contenido preparado. El envío automático todavía no está conectado. LR informó que su API ya está publicada. Falta instalar y configurar la función privada de Nexo en Supabase y comprobar el WhatsApp vinculado. También debe comprobarse el acceso permitido por el plan gratuito de Zoho. No hay claves, contraseñas ni datos de prospectos en estos archivos.\n`);
console.log('Plantillas exportadas a public/SKYROTE13/plantillas/. No se envió ningún mensaje.');
