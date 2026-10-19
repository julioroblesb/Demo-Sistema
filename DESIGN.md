# Nexo: identidad fija, presentación adaptable

Este documento fija las decisiones para futuras iteraciones. La petición del usuario exige conservar la identidad y mejorar la capacidad de la landing para explicar el servicio y generar consultas.

## Elementos de marca que se conservan

- Nombre: Nexo. Dominio: `https://nexoamedida.com/`.
- Logo maestro: `public/brand/nexo-logo.svg`. Las formas, el punto y el isotipo de ocho direcciones no se redibujan. Se usa el mismo archivo entregado en el kit de identidad, también en cabecera y pie.
- Verde Nexo `#247459`; tinta `#202730`; blanco niebla `#FAFBFC`; blanco `#FFFFFF`.
- Apoyos existentes: tinta bosque `#20352B`, salvia `#EEF2EE`, texto secundario `#607168`, borde `#E4E8E8`, hover `#195940`, foco `#66B493`.
- Manrope para marca y títulos; DM Sans para texto e interfaz. Archivos locales, sin llamadas a Google Fonts.
- Tono: claro, cercano y concreto. Relaciones e historial antes que términos tecnológicos.
- Los archivos descargables de marca ya entregados se conservan.

## Objetivo y hechos del producto

La página es comercial: que un dueño o encargado comprenda cómo conectar información operativa y pueda iniciar una consulta. La conversión principal es una conversación, no un pago ni un alta de software.

La oferta sigue siendo un sistema a medida que relaciona clientes, equipos, documentos, operaciones e historial. WhatsApp, reportes y automatizaciones son ampliaciones. La demo usa datos ficticios, sin conexión con sistemas de clientes.

Contacto autorizado: WhatsApp +51 936 755 465 y `asesoria@nexoamedida.com`. El formulario prepara el mensaje y abre WhatsApp; el visitante realiza el envío. El correo alternativo usa mailto. No afirmar entrega de mensajes ni existencia de un backend de recepción.

## Composición

La portada se construye alrededor de una ficha concreta de equipo. A la izquierda, una propuesta breve alineada al margen; a la derecha, la ficha EQ-024 permite recorrer devolución, mantenimiento y nuevo alquiler. No usar una etiqueta corporativa sobre el H1 ni colorear una frase del título para simular jerarquía.

La transformación de escritorios a sistema continúa como demostración central. Después, una sección de preguntas muestra el valor de las relaciones. La demo completa permite comprobarlo; el proceso por etapas, las dudas y el contacto completan el argumento comercial.

Las tres tarjetas genéricas de beneficios y las etiquetas numeradas de secciones desaparecen. La numeración se reserva al recorrido de la demo y a las etapas del proceso, donde sí significa una secuencia. No añadir testimonios, logotipos de supuestos clientes, cifras de ahorro ni garantías sin evidencia.

El fondo oscuro es la tinta bosque ya presente en el manual; organiza un cambio de capítulo, no una nueva identidad. Evitar fondos con halos, gradientes decorativos, iconos sueltos y tarjetas repetidas como estructura de toda la página.

## Recursos visuales y movimiento

- `src/assets/equipo.svg`: ilustración vectorial propia de un equipo, con anotaciones y geometría que responden a la historia de la demo; no es fotografía ni imagen de un cliente.
- La ficha de portada cambia por acción del visitante. Una llegada breve del documento, seguida de estados legibles y estables.
- La transformación mantiene continuidad espacial: archivos que viajan a sus registros. Se miden las posiciones en un lote antes de escribir en el DOM.
- Sin secuestro de scroll, cursores personalizados, precargas, marquesinas ni bucles decorativos.
- Animaciones interrumpibles. Con `prefers-reduced-motion`, resultado directo y sin viaje de archivos.
- Iconos SVG de trazo coherente. Los menús, FAQs y diálogos usan controles nativos.

## Lectura y adaptación

- Contenedor de hasta 1296 px; composición de dos columnas en escritorio y una columna en móvil.
- Escala de portada 38–74 px dentro de Manrope; cuerpos comerciales 14–17 px según contexto. Los tamaños de una ilustración no definen el tamaño del texto comercial.
- Menú compacto hasta 860 px; las tarjetas de clientes se convierten en filas verticales hasta 650 px. Los campos del formulario usan al menos 16 px en móvil.
- Las superficies de navegación y acción se diseñan con blancos táctiles amplios, foco visible y nombres accesibles. Los diálogos no exceden la altura dinámica disponible.
- Comprobar paisaje móvil, tablet, escritorio y reflujo equivalente a zoom del navegador. No basta con comprobar que el ancho total no desborda.

## Validación mantenida

`npm test` compila producción y ejecuta las pruebas en `tests/landing.spec.js`. Incluye estados, interrupción, búsqueda, relaciones, teclado, contacto sin envío real, recursos del dominio, varias dimensiones y auditoría automática con axe.

Las pruebas automáticas no equivalen a una certificación WCAG ni a ensayos en teléfonos físicos. Se complementan con capturas y revisión visual en Chromium.
