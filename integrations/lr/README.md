# Cliente LR recibido

El cliente de referencia proporcionado por Julio está en `supabase/functions/_shared/lr-whatsapp-client.mjs`. Conserva el contrato recibido y añade la importación explícita de `Buffer` para compatibilidad con Deno. Las pruebas originales, adaptadas a su ubicación, están en `checks/crm/lr-client.test.mjs`.

El paquete recibido aclara que el endpoint externo todavía debe habilitarse en LR. No contiene una clave de integración real ni el código del servidor de LR. Las notas operativas completas del archivo adjunto permanecen fuera de este repositorio público; no se publican rutas internas ni configuración de infraestructura del otro sistema.
