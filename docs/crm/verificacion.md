# Verificación del CRM · 20 de octubre de 2026

- Compilación Vite de dos entradas: landing y CRM, correcta.
- Dominio: 18 pruebas aprobadas (fechas de Lima, céntimos, enlaces, importación de 300 empresas, duplicados, CSV seguro, respaldo, calendario ICS, métricas, relaciones y conflictos).
- PostgreSQL local PGlite: 2 pruebas de integración aprobadas con instalación repetida, roles anónimo y autenticado, cuenta no autorizada, dos propietarios, RLS, denegación de escritura directa, transacciones atómicas, control de versiones, cobros, saldo y anulación. El SQL descargable se compara con la migración ejecutada.
- CRM en Chromium: 15 recorridos aprobados en la ejecución final. Empresa → oportunidad → cierre → cobro parcial → hitos; calendario; comentarios seguros; importación de 300 empresas; persistencia; conflicto entre pestañas; configuración; metas y restauración de ventas con cobros.
- Adaptador Supabase: se prueba con el SDK real y respuestas HTTP simuladas para login, guardado RPC y recuperación de datos al abrir otra página con sesión recordada. No equivale a una conexión con el proyecto remoto.
- CRM adaptable: 320, 390, 768, 1280 y 1920 px sin desbordamiento global. Se permite desplazamiento dentro de tablas y tablero. Auditoría Axe en los ocho módulos a 1440 y 390 px y una ficha, sin infracciones detectadas en las etiquetas WCAG A/AA utilizadas. No constituye una certificación completa de accesibilidad.
- Regresión de landing y estudio: 34 pruebas existentes aprobadas, incluyendo medios, descargas, dominio, favicon, contactos y tamaños de pantalla. No se modificó su diseño.

## Pendiente fuera del entorno

El acceso HTTP al proyecto Supabase fue rechazado por el proxy de red del entorno (CONNECT 403). No se creó una cuenta personal ni se instaló SQL remotamente. La URL y clave pública proporcionadas quedaron preparadas en la aplicación. La contraseña de PostgreSQL no se guardó en el repositorio ni se distribuye al navegador.

Para activar y verificar la sincronización real, el propietario debe ejecutar el esquema y la autorización de su usuario, según `activacion.md`, iniciar sesión y comprobar un registro entre computadora y celular. Realtime, sus permisos efectivos en producción y la continuidad del servicio gratuito no se pueden dar por verificados mediante pruebas locales.

## Actualización: simplificación del seguimiento

Se añadieron pruebas para el registro visible inmediatamente en el pipeline, continuidad sin duplicar empresa u oportunidad, agrupación de estados antiguos, filtros, búsquedas por datos de empresa/contacto, teléfonos con formatos distintos, coincidencias de varios campos, RUC repetido, cancelación y confirmación de datos compartidos, además de avisos en CSV. La actualización conserva el esquema Supabase y representa las empresas sin oportunidad como tarjetas de lectura, sin escrituras automáticas ni alteración de métricas financieras.

Resultado final de esta actualización: `npm test` aprobado, con 24 pruebas de dominio, 2 de PostgreSQL local y 53 recorridos de navegador (19 del CRM y 34 de regresión). La auditoría automática del CRM pasa en los ocho módulos a 1440 y 390 px y en una ficha; se mantiene la prueba de adaptación de 320 a 1920 px.
