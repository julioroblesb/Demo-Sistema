# Campañas por rubro · 21 de octubre de 2026

## Qué se investigó y qué se afirma

Se revisó el código primario de Snipe-IT, proyecto abierto de gestión de activos, commit `42381a8067729a0d5822a91639b98dd017b69941` (repositorio clonado para esta revisión). En `app/Models/Asset.php` aparecen serie, entrega, devolución prevista, devolución efectiva, comprobación de disponibilidad e historial de mantenimientos. Son operaciones reales del modelo, no estadísticas sobre empresas peruanas.

Fuentes examinadas:

- [Snipe-IT · Asset.php](https://github.com/snipe/snipe-it/blob/42381a8067729a0d5822a91639b98dd017b69941/app/Models/Asset.php): campos `serial`, `expected_checkin`, `last_checkout`, `last_checkin`; métodos de disponibilidad y relaciones de mantenimientos.
- [Snipe-IT · mantenimiento](https://github.com/snipe/snipe-it/blob/42381a8067729a0d5822a91639b98dd017b69941/app/Models/AssetMaintenance.php): equipos, fechas y registros de mantenimiento.
- [Snipe-IT · accesorios](https://github.com/snipe/snipe-it/blob/42381a8067729a0d5822a91639b98dd017b69941/app/Models/Accessory.php): los accesorios merecen un control relacionado, no asumir que el equipo devuelto está completo.
- El flujo de impresión aportado por Julio es conocimiento de operación: visita técnica, reporte, contador, repuestos y preparación de facturación. Se utilizó como base específica del contenido de impresión.

Se intentó consultar las páginas oficiales de Xerox Remote Services, Microsoft Intune, Google Email Sender Guidelines y las políticas de uso de Zoho. El acceso HTTP fue bloqueado por la red del entorno (403). Por eso no se presentan como documentos leídos ni como prueba de una cuota o recomendación exacta de esos proveedores.

## Decisiones de contenido

Para impresión, la propuesta se centra en evitar esperas para encontrar el contador y el reporte. La solución relaciona visita, equipo, contador, repuestos y PDF. Se habla de preparar la facturación con respaldo, sin prometer emitir comprobantes, homologación SUNAT o captura automática de contadores sin una integración acordada.

Para computadoras, el problema es confirmar disponibilidad y retorno. La propuesta relaciona número de serie, cliente, contrato, reserva, entrega, devolución, accesorios y revisión. Se distingue una laptop devuelta de una laptop lista para volver a alquilar. No se promete borrado remoto, control de licencias ni cumplimiento automático de seguridad.

Se prepararon asunto, saludo, cuerpo, PDF y imagen por cada rubro. La demostración ofrecida sigue siendo un proyecto real existente; se propone evaluar su adaptación, sin inventar casos implementados específicamente para cada prospecto ni porcentajes de ahorro.

WhatsApp puede enviarse solo. Solo menciona un correo previo cuando ese correo existe; en una campaña mixta, no se despacha el mensaje que menciona el correo hasta confirmar el envío de este.

## Cola y límites prácticos

- Cola persistente en `crm_records`, con registros de configuración escritos exclusivamente por las funciones privadas usando el propietario de la sesión verificada. Se reutiliza el esquema instalado, sin SQL adicional.
- Identificador de campaña estable, un registro por entrega, estado y versión. Una exclusión temporal con comparación de versión coordina varios navegadores y dispositivos.
- Valores predeterminados: 60 segundos entre correos y 30 segundos entre WhatsApp. Son decisiones operativas conservadoras de Nexo, no cuotas publicadas de Zoho o LR.
- El reloj y la exclusión viven en servidor; abrir dos campañas o pestañas no elimina la espera global por canal.
- El CRM solicita un paso de la cola cada cinco segundos. Debe haber una sesión abierta; no se ha instalado cron ni un servicio externo. Cerrar conserva la cola. Volver a abrir permite continuar. Un resultado incierto no se reenvía automáticamente.
- `sent` confirma aceptación o envío comunicado por el proveedor. No confirma lectura, recepción o bandeja principal. Ningún intervalo garantiza evitar spam o bloqueos.
- `RATE_LIMITED` pausa la campaña y respeta el plazo conocido. No se cambian identidades, cuentas ni se intenta eludir límites.

## Activación

La interfaz y los documentos se publican en GitHub Pages. Los cambios de servidor requieren reemplazar las funciones `crm-email` y `crm-whatsapp` con los archivos autónomos publicados en `/SKYROTE13/campanas/`. No se dispone de una sesión administrativa ni de un token de gestión de Supabase en el entorno; no se puede afirmar un despliegue remoto de esas funciones. Los secretos existentes se conservan.

## Validación

Se probaron intervalos compartidos entre campañas, exclusión de solicitudes simultáneas, prioridad del correo en campañas mixtas, WhatsApp independiente, pausa por límites, incertidumbre sin reenvío, cambio de destinatario, cancelación y filtros por ubicación/canal. Las pruebas de interfaz cubren vista previa de las piezas a 320, 390 y 1440 px y selección de opciones/fecha/hora con el diseño propio. Los PDF se exportaron y verificaron como A4 de una página. Las pruebas usan proveedores simulados; no se enviaron campañas a prospectos durante el desarrollo.
