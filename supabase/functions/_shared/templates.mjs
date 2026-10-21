import {sectorFor,sectorHtml,sectorText,sectorSubject,sectorAssets,sectorWhatsApp} from './sectors.mjs';
// Shared content only. Sending requires the user's WhatsApp service and Zoho account.
export const WHATSAPP_TEXT = `Hola👋

Soy Julio, de Nexo. Le envié un correo sobre cómo ayudar a su equipo a buscar menos y responder más rápido, conectando su información.

Le comparto esta imagen para resumirlo.

¿Coordinamos 15 minutos para mostrarle un proyecto funcionando y revisar si puede servirle a su empresa?

https://nexoamedida.com`;

export const OUTREACH = Object.freeze({
 senderName: 'Julio Robles', senderEmail: 'asesoria@nexoamedida.com',
 phone: '+51 936 755 465', website: 'https://nexoamedida.com',
 demoUrl: 'https://nexoamedida.com/#demo',
 logoUrl: 'https://nexoamedida.com/brand/nexo-logo-email.png',
 whatsappImage: 'https://nexoamedida.com/presentacion/Nexo-WhatsApp-Informacion.jpg',
 emailAttachment: 'https://nexoamedida.com/presentacion/Nexo-Informacion-Conectada.pdf',
});
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
function companyName(value) {
 if(typeof value!=='string'||/[\r\n\u0000]/.test(value)||!value.trim()||value.trim().length>180)throw new Error('Indica el nombre de la empresa en una sola línea, con hasta 180 caracteres.');
 return value.trim();
}
export function emailSubject(name,sector='general'){if(sector!=='general'&&sectorFor({},sector)!=='general')return sectorSubject(companyName(name),sector);return `${companyName(name)}: menos búsquedas, respuestas más rápidas`;}
export function emailText(name,sector='general') {
 if(['impresion','computadoras'].includes(sector))return sectorText(companyName(name),sector);
 const company=companyName(name);
 return `Menos búsquedas.
Más claridad para trabajar.

Conectamos clientes, equipos, documentos y operaciones en un solo sistema, diseñado alrededor de cómo funciona cada empresa.

Hola, equipo de ${company}:

Soy Julio, de Nexo.

Cuando una consulta depende de revisar varios Excel, carpetas, documentos o preguntarle a la persona que “tiene el dato”, se pierde tiempo y cada área termina trabajando con información distinta.

En Nexo diseñamos sistemas de información a medida para que la empresa pueda consultar clientes, equipos, documentos, movimientos e historial desde un solo lugar.

La idea no es reemplazar todo de golpe, sino conectar primero la información que hoy genera más fricción y crecer por etapas.

Menos interrupciones para el equipo, respuestas más rápidas para sus clientes y mayor claridad para tomar decisiones.

Me gustaría mostrarles un proyecto real que ya desarrollamos y conversar sobre cómo podría aplicarse a su forma de trabajar.

Explorar la demo: ${OUTREACH.demoUrl}

¿Podemos coordinar una demostración de 15 minutos? Puede ser virtual o presencial en Lima. Si lo revisa otra persona, agradeceré que me ayuden a contactarla.

Saludos,
Julio Robles
Nexo · Sistemas de información a medida
asesoria@nexoamedida.com
+51 936 755 465

Información conectada. Empresas con claridad.
nexoamedida.com`;
}
export function emailHtml(name,sector='general') {
 if(['impresion','computadoras'].includes(sector))return sectorHtml(companyName(name),sector);
 const company=escape(companyName(name));
 const paragraph='margin:0 0 18px;line-height:1.65;';
 return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="icon" href="https://nexoamedida.com/favicon.ico"><title>Nexo | Presentación comercial</title>
<style>@media(max-width:620px){.email-outer{padding:16px 8px!important}.email-pad{padding-left:20px!important;padding-right:20px!important}.email-title{font-size:23px!important}.email-callout{padding:20px!important}}</style></head>
<body style="margin:0;padding:0;background:#f7f9f8;color:#202730;font-family:'DM Sans',Verdana,sans-serif;font-size:14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f7f9f8;"><tr><td class="email-outer" align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e1e7e3;border-radius:12px;border-collapse:separate;overflow:hidden;">
<tr><td class="email-pad" style="padding:26px 30px 22px;border-bottom:1px solid #e1e7e3;">
<img src="${OUTREACH.logoUrl}" width="156" height="54" alt="Nexo" style="display:block;border:0;width:156px;max-width:100%;height:auto;">
<p style="margin:6px 0 0;font-size:12px;line-height:1.6;letter-spacing:.25px;color:#52675b;">Sistemas de información a medida</p></td></tr>
<tr><td class="email-pad" style="padding:26px 30px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#eef2ee;border-radius:10px;"><tr><td class="email-callout" style="padding:24px;">
<h1 class="email-title" style="margin:0 0 12px;font-family:Manrope,'DM Sans',Verdana,sans-serif;font-size:26px;line-height:1.18;font-weight:700;color:#20352b;">Menos búsquedas.<br>Más claridad para trabajar.</h1>
<p style="margin:0;font-size:13px;line-height:1.8;color:#52675b;">Conectamos clientes, equipos, documentos y operaciones en un solo sistema, diseñado alrededor de cómo funciona cada empresa.</p>
</td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:22px 30px 0;font-size:14px;line-height:1.65;">
<p style="${paragraph}">Hola, equipo de <strong>${company}</strong>:</p>
<p style="${paragraph}">Soy Julio, de Nexo.</p>
<p style="${paragraph}">Cuando una consulta depende de revisar varios Excel, carpetas, documentos o preguntarle a la persona que “tiene el dato”, se pierde tiempo y cada área termina trabajando con información distinta.</p>
<p style="${paragraph}">En Nexo diseñamos sistemas de información a medida para que la empresa pueda consultar clientes, equipos, documentos, movimientos e historial desde un solo lugar.</p>
<p style="${paragraph}">La idea no es reemplazar todo de golpe, sino conectar primero la información que hoy genera más fricción y crecer por etapas.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;background:#f8faf9;border-left:3px solid #247459;"><tr><td style="padding:13px 15px;font-size:13px;line-height:1.6;font-weight:700;color:#20352b;">Menos interrupciones para el equipo, respuestas más rápidas para sus clientes y mayor claridad para tomar decisiones.</td></tr></table>
<p style="${paragraph}">Me gustaría mostrarles un proyecto real que ya desarrollamos y conversar sobre cómo podría aplicarse a su forma de trabajar.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr><td bgcolor="#247459" style="background:#247459;border-radius:7px;"><a href="${OUTREACH.demoUrl}" style="display:inline-block;padding:10px 18px;line-height:1.4;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Explorar la demo</a></td></tr></table>
<p style="${paragraph}">¿Podemos coordinar una demostración de 15 minutos? Puede ser virtual o presencial en Lima. Si lo revisa otra persona, agradeceré que me ayuden a contactarla.</p>
<p style="${paragraph}"><a href="${OUTREACH.emailAttachment}" style="color:#247459;text-decoration:underline;text-underline-offset:3px;">Descargar la presentación en PDF</a></p>
<p style="margin:42px 0 0;line-height:1.6;">Saludos,<br><strong>Julio Robles</strong><br><span style="color:#52675b;">Nexo · Sistemas de información a medida</span><br><a href="mailto:asesoria@nexoamedida.com" style="color:#247459;text-decoration:none;">asesoria@nexoamedida.com</a><br><a href="tel:+51936755465" style="color:#247459;text-decoration:none;">+51 936 755 465</a></p>
</td></tr>
<tr><td style="height:72px;line-height:72px;font-size:1px;">&nbsp;</td></tr>
<tr><td class="email-pad" bgcolor="#20352b" style="padding:18px 30px;background:#20352b;color:#ffffff;">
<p style="margin:0 0 6px;font-size:13px;line-height:1.5;font-weight:700;">Información conectada. Empresas con claridad.</p><p style="margin:0;font-size:11px;line-height:1.5;"><a href="${OUTREACH.website}" style="color:#ffffff;text-decoration:none;">nexoamedida.com</a></p>
</td></tr></table></td></tr></table>
</body></html>`;
}
export function prepareEmail(name) {
 return {fromName:OUTREACH.senderName,from:OUTREACH.senderEmail,subject:emailSubject(name),html:emailHtml(name),text:emailText(name),attachment:{filename:'Nexo-Informacion-Conectada.pdf',url:OUTREACH.emailAttachment}};
}
export function prepareWhatsApp({emailAlreadySent=false}={}) {
 if(emailAlreadySent!==true)throw new Error('Este mensaje dice «Le envié un correo». Registra o confirma ese envío antes de utilizarlo.');
 return {text:WHATSAPP_TEXT,imageUrl:OUTREACH.whatsappImage};
}
