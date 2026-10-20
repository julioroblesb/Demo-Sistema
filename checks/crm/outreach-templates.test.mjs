import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {OUTREACH,WHATSAPP_TEXT,emailHtml,emailText,emailSubject,prepareEmail,prepareWhatsApp} from '../../integrations/outreach/templates.mjs';

test('Correo: el nombre real se utiliza en asunto y saludo, con el texto de las capturas',()=>{
 const message=prepareEmail('Alquileres Perú Norte');
 assert.equal(message.subject,'Alquileres Perú Norte: menos búsquedas, respuestas más rápidas');
 assert.match(message.html,/Hola, equipo de <strong>Alquileres Perú Norte<\/strong>:/);
 assert.match(message.text,/Hola, equipo de Alquileres Perú Norte:/);
 assert.match(message.text,/La idea no es reemplazar todo de golpe, sino conectar primero la información que hoy genera más fricción y crecer por etapas\./);
 assert.match(message.text,/Puede ser virtual o presencial en Lima/);assert.match(message.text,/Julio Robles/);
 assert.equal(message.from,'asesoria@nexoamedida.com');assert.equal(message.html.includes('ADF SAC'),false);
});

test('El nombre de empresa no puede introducir cabeceras ni etiquetas HTML',()=>{
 const name='A & B <img src=x onerror=alert(1)> "Perú"';
 assert.match(emailHtml(name),/A &amp; B &lt;img src=x onerror=alert\(1\)&gt; &quot;Perú&quot;/);
 assert.equal(emailHtml(name).includes('<img src=x'),false);assert.match(emailText(name),/A & B <img/);
 for(const invalid of ['', ' ',null,'Empresa\r\nBcc:otro@example.com','Empresa\u0000','a'.repeat(181)])assert.throws(()=>emailSubject(invalid),/nombre de la empresa/);
});

test('WhatsApp conserva el texto exacto y exige que el correo mencionado ya haya sido enviado',()=>{
 const expected='Hola👋\n\nSoy Julio, de Nexo. Le envié un correo sobre cómo ayudar a su equipo a buscar menos y responder más rápido, conectando su información.\n\nLe comparto esta imagen para resumirlo.\n\n¿Coordinamos 15 minutos para mostrarle un proyecto funcionando y revisar si puede servirle a su empresa?\n\nhttps://nexoamedida.com';
 assert.equal(WHATSAPP_TEXT,expected);assert.throws(()=>prepareWhatsApp(),/Registra o confirma ese envío/);assert.throws(()=>prepareWhatsApp({emailAlreadySent:'true'}));
 assert.equal(prepareWhatsApp({emailAlreadySent:true}).text,expected);assert.equal(prepareWhatsApp({emailAlreadySent:true}).imageUrl,OUTREACH.whatsappImage);
});

test('Los enlaces y adjuntos corresponden a los activos existentes y a la demo real de Nexo',()=>{
 const root=new URL('../../public/',import.meta.url);
 for(const value of [OUTREACH.emailAttachment,OUTREACH.whatsappImage,OUTREACH.logoUrl]){const url=new URL(value);assert.equal(url.origin,'https://nexoamedida.com');assert.ok(existsSync(new URL('.'+url.pathname,root)));}
 assert.match(readFileSync(new URL('../../index.html',import.meta.url),'utf8'),/id="demo"/);
 assert.equal(prepareEmail('Empresa').attachment.filename,'Nexo-Informacion-Conectada.pdf');
});

test('Los archivos exportados coinciden con las plantillas preparadas y no contienen mecanismos de envío ni seguimiento',()=>{
 const root=new URL('../../public/SKYROTE13/plantillas/',import.meta.url);
 const html=readFileSync(new URL('correo.html',root),'utf8');
 assert.equal(html,emailHtml('[Empresa]'));assert.equal(readFileSync(new URL('whatsapp.txt',root),'utf8').trimEnd(),WHATSAPP_TEXT);
 assert.match(html,/noindex,nofollow/);assert.doesNotMatch(html,/<script|<iframe|<form|onload=|utm_|tracking|pixel/i);
 assert.ok(Buffer.byteLength(html)<40000,'El HTML debe mantenerse ligero.');
 assert.equal((html.match(/<img /g)||[]).length,1);
});
