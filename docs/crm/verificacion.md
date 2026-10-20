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

Las pruebas utilizan registros de prueba locales y respuestas HTTP simuladas; no modifican los registros reales del propietario. La compatibilidad SQL se verifica ejecutando el esquema existente en PostgreSQL local. No equivale a una comprobación del proyecto remoto ni de Realtime en producción. El entorno bloquea HTTP directo al proveedor; no se usaron ni publicaron contraseñas ni credenciales administrativas. Esta actualización no requiere reinstalar tablas ni cambiar permisos en Supabase.

Los campos opcionales nuevos y la interpretación de registros anteriores se documentan en `pipeline-simple.md`. No se realizan escrituras masivas al cargar las empresas existentes.
