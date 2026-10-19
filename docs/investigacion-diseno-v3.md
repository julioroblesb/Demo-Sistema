# Nexo: claridad antes de interacción

Revisión: 19 de octubre de 2026. Público: dueño o encargado de una pyme peruana que llega desde una recomendación, prospección o anuncio. Objetivo: entender qué servicio ofrece Nexo, reconocer un problema propio y comenzar una consulta.

## Hallazgo de partida

El propietario informó que no sabía por dónde leer ni qué controles tocar. Es feedback directo sobre esta página, no una prueba cuantitativa con prospectos. La portada anterior mostraba una ficha de equipo antes de identificar suficientemente el servicio; había tres experiencias distintas (ficha, transformación, aplicación) y varias secciones explicaban relaciones con más texto.

La hipótesis de esta revisión es que una propuesta literal, una comparación simultánea y una demo opcional hacen más fácil orientarse. Las pruebas técnicas no demuestran un aumento de conversión ni sustituyen una prueba con personas.

## Fuentes leídas y aplicación

Las fuentes se consultaron en sus repositorios públicos oficiales, incluidos el contenido y los ejemplos indicados. Se distinguen guías, investigación de contexto y ejemplos de implementación. No se copiaron sus identidades gráficas ni se instalaron sus frameworks.

| Fuente y procedencia | Naturaleza y contenido consultado | Decisión aplicada a Nexo |
| --- | --- | --- |
| [Frontend Design, Anthropic](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), inglés, EE. UU. | Skill: propuesta específica, contenido real, un foco visual, lenguaje literal y revisión visual. | El foco es el paso de archivos a registros relacionados. H1 sobre la oferta; se retira la ficha de impresora que competía por atención. |
| [Impeccable: Animate](https://github.com/pbakaus/impeccable/blob/main/plugin/skills/impeccable/reference/animate.md), inglés | Skill: movimiento para mostrar relaciones, control, presupuesto, alternativa reducida. | Piezas que viajan a su registro, pausa y repetición; sin bucles ni biblioteca adicional. |
| [W3C: Making Content Usable](https://github.com/w3c/coga/blob/main/content-usable/index.html), internacional, inglés | Guía suplementaria de accesibilidad cognitiva. Lectura de resumen y patrones [propósito](https://github.com/w3c/coga/blob/main/design-guide/o1p01-clear-purpose.html), [palabras claras](https://github.com/w3c/coga/blob/main/design-guide/o3p01-clear-words.html), [controles reconocibles](https://github.com/w3c/coga/blob/main/design-guide/o1p05-clear-controls.html). No constituye por sí sola un requisito de conformidad WCAG. | «Creamos software a medida», títulos descriptivos, enlaces subrayados, botones con borde e instrucciones junto a la demo. |
| [W3C: Cognitive Accessibility User Research](https://github.com/w3c/coga/blob/main/user-research/index.html), internacional, inglés | Informe/borrador de investigación de contexto; introducción y [apartado sobre atención](https://github.com/w3c/coga/blob/main/user-research/add.html). Describe barreras de atención, memoria e instrucciones; sus poblaciones y alcance no equivalen a compradores de software en Perú. | Antes y después visibles simultáneamente; no exigir memorizar el primer estado ni completar varias interacciones para entender el beneficio. No se extrapolan cifras comerciales. |
| [GOV.UK: Button](https://github.com/alphagov/govuk-design-system/blob/main/src/components/button/index.md), Reino Unido, inglés | Guía de componente, etiquetas de acción y jerarquía entre acciones. | «Quiero ordenar mi empresa» para contacto; «Ver explicación» para reproducción; «Ver ficha» para abrir registros. |
| [GOV.UK: Details](https://github.com/alphagov/govuk-design-system/blob/main/src/components/details/index.md), Reino Unido, inglés | Guía de divulgación progresiva y limitaciones: no ocultar información necesaria para la mayoría; algunos usuarios evitan enlaces que parecen llevarlos a otra página. | Oferta y resultado visibles. Sólo la aplicación de ejemplo se despliega; el control aclara «Se despliega aquí mismo». |
| [Digital Agency: Disclosure](https://github.com/digital-go-jp/design-system-example-components-react/blob/main/src/components/Disclosure/Disclosure.tsx), Japón; README en japonés y código TypeScript | Ejemplo público de implementación, no estudio de conversión. Usa details/summary, señal de apertura y foco. | Desplegable nativo, marcador de apertura, teclado y foco visible. Se conserva la marca de Nexo y el stack actual. |
| [Open Government Products: Button stories](https://github.com/opengovsg/design-system/blob/main/packages/camp/src/Button/Button.stories.tsx), Singapur, inglés | Catálogo de estados de botón: normal, hover, activo, deshabilitado y carga. No es un estudio comparativo de culturas. | Revisar estado y etiqueta de reproducción y pausa; no dejar un botón sin explicación durante una secuencia. |

Se conservaron referencias previas de UI/UX Pro Max, Vercel y Google Stitch en `investigacion-diseno-v2.md`; no se atribuye esta revisión a herramientas de generación que no se ejecutaron. Las referencias de Japón y Singapur son prácticas de diseño de sus instituciones, no evidencia de preferencias de toda una cultura.

Las páginas públicas de Nielsen Norman Group (lectura en web), GOV.UK, IBM Carbon y W3C en sus dominios habituales rechazaron el acceso desde este entorno. Se consultaron los repositorios oficiales disponibles para las fuentes anteriores; no se presenta el artículo de NN/g ni la web de Carbon como material leído ni se atribuyen porcentajes a esas fuentes.

## Diseño resultante

1. Propuesta explícita en el inicio: de Excels y carpetas a un sistema para tu empresa. El párrafo identifica software a medida y los datos que conecta.
2. Comparación permanente con nombres grandes: «Antes / Buscar por separado» y «Después, con Nexo / Consultar en un lugar».
3. Explicación de nueve segundos, sin sonido: cliente, contrato e historial. Etiqueta viajera y énfasis muestran qué archivo corresponde a qué registro. El visitante puede pausar, continuar, repetir o seleccionar un paso. La reproducción se detiene fuera de pantalla o con pestaña oculta.
4. Movimiento reducido: explicación manual, sin temporizador ni desplazamientos. Sin JavaScript siguen visibles propuesta, comparación, contacto y FAQs; se informa que la aplicación interactiva requiere JavaScript.
5. Demo opcional con apertura explícita y tres acciones guiadas. Los registros indican «Ver ficha» o «Ver sus equipos».
6. Menos lectura repetida: desaparecen la ficha independiente de portada, el bloque oscuro de preguntas y el bloque adicional de identificación del problema. Se acortan las etapas del proceso. Las dudas siguen siendo opcionales.
7. Marca fija: mismo SVG maestro, verde, tinta, fondos y las fuentes locales Manrope y DM Sans. Se preservan dominio, material de marca y contactos autorizados.

## Por qué una explicación web en vez de GIF

La animación es texto y elementos de la página, no un GIF ni una grabación. Esto permite adaptar el texto a la pantalla, pausar la explicación, ofrecer teclado, respetar movimiento reducido y mantener un resultado legible sin descargar vídeo. Un GIF se repetiría sin esos controles; un vídeo adicional puede producirse para anuncios, pero no es necesario para esta explicación y no se ha generado en esta revisión.

## Cómo evaluar la hipótesis comercial

Prueba propuesta, todavía no realizada: mostrar la página a cinco personas que dirijan o coordinen pymes y no conozcan Nexo. Preguntar «¿Qué vende?», «¿Qué problema resuelve?» y «¿Dónde harías clic para probarlo o consultar?». Observar si identifican el antes y después sin ayuda. Registrar respuestas literales y errores; corregir lo que falle antes de atribuir mejoras de conversión. Cinco participantes es una decisión práctica para una primera ronda, no una muestra estadística representativa.

No se incorporan analítica ni píxeles de anuncios en esta revisión. No se afirman ahorros, satisfacción o porcentajes de conversión sin datos.

## Validación técnica

Se utiliza el build de producción y Playwright en Chromium. Cobertura: explicación y pausa/continuación/repetición, pasos manuales, movimiento reducido, claridad sin JavaScript, apertura y recorrido de demo, relaciones de clientes/equipos/documentos, búsqueda, foco de diálogo, teclado, menú, FAQs, contacto preparado sin envío real, dominio y recursos de marca.

Dimensiones: 320, 375, 390, 650, 768, 820, 844, 1024, 1280, 1440 y 1920 px de ancho; incluye móvil horizontal. Reflujo de 640 px equivalente a un viewport de 1280 px con zoom nativo al 200 %. Auditoría automatizada axe en escritorio y móvil con demo cerrada y abierta. Se revisan capturas de escritorio, tablet y móvil. No equivale a pruebas en dispositivos físicos ni a certificación WCAG completa.

Resultado de esta revisión: **23 pruebas superadas**. La segunda ejecución incluyó el movimiento de piezas y su alternativa reducida. Se revisaron visualmente la comparación y la demo a 320, 390, 820 y 1440 px. El HTML principal pasó de aproximadamente 27 kB a 14,9 kB sin comprimir; este tamaño no es una medición de velocidad en una red móvil real.

Revisiones consultadas para reproducibilidad:

- Frontend Design: `dbd4588f9e1033efb41dad4bef2f7947c8993d44`.
- Impeccable: `46b822f7dda9f7dba799a9c7776fdc19b3a93559`.
- W3C COGA: `f15bbd18d18f2acc32b94fe9b54f4519e2781ec5`.
- GOV.UK: `2508866aacc8ea2ae688d1ef5c6f7d169d0d0edb`.
- Japón: `68b452e16d40ffaebcb195a7289696f88890cc3e`.
- Singapur: `d9088f40d65d98c002734b82d6d84e8cd3e757ef`.
