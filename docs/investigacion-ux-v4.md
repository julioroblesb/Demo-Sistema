# Nexo: comprensión, evidencia y fluidez

Revisión del 20 de octubre de 2026. Objetivo: que un responsable de una pyme entienda qué se vende, vea una aplicación concreta y pueda iniciar una consulta pertinente.

## Qué evidencia tenemos y qué falta

Hay tres clases distintas de evidencia: (1) problemas de comprensión comunicados por el propietario; (2) inspección del código y pruebas reproducibles de la interfaz; (3) fuentes técnicas originales y guías de diseño. **No hay todavía observación de visitantes reales de Nexo, mapas de calor, experimentos de conversión ni pruebas moderadas con prospectos.** No se presentan simulaciones visuales como eye tracking ni se promete un incremento de ventas.

Los sitios editoriales de NN/g, Baymard, web.dev, W3C y Microsoft Learn no se pudieron abrir directamente desde este entorno (HTTP 403); tampoco se pudo consultar el artículo académico de Tversky sobre animación. Por eso no se citan como lecturas realizadas. Se consultaron los repositorios originales accesibles de W3C, Google, Microsoft y sistemas de diseño públicos. Los vínculos siguientes permiten revisar el texto realmente utilizado.

Las skills de Impeccable y CRO sirven para organizar el trabajo; no sustituyen evidencia. Se descartaron como fundamento cuantitativo los porcentajes de pérdida por campo adicional que la skill CRO ofrece sin un estudio verificable. Tampoco se trasladaron porcentajes de casos de comercio electrónico a este servicio B2B peruano.

## Fuentes y límites

| Fuente consultada | Qué aporta a esta decisión | Qué no demuestra |
| --- | --- | --- |
| [W3C COGA — propósito claro](https://github.com/w3c/coga/blob/main/design-guide/o1p01-clear-purpose.html), [palabras claras](https://github.com/w3c/coga/blob/main/design-guide/o3p01-clear-words.html) y [controles claros](https://github.com/w3c/coga/blob/main/design-guide/o1p05-clear-controls.html) | Hacer reconocible el propósito, usar palabras familiares y explicar la acción. Material de accesibilidad cognitiva, con razones y patrones concretos. | Una tasa de conversión o una distribución de atención de nuestros visitantes. No generalizar sin validación una población específica a todas las pymes. |
| [W3C WCAG — Animation from Interactions](https://github.com/w3c/wcag/blob/457cece22d8219be32d29c5c1313e71aa6b61eae/understanding/21/animation-from-interactions.html) | Movimiento no esencial puede causar distracción o malestar; respetar reducción de movimiento. | Que eliminar toda animación maximice ventas. El criterio 2.3.3 es AAA, no una obligación AA universal. |
| [W3C WCAG — Pause, Stop, Hide](https://github.com/w3c/wcag/blob/457cece22d8219be32d29c5c1313e71aa6b61eae/understanding/20/pause-stop-hide.html) | Distingue movimiento automático del iniciado por la persona; la pausa debe permitir seguir usando la página. | Que cinco segundos sea la duración óptima para una explicación comercial: es un umbral del criterio, no una recomendación de marketing. |
| [W3C WCAG — Target Size (Minimum)](https://github.com/w3c/wcag/blob/457cece22d8219be32d29c5c1313e71aa6b61eae/understanding/22/target-size-minimum.html) | Objetivos de al menos 24 × 24 CSS px, con excepciones y espaciado definido. Usamos controles principales de 44 px o más como decisión práctica. | Que 44 px sea el mínimo normativo de este criterio; no confundirlo con el criterio mejorado. |
| [Google — High-performance CSS animations](https://github.com/GoogleChrome/web.dev/blob/a64d870f59c25431bbedf0ef06aa635072c43a2e/src/site/content/en/animations/animations-guide/index.md) | Transform y opacity evitan trabajo repetido de layout; comprobar pintura y cuadros perdidos; no aplicar will-change masivamente. | Fluidez garantizada en cualquier teléfono. Es una guía técnica; hace falta medir el resultado. |
| [Google — Interaction to Next Paint](https://github.com/GoogleChrome/web.dev/blob/a64d870f59c25431bbedf0ef06aa635072c43a2e/src/site/content/en/metrics/inp/index.md) | La respuesta al gesto importa durante toda la visita. Diferencia campo de laboratorio y respuesta inicial de operación terminada. | Que una prueba local sea el INP del sitio público. El snapshot es de 2023 y todavía describe INP como pendiente: no se adopta ese estado histórico para 2026. |
| [Google — Lazy loading video](https://github.com/GoogleChrome/web.dev/blob/a64d870f59c25431bbedf0ef06aa635072c43a2e/src/site/content/en/fast/lazy-loading-video/index.md) | Video bajo demanda, poster, preload=none; GIF no es una elección eficiente para grandes animaciones. | Que poner un video, por sí solo, aumente comprensión o ventas. |
| [Google — Why does speed matter?](https://github.com/GoogleChrome/web.dev/blob/a64d870f59c25431bbedf0ef06aa635072c43a2e/src/site/content/en/fast/why-speed-matters/index.md) | Recopila casos reportados de desempeño y negocio, útil para priorizar presupuesto de carga. | Es una recopilación, no un experimento propio ni una estimación causal para Nexo. No se usan sus porcentajes como promesas. |
| [Microsoft Clarity — heatmap.ts](https://github.com/microsoft/clarity/blob/4e78cb7be1f7e5598d90c497a7c86ad9b549d1cc/packages/clarity-visualize/src/heatmap.ts), [click.ts](https://github.com/microsoft/clarity/blob/4e78cb7be1f7e5598d90c497a7c86ad9b549d1cc/packages/clarity-js/src/interaction/click.ts), [scroll.ts](https://github.com/microsoft/clarity/blob/4e78cb7be1f7e5598d90c497a7c86ad9b549d1cc/packages/clarity-js/src/interaction/scroll.ts) | Evidencia de implementación: recoge interacción y posición; genera agregaciones de clic y alcance vertical. Ayuda a interpretar qué mide realmente una visualización. | No mide fijaciones oculares, comprensión, intención ni causalidad comercial. |
| [GOV.UK — Button](https://github.com/alphagov/govuk-design-system/blob/main/src/components/button/index.md), [Details](https://github.com/alphagov/govuk-design-system/blob/main/src/components/details/index.md) | Nombres de acciones concretos y contenido secundario desplegable. Un desplegable no debe esconder información necesaria para entender el servicio. | El comportamiento de trámites públicos británicos no equivale al de compradores de software peruanos. Se adopta el mecanismo, no una supuesta tasa de éxito. |
| [Digital Agency, Japón — componentes](https://github.com/digital-go-jp/design-system-example-components-react) | Disclosure nativo, estructura y foco: contraste útil frente a patrones del Reino Unido. | Procedencia cultural no prueba superioridad comercial. No se copia su identidad visual. |

## Análisis de problemas y decisiones aplicadas

### 1. La portada exigía interpretar demasiadas piezas

El título, la descripción, el antes/después y la demo repetían ideas, pero no respondían a una consulta cotidiana. Se cambia el título a «Tu empresa en un solo sistema» y se explica inmediatamente que se ofrece software a medida. La comparación parte de «¿Cuándo se revisó esta impresora?». Las dos respuestas permanecen visibles: buscar en archivos separados frente a consultar el equipo y su último mantenimiento.

**Mecanismo esperado:** menos traducción entre vocabulario comercial y trabajo diario. El usuario no necesita reproducir una animación ni memorizar una pantalla que desaparece. **Hipótesis, no hecho medido:** más visitantes podrán explicar qué hace Nexo y mencionar un uso propio.

### 2. Códigos y modelos obligaban a reconocer productos especializados

Un modelo como «IM C3000» no comunica a una persona ajena al sector qué objeto representa. Ahora aparecen «Impresora», «Monitor» y «Tablet» como títulos; marca/modelo ocupan el segundo nivel, código/serie el detalle. Diagramas originales del tipo de equipo acompañan el nombre. No son fotografías oficiales ni pretenden reproducir exactamente cada modelo.

**Mecanismo:** reconocimiento antes que interpretación; información especializada sigue disponible cuando se necesita. **Comprobación:** una búsqueda por tipo, marca, modelo, código o cliente conserva relaciones consistentes.

### 3. La demo terminaba antes de demostrar el valor

Antes, «ver contrato» abría texto explicativo; todos los equipos compartían prácticamente el mismo historial. Ahora existe un recorrido completo cliente → equipo → servicio → trabajo realizado → PDF. Hay 4 equipos, 8 eventos de historial y 12 documentos. Un solo JSON genera la interfaz y los archivos, evitando que la vista previa diga una cosa y el PDF otra.

Cada reporte tiene contexto, fecha, motivo, trabajo y resultado; puede leerse sin visor PDF y descargarse. Los resúmenes de contrato están identificados como documentos de demo sin validez contractual. «Demo» identifica la naturaleza del recorrido sin repetir «ficticio» junto a cada elemento.

**Mecanismo:** una prueba concreta del comportamiento antes de solicitar contacto. No se convierten esos datos en testimonios ni casos de clientes reales.

### 4. Fluidez también significa continuidad y control

La animación explica tres relaciones y se puede pausar, continuar, repetir o recorrer manualmente. Se detiene al salir de pantalla o cambiar de pestaña. Los desplazamientos usan transform/opacity. Cambiar de documento conserva el contexto del equipo; cerrar devuelve el foco al control original. El diálogo permite desplazamiento interno en pantallas bajas y orientación horizontal.

Un video del recorrido real de la demo tiene versiones vertical y escritorio. Solo se carga al abrirlo/reproducirlo; hay controles nativos y pasos en texto. No lleva sonido ni requiere entender una locución. La comparación estática sigue siendo suficiente para entender el servicio. No hay scroll secuestrado, movimiento de fondo continuo ni autoplay compitiendo con la lectura.

### 5. Persuasión: continuidad entre dolor, prueba y siguiente paso

La conversión es una consulta sobre un proceso, no una compra inmediata ni descargar un PDF. La portada identifica el servicio; la demo prueba su lógica; el proceso explica cómo comenzar por una etapa; el contacto prepara un mensaje de WhatsApp. Se conservan el correo y la dirección autorizados. No se agregan cifras de clientes, resultados, logos de terceros como avales, urgencia ni promesas de plazo sin respaldo.

La etiqueta «Continuar en WhatsApp» describe lo que ocurre: abrir un mensaje preparado. Eso no demuestra envío, recepción ni lead calificado. Esa diferencia es esencial al evaluar futuras campañas.

### 6. Identidad y detalles de confianza

Se conserva la paleta, tipografías y símbolo. Única modificación de marca solicitada: punto circular con el mismo color, centro y límites exteriores. Se propaga al maestro, descargas y contenidos regenerados. Favicons absolutos SVG/ICO/PNG y apple-touch-icon en todas las páginas; títulos cortos que empiezan por Nexo. No puede garantizarse que un navegador no recorte títulos o conserve un icono antiguo en caché.

## Cómo leer mapas de calor de Nexo cuando existan

1. **Separar dispositivo y fuente:** no mezclar escritorio, móvil, prospección y anuncios en una sola imagen. Tampoco mezclar distintas versiones de la página.
2. **Clics:** calor en «Descargar PDF» puede significar exploración, no intención de compra. Muchos clics en una tarjeta estática pueden revelar un control esperado; revisar la secuencia de la sesión antes de decidir.
3. **Alcance vertical:** llegar al 80 % de la página no prueba haber leído ese 80 %. Puede ser desplazamiento rápido buscando contacto. Comparar con tiempo visible y conducta posterior, sin confundirlo con atención ocular.
4. **No clics:** una sección sin clics puede haber resuelto la duda. En el antes/después el éxito puede ser comprender sin interactuar.
5. **Normalizar:** un elemento alto recibe más exposición. Mirar clics entre personas que realmente lo vieron, no solo el total bruto; indicar tamaño de muestra y periodo.
6. **Privacidad:** excluir el estudio de contenido y cualquier información de consultas; enmascarar campos y no registrar nombres, correo, mensajes ni URL con texto de WhatsApp. No hay un tracker instalado ni una cuenta inventada en esta entrega.
7. **Validación cruzada:** usar reproducción de sesiones para ubicar una fricción y una entrevista/tarea para entender el motivo. El color rojo no explica el porqué.

## Plan de validación con clientes potenciales

Primera ronda sugerida: 5–8 dueños o encargados de operaciones, de empresas objetivo, con mezcla de teléfonos y ordenadores propios. Es investigación cualitativa para encontrar fricciones; no representa estadísticamente al mercado peruano. No usar al equipo constructor como sustituto.

Sin explicar la interfaz antes:

- Mostrar la portada brevemente y preguntar «¿Qué ofrece esta empresa? ¿Para qué te serviría?». Registrar las palabras del participante, no solo sí/no.
- «Horizonte tiene una impresora. Encuentra qué se le hizo en su último mantenimiento y guarda el reporte». Observar primer clic, errores, retrocesos, ayuda necesaria y finalización.
- «Ahora consulta la tablet de Grupo del Pacífico». Ver si transfiere lo aprendido a otro equipo sin perder contexto.
- «Quieres conversar sobre un problema de tu empresa. ¿Qué harías?». Detener antes de enviar un mensaje.
- Preguntar qué información falta para contactar: alcance, precio, experiencia, confidencialidad, tiempos. No sugerir respuestas.

**Criterio de iteración:** corregir obstáculos que impiden la tarea; repetir con nuevas personas. Comparar tareas equivalentes, no pedir «¿te gusta más?» como prueba de comprensión.

## Medición comercial propuesta, aún no instalada

| Paso | Señal | Interpretación correcta |
| --- | --- | --- |
| Llegada | Visita por fuente/campaña y dispositivo | Base de exposición, no comprador |
| Comprensión exploratoria | Abrir demo / equipo / reporte | Interés en la explicación; no conversión final |
| Intención de contacto | Abrir WhatsApp desde portada o formulario | Intento de salir al canal; no mensaje enviado |
| Conversación recibida | Registro manual de conversación real | Lead recibido; relacionar con campaña solo cuando haya evidencia |
| Oportunidad | Problema, decisor y alcance pertinentes | Calidad comercial |
| Venta | Propuesta aceptada/pagada según proceso comercial | Resultado de negocio |

Al inicio conviene una sola versión estable y análisis cualitativo. Un A/B requiere definir diferencia mínima relevante, base de conversión, tamaño de muestra y periodo antes de arrancar. No se elige un ganador por unas pocas visitas o por un mapa más rojo.

## Validación técnica

Se documenta por separado en `validacion-ux-v4.md`: pruebas de relaciones y PDF, navegación/teclado, estados de movimiento, formatos responsivos, accesibilidad automatizada, lectura visual y perfil de rendimiento local. Un resultado de laboratorio no se presenta como Core Web Vitals de visitantes reales ni como prueba de conversión.
