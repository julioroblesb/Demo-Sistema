# Cliente LR recibido

El cliente de referencia proporcionado por Julio está en `supabase/functions/_shared/lr-whatsapp-client.mjs`. Conserva el contrato recibido y añade la importación explícita de `Buffer` para compatibilidad con Deno. Las pruebas originales, adaptadas a su ubicación, están en `checks/crm/lr-client.test.mjs`.

El paquete actualizado `Integracion_CRM_WhatsApp_LR_PUBLICADA_20261020.zip` confirma que LR publicó el endpoint externo. Su cliente conserva el mismo comportamiento que el paquete anterior; solo cambia el encabezado de estado. La credencial recibida por separado no se guarda en este repositorio. La publicación y pruebas de LR son declaraciones del informe de entrega, no comprobaciones remotas realizadas desde este entorno. Las notas operativas completas del archivo adjunto permanecen fuera de este repositorio público; no se publican rutas internas ni configuración de infraestructura del otro sistema.
