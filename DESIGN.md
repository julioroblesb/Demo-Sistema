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

## Composición y comprensión (revisión de octubre de 2026)

La primera visita debe responder qué vendemos antes de pedir explorar. El título nombra el cambio de Excels y carpetas a un sistema para la empresa, y el párrafo identifica el servicio como software a medida.

Una única comparación de portada muestra **Antes** y **Después, con Nexo** simultáneamente. La lectura del resultado no depende de reproducir animación ni de recordar un estado anterior. Cliente, contrato e historial son los tres puntos del relato. Las fichas ilustradas son estáticas y no se presentan como botones.

El botón comercial inicia la consulta; el enlace secundario conduce a la comparación. La demo completa es opcional y se despliega en la misma página con un control nativo, texto que explica dónde se abrirá y acciones guiadas. La información esencial del servicio permanece fuera del desplegable. Se retiran la ficha independiente de portada y las secciones que repetían preguntas y el problema de la dispersión.

No añadir testimonios, logotipos de supuestos clientes, cifras de ahorro ni garantías sin evidencia. El ejemplo de alquiler es una demostración, no una limitación del servicio a impresoras o alquileres.

## Recursos visuales y movimiento

- La comparación funciona como una explicación animada de nueve segundos, iniciada por el visitante, con pausa, continuación, repetición y selección manual de pasos.
- Cada pieza viaja desde su archivo de origen al registro relacionado. Se leen las posiciones antes de escribir en el DOM; el movimiento usa transform y opacity mediante Web Animations API.
- Ambos resultados siguen visibles durante todo el relato; un texto breve explica el paso en curso. Sin audio ni descarga de vídeo para entender la oferta.
- Fuera de pantalla o al ocultar la pestaña, la reproducción se pausa. No se reanuda automáticamente.
- Con `prefers-reduced-motion`, pasos manuales sin reproducción temporizada ni desplazamiento de piezas.
- Sin secuestro de scroll, cursores personalizados, precargas, marquesinas ni bucles decorativos.
- Las listas de equipos indican «Ver ficha» y los clientes «Ver sus equipos». Los menús, desplegables, FAQs y diálogos usan controles nativos.

## Lectura y adaptación

- Contenedor de hasta 1296 px; composición de dos columnas en escritorio y una columna en móvil.
- Escala de portada 35–61 px dentro de Manrope; cuerpos comerciales 14–17 px según contexto. Los tamaños de una ilustración no definen el tamaño del texto comercial.
- Menú compacto hasta 860 px; las tarjetas de clientes se convierten en filas verticales hasta 650 px. Los campos del formulario usan al menos 16 px en móvil.
- Las superficies de navegación y acción se diseñan con blancos táctiles amplios, foco visible y nombres accesibles. Los diálogos no exceden la altura dinámica disponible.
- Comprobar paisaje móvil, tablet, escritorio y reflujo equivalente a zoom del navegador. No basta con comprobar que el ancho total no desborda.

## Validación mantenida

`npm test` compila producción y ejecuta las pruebas en `tests/landing.spec.js`. Incluye estados, interrupción, búsqueda, relaciones, teclado, contacto sin envío real, recursos del dominio, varias dimensiones y auditoría automática con axe.

Las pruebas automáticas no equivalen a una certificación WCAG ni a ensayos en teléfonos físicos. Se complementan con capturas y revisión visual en Chromium.
