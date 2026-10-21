# Automatización de mensajes · 20 de octubre de 2026

## Estado y contenido

Nexo incorpora la vista «Enviar WhatsApp» en la ficha de empresa: imagen y caption juntos, teléfono de empresa o persona de contacto, remitente fijo Julio · +51 936 755 465, edición del texto, validación sin envío, confirmación de correo previo, autorización exigida por el contrato LR e historial con estados reales. No hay envío masivo ni lectura de chats.

El ZIP inicial contenía un contrato pendiente de publicar. El nuevo paquete `Integracion_CRM_WhatsApp_LR_PUBLICADA_20261020.zip` confirma que LR publicó ese contrato y su informe documenta pruebas secas sin encolar mensajes. No hace falta el repositorio de LR. El cliente es idéntico en comportamiento; solo cambió su encabezado. El último estado documentado del teléfono era desconectado: se vincula en Campañas → Mi WhatsApp comercial. Estas son declaraciones del informe de entrega, no comprobaciones remotas de Nexo. La credencial recibida por separado no se guardó en archivos, repositorios ni paquetes públicos. No se abrió otra sesión de Baileys. Los documentos operativos originales permanecen fuera de este repositorio público.

Julio proporcionó el texto exacto de WhatsApp y dos capturas de su correo de Zoho. El asunto es `[Empresa]: menos búsquedas, respuestas más rápidas` y el saludo utiliza esa misma empresa. El HTML reproduce el texto visible, recuadro, botón y firma; no se recibió una exportación HTML y no se afirma igualdad byte a byte con Zoho. El remitente es Julio Robles, `asesoria@nexoamedida.com`; el botón apunta a la demo real. El PDF y JPG previos se conservan. El logo PNG se extrajo sin modificar del paquete de marca y tiene punto circular.

Fuente: `integrations/outreach/templates.mjs`. Exportación: `node scripts/sales-kit/export-outreach.mjs`. Archivos revisables: `/SKYROTE13/plantillas/`. Son contenido genérico, sin prospectos ni credenciales. Preparar una plantilla no envía mensajes.

## Backend privado

Una Supabase Edge Function `crm-whatsapp` verifica el JWT mediante `auth.getUser`, comprueba `crm_members` con la sesión del propietario y utiliza una tabla adicional `crm_whatsapp_jobs`. Esa tabla tiene RLS, lectura exclusiva del propietario y escrituras solo desde el rol de servidor. Sus RPC son privadas; no se autoriza por un UUID o metadato proporcionado por el navegador. CORS solo permite el dominio de Nexo, y no sustituye la autenticación. `verify_jwt=false` en la configuración evita depender de la verificación del gateway, pero la función valida la sesión y membresía en cada POST; no permite uso anónimo.

Las variables `LR_WHATSAPP_ENDPOINT`, `LR_WHATSAPP_TOKEN`, `LR_WHATSAPP_ENABLED` y `NEXO_WHATSAPP_OWNER_ID` se guardan en secretos de Edge Functions. No se ponen en campos del CRM, localStorage, JavaScript público, `VITE_*` ni respaldos de Ajustes. El endpoint publicado es `https://www.sistemalr.com/api/bot-action?externalWhatsApp=v1`. El envío real requiere `LR_WHATSAPP_ENABLED=true`; con false solo se permite validación sin envío. El cliente comprueba el remitente exacto y no ofrece QR, conexión/desconexión ni cambio de sesión.

La imagen es el JPG comercial existente; su URL está fijada en el paquete, se bloquean redirecciones y se comprueba su SHA-256. No se aceptan URLs de imágenes aportadas por el navegador. La clave LR nunca se envía al almacenamiento de imágenes. El paquete de función tiene una lista explícita de archivos y no incluye `.env`, claves, datos de sesión ni notas de infraestructura LR.

## Persistencia y recuperación

El UUID de la intención se guarda antes de llamar a LR. El contenido se congela y las solicitudes repetidas usan el mismo UUID y sus mismos datos. Un reclamo de versión y lease evita que dos solicitudes despachen simultáneamente. La preparación serializa por propietario, recupera un intento pendiente idéntico y rechaza contenido distinto para la misma intención. Un envío con el mismo contenido completo ya confirmado se recupera, no se despacha otra vez. Editar texto o destinatario tras un cierre crea una intención nueva con la acción explícita del usuario.

`queued` o `processing` no cambian el pipeline. Solo `sent` registra un contacto de WhatsApp, con hora de Lima, mediante el contrato existente `crm_commit`. «Enviado a WhatsApp» no equivale a entregado ni leído. El ID determinista `wa-<UUID>` evita duplicar actividades. Si falla el registro de historial después de un envío confirmado, se informa que está pendiente y se reintenta únicamente ese registro. Una empresa cerrada entretanto conserva su cierre: se registra el evento real sin reabrirla. Se preservan ventas, pagos, hitos y entregas.

Un timeout posterior a la solicitud queda como `uncertain`. No se reenvía automáticamente. Si existe UUID LR, se consulta; si no se recibió, el usuario puede revisar el mismo intento mediante la idempotencia del contrato LR. Nunca se genera otra clave para salir de un error. Un lease vencido de un intento real queda incierto; una validación interrumpida vuelve a preparada sin afirmar envío. Solo se descartan borradores preparados o validados: el contrato recibido no tiene cancelación de trabajos ya aceptados por LR.

El texto dice «Le envié un correo». El servidor exige un contacto de correo existente o una afirmación explícita del envío manual; no registra un correo inventado. El contrato LR recibido también exige autorización del destinatario, origen y fecha. Nexo solicita esos datos; no los sustituye por el hecho de registrar una empresa.

El estado se consulta mientras la vista está abierta y visible, cada 12 segundos. LR procesa su propia cola incluso con la página cerrada. Al reabrir se recuperan los intentos y se reconcilian los estados. No hay un cron de Nexo instalado que garantice actualización del pipeline con todos los navegadores cerrados. Los respaldos actuales del CRM incluyen las actividades confirmadas, pero no restauran automáticamente la tabla privada de intentos; no se reactiva una cola al importar respaldos.

## Instalación y alcance

Guía: `/SKYROTE13/whatsapp/`. SQL adicional: `/SKYROTE13/instalar-whatsapp.sql`. Paquete: `/SKYROTE13/whatsapp/Nexo-WhatsApp-Supabase.zip`. El SQL es repetible y aditivo; no reinstala ni borra el CRM. Los módulos puros del dominio y pipeline se copian a `_shared/crm` al compilar, para compartir la lógica existente con la función. La huella de imagen se genera en ese mismo paso.

La prueba seca permite validar el mensaje aunque el teléfono aún esté desconectado. El envío real comprueba la sesión antes de solicitarlo y LR vuelve a verificarla al despachar.

La interfaz y los materiales pueden publicarse en GitHub Pages. La función, el SQL y los secretos requieren instalación en Supabase. No hay token CLI ni credencial administrativa de despliegue configurada en este entorno, y HTTP directo al proveedor está bloqueado. Las pruebas usan PostgreSQL local y APIs simuladas. No se han modificado datos de producción ni enviado mensajes a prospectos. No se puede afirmar que exista una conexión en vivo hasta completar la activación y la prueba controlada.

## Zoho gratuito y entregabilidad

Julio confirmó la versión gratuita, MX/SPF/DKIM verificados y una prueba de correo satisfactoria. La disponibilidad efectiva de API/OAuth o SMTP en esa cuenta todavía debe confirmarse al autorizar la aplicación. No se solicita ni se guarda la contraseña de Zoho; la integración espera un refresh token limitado.

La automatización posterior reutilizará el remitente Zoho e incluirá límites del proveedor, duplicados, bloqueo de contactos que pidieron no recibir mensajes y tratamiento de rebotes/rechazos disponibles. No se promete evitar spam: también intervienen autenticación/alineación, reputación, contenido y calidad de las direcciones. El envío individual de Nexo no modifica las condiciones del proveedor ni garantiza un costo o capacidad ilimitados.

## Instalación desde el editor web

Si los secretos ya están configurados, la función puede instalarse sin terminal desde Edge Functions → Deploy a new function → Via Editor. El archivo `/SKYROTE13/whatsapp/crm-whatsapp-editor.txt`, generado con esbuild a partir de la entrada original, reúne módulos, plantilla de imagen y lógica de autenticación. Se pega completo en `index.ts`, usando el nombre exacto `crm-whatsapp`. No incorpora valores de variables de entorno. Solo permanecen imports externos `npm:` y `node:`, compatibles con el runtime objetivo.

La opción Verify JWT with legacy secret se desactiva para reproducir `verify_jwt=false` del paquete CLI. La función sigue validando la sesión mediante getUser, membresía y vinculación al propietario. La nueva prueba ejecuta el archivo generado con el registro Deno simulado y SDK Supabase instalado; comprueba OPTIONS, método, rechazo de sesión ausente y falta de configuración interna. No equivale a ejecutar Deno ni a desplegarlo. Pasa la compilación y las 85 pruebas unitarias, además de los nueve recorridos existentes de WhatsApp. No se modificaron tablas ni se guardaron secretos.

## Correo desde Zoho Mail

La ficha de empresa añade «Enviar correo». Como la cuenta gratuita no muestra plantillas utilizables por API, Nexo genera el mismo diseño comercial y envía el contenido HTML desde Zoho; la presentación PDF queda enlazada dentro del correo. La función privada `crm-email` usa OAuth con refresh token y mantiene los secretos en Supabase. Requiere `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNT_ID`, `ZOHO_FROM_ADDRESS` y `ZOHO_MAIL_ENABLED`. No requiere `ZOHO_TEMPLATE_ID`. La cuenta gratuita debe permitir el alcance de creación de mensajes y el botón permanece bloqueado hasta que se active explícitamente el envío. No se guarda la contraseña de Zoho.
