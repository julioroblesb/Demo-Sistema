# Investigación aplicada a la segunda revisión visual de Nexo

## Encargo y diagnóstico

El usuario pide evitar el aspecto repetitivo de páginas generadas, aprender de nuevas habilidades públicas y mejorar la presentación comercial y responsive sin cambiar la identidad.

La versión anterior tenía un H1 centrado con una frase verde, una etiqueta superior en mayúsculas, tres tarjetas equivalentes de beneficios y títulos precedidos por rótulos pequeños. Estos elementos repetían una composición común en lugar de mostrar el proceso del cliente. La transformación interactiva era más específica, pero el resto del argumento comercial seguía siendo genérico. Además, el contacto solo preparaba texto para copiar.

La nueva dirección pone una historia realista y ficticia en el primer plano: el mismo equipo cambia de cliente, pasa por mantenimiento y conserva su historial. Las preguntas operativas organizan el resto de la explicación. Se conservan nombre, logo maestro, colores y fuentes; se documentan en `DESIGN.md`.

## Nuevas fuentes revisadas

| Fuente | Idioma y alcance revisado | Aplicación concreta |
| --- | --- | --- |
| [Marketing Skills: CRO](https://github.com/coreyhaines31/marketingskills/tree/main/skills/cro) y su referencia de formularios | Inglés. Propuesta, jerarquía de CTA, objeciones, fricción de contacto. | Portada comprensible, contexto antes de pedir contacto, preguntas frecuentes, correo opcional y envío iniciado por el visitante en WhatsApp. No se trasladan cifras genéricas de conversión a promesas de Nexo. |
| [Marketing Skills: Copywriting](https://github.com/coreyhaines31/marketingskills/tree/main/skills/copywriting) | Inglés. Restaurar una voz existente y sustentar afirmaciones. | Se conserva el vocabulario de clientes, equipos, carpetas e historial. No se inventan casos, métricas ni testimonios. |
| [UI Skills: Fixing Motion Performance](https://github.com/ibelick/ui-skills/tree/main/skills/fixing-motion-performance) | Inglés. Medición, composición e interrupción. | Lecturas de posiciones agrupadas antes de crear los elementos que vuelan. WAAPI y CSS en el stack existente, con duración acotada y movimiento reducido. |
| [UI Skills: Fixing Accessibility](https://github.com/ibelick/ui-skills/tree/main/skills/fixing-accessibility) | Inglés. Teclado, nombres, diálogos y formularios. | Menú con estado expandido, foco del diálogo restaurado, botones nativos, FAQ con details/summary, búsqueda con acción de restablecer y contraste revisado. |
| [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md), mediante su [skill pública](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | Inglés. Se descargó el documento fuente actual. | Enlace para saltar al contenido, encabezados, foco, imágenes con dimensiones, fuentes locales precargadas, formularios con etiquetas y controles que aceptan pegado. |
| [Agencia Digital de Japón: componentes de ejemplo](https://github.com/digital-go-jp/design-system-example-components-react) | Japonés en README y documentación, código TSX. Se revisaron `Disclosure` y `HamburgerMenuButton`. | Semántica HTML nativa para desplegables, botones táctiles y estados explícitos. No se copian su paleta, su identidad pública ni sus componentes React al proyecto. |

## Fuentes consideradas y límites

- [Google Stitch skills](https://github.com/google-labs-code/stitch-skills): se revisó DESIGN.md como registro semántico de colores, tipografía y geometría. El flujo requiere un proyecto y herramientas Stitch que no están conectados; no se afirma haber generado nada con Stitch. El documento local se construye a partir de la identidad de Nexo existente.
- [UI Skills: Baseline UI](https://github.com/ibelick/ui-skills/tree/main/skills/baseline-ui): parte de sus reglas exige Tailwind y Motion/React. No se aplica como una receta completa porque el proyecto usa HTML/CSS/JavaScript y el usuario fijó la identidad. No se migra el stack para seguir una habilidad.
- [Motion](https://github.com/motiondivision/motion): se examinó como recurso adicional; no se incorpora una biblioteca al runtime para interacciones que WAAPI ya resuelve.
- Frontend Design, Impeccable y Taste ya fueron revisadas en la primera iteración. Esta revisión conserva su recomendación de concentrar el carácter visual en el contenido y un momento propio, en vez de aplicar el mismo efecto de entrada a todas las secciones.
- No se instalaron habilidades globales ni se sustituyeron las instrucciones del proyecto por instrucciones de repositorios externos. Las herramientas auxiliares de revisión se mantuvieron fuera del checkout, salvo las pruebas de regresión del proyecto.

## Hipótesis comercial, no resultado medido

Mostrar una historia concreta y ofrecer una vía directa a consulta debería facilitar la comprensión y reducir fricción. Eso es una hipótesis de diseño: no se afirma un incremento de conversiones. Se necesitarán visitas reales y medición acordada con el usuario para evaluar el efecto comercial.

## Cómo mantener esta dirección

Antes de cambiar un bloque, identificar la pregunta del visitante que responde. Mantener la paleta y los archivos de marca de `DESIGN.md`. Probar teclado y teléfono, revisar el resultado en captura y comprobar que la animación explique una relación o confirme una acción. No añadir componentes solo porque aparezcan en una habilidad o en una galería.

## Revisiones de fuentes inspeccionadas

- `marketing`: `e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b`.
- `design-guidelines`: `747a47fdb6b405e5cbf268f7c410123930455157`.
- `vercel-design`: `063bee94c3f4df8453406c830b0a7df0f2860278`.
- `google-design`: `0337446dadde6f8c94210444e2aa9d546126480f`.
- `japan-components`: `68b452e16d40ffaebcb195a7289696f88890cc3e`.

## Validación de esta entrega

- Compilación de producción con Vite y base `/` para `nexoamedida.com`.
- 22 pruebas Playwright aprobadas en Chromium.
- 11 dimensiones: 320×740, 375×812, 390×844, 650×900, 768×1024, 820×1180, 844×390, 1024×768, 1280×800, 1440×1000 y 1920×1080.
- Revisión adicional de reflujo a 640 px como equivalente de una ventana de 1280 px con zoom nativo del 200 %. No se usa la propiedad CSS `zoom` como sustituto del zoom de navegador.
- Axe sobre etiquetas WCAG A/AA y 2.1, a 1440 y 390 px, antes y después de conectar: sin infracciones automáticas en esos estados. Esto no sustituye una evaluación manual completa ni certifica conformidad.
- Navegación con teclado, Escape y restauración de foco del diálogo; menú móvil y preguntas frecuentes.
- Mensaje de WhatsApp y correo alternativo validados mediante captura local de la URL, sin contactar al destinatario ni enviar mensajes.
- Recursos del dominio, CNAME y descargas de identidad comprobados en la compilación local de producción.
- Revisión visual de capturas de escritorio, móvil y tablet. No se afirma una prueba en dispositivos físicos ni una mejora comercial medida.
