# Verificación del CRM · 20 de octubre de 2026

## Actualización del pipeline

La compilación Vite de landing y CRM pasa. El pipeline y ambas tablas usan cinco etapas: Filtrado, Contactado, Seguimiento, Ganado y Perdido. Se conserva el esquema Supabase existente.

- **34 pruebas de dominio y operaciones**: fechas de Lima, céntimos, enlaces, importación de 300 empresas, duplicados, búsqueda en datos relacionados, CSV seguro, respaldo, calendario ICS, métricas, relaciones y conflictos; cinco etapas y compatibilidad con datos anteriores; multiselección obligatoria, instante del contacto, respuesta vinculada, contactos adicionales, cierre negativo y conservación de ventas, cobros, hitos y entregas.
- **3 pruebas de PostgreSQL local PGlite**: instalación repetida, roles, cuenta autorizada, RLS, escritura directa denegada, transacciones, versiones, saldos, anulación y aislamiento entre propietarios. La nueva prueba ejecuta contactos, respuestas y tareas con el SQL instalado sin modificarlo y comprueba que un cierre negativo conserva una venta con cobros y su entrega. El SQL descargable coincide byte a byte con la migración probada.
- **27 recorridos del CRM en Chromium**: alta visible en Filtrado; canales obligatorios y automarcado de fecha/hora; contacto conservado al recargar y visible en las dos tablas; respuesta positiva, proforma y cierre negativo; arrastre y cancelación; una tarjeta con varias oportunidades; edición de etapas sin saltarse canales; cierre ganado con importe e hitos; edición de la entrega de una venta anterior sin alterar un ciclo reabierto. Se mantienen importación de 300 empresas, comentarios seguros, tareas, ventas, cobros, restauración, metas, búsquedas, duplicados y navegación con teclado.
- **Adaptación y accesibilidad**: se prueban los ocho módulos a 320, 390, 768, 1280 y 1920 px sin desbordamiento global. Las tablas y el tablero pueden desplazarse internamente. Axe pasa en los ocho módulos a 1440 y 390 px, en una ficha y en el formulario de respuesta a 320 px, con las etiquetas WCAG A/AA utilizadas. Se revisaron visualmente el formulario multicanal, el tablero y la tabla móvil. Esto no constituye una certificación completa de accesibilidad.
- **Adaptador Supabase**: SDK real con HTTP simulado para inicio de sesión, guardado mediante `crm_commit`, contacto multicanal, respuesta positiva y recuperación de estos datos en otra página con viewport de celular y sesión recordada.
- **34 pruebas de regresión de landing y estudio** aprobadas: navegación, animación, medios, descargas, contactos, dominio, favicon y formatos de pantalla. Los 244 archivos de `public` coinciden con la compilación; se conservan los kits, carruseles, archivos de marca y `CNAME`.

Comandos ejecutados: `npm run build`, `npm run test:crm:unit`, `npm run test:crm:rules`, `npx playwright test tests/crm.spec.js tests/crm-pipeline.spec.js` y `npx playwright test tests/landing.spec.js tests/content-studio.spec.js`.

## Alcance de las comprobaciones

Las pruebas utilizan registros de prueba locales y respuestas HTTP simuladas; no modifican los registros reales del propietario. La compatibilidad SQL se verifica ejecutando el esquema existente en PostgreSQL local. No equivale a una comprobación del proyecto remoto ni de Realtime en producción. El entorno bloquea HTTP directo al proveedor; no se usaron ni publicaron contraseñas ni credenciales administrativas. La actualización del pipeline no requiere reinstalar tablas ni cambiar permisos en Supabase; la integración de WhatsApp descrita abajo sí añade su propia tabla y función.

Los campos opcionales nuevos y la interpretación de registros anteriores se documentan en `pipeline-simple.md`. No se realizan escrituras masivas al cargar las empresas existentes.

## Integración de WhatsApp y plantillas

La actualización añade una vista de envío con la imagen y texto proporcionados, historial persistente de intentos, comprobación del destinatario, confirmación del correo previo y autorización exigida por el contrato LR. Se conserva el pipeline existente.

- 83 pruebas unitarias aprobadas: dominio anterior, plantillas, cliente LR, autenticación, aislamiento, idempotencia, concurrencia, recuperación, límites de cuota y registro del contacto únicamente tras envío confirmado.
- 6 pruebas PostgreSQL local aprobadas: 3 del esquema CRM y 3 adicionales para permisos de la cola, consentimiento obligatorio, idempotencia, reclamos exclusivos, plazo de reintento, cambios de teléfono y empresas cerradas.
- 69 recorridos de navegador aprobados: 61 anteriores y 8 para WhatsApp, doble clic, validación sin envío, incertidumbre, conexión pendiente, accesibilidad y formatos móviles, además de plantilla y descargas.
- La entrada TypeScript de la función se compiló con esbuild. Esto no equivale a ejecutar el entorno Deno remoto. La revisión visual incluye la vista WhatsApp a 1440 y 390 px y el correo a 390 px.

El ZIP recibido contiene el contrato y cliente del puente LR, pero no el servidor habilitado ni credenciales. No se instalaron migraciones ni funciones en Supabase remoto, no se confirmó acceso API/SMTP de la cuenta gratuita Zoho y no se enviaron mensajes reales. Las pruebas de proveedor son simulaciones. La activación requiere habilitar LR e instalar la migración adicional y función con sus secretos, incluida la vinculación al UUID de la cuenta personal.

## Paquete LR publicado recibido después

Se contrastó el nuevo cliente con el anterior: conserva el comportamiento y solo actualiza su encabezado de estado. Según la entrega, LR ya publicó su API; no se necesita acceso a su repositorio. Se actualizan la guía y el paquete de instalación de Nexo sin incluir la credencial privada ni los informes internos.

Se corrigió la validación seca para permitirla con WhatsApp desconectado, tal como admite la API publicada. El envío real sigue bloqueado en la interfaz y vuelve a comprobar la sesión en el servidor. Pasa la compilación, las 84 pruebas unitarias y los 9 recorridos de navegador de WhatsApp, incluida esta separación. Las seis pruebas SQL y los restantes recorridos no se repitieron porque no cambian sus esquemas ni funciones. El entorno no tiene sesión de despliegue Supabase y su proxy rechaza HTTP hacia LR y Supabase con CONNECT 403: no se comprobó la credencial ni se activó producción.
