# Validación de la revisión UX v4

20 de octubre de 2026. Entorno de laboratorio: Linux, Node 24.19.0, Vite 7.3.7, Chromium 154 local. No equivale a probar físicamente iPhone, Android o Safari ni a medir visitantes del sitio publicado.

## Resultado funcional

`npm test`: **34 pruebas aprobadas** (24,9 s en la ejecución final completa). Incluye los 6 casos del estudio de contenido, preservado con sus archivos, calendario, filtros y copias. Después de ajustar la redacción de los copies a «datos de demostración», se vuelve a ejecutar la suite del estudio: **6 de 6 pruebas aprobadas** (7,2 s).

- Cuatro equipos: impresora Ricoh, monitor Dell, tablet Samsung e impresora HP. Se verifica la relación con el cliente, historial propio, reporte y regreso a la ficha.
- Doce PDF: HTTP 200, firma de archivo PDF, descarga efectiva, texto extraíble con cliente/modelo/serie correctos y una página A4 cada uno. PDF etiquetado por Chromium; esto no certifica por sí solo PDF/UA.
- Apertura directa desde la portada y restitución del foco al control de origen al cerrar con Escape.
- Búsqueda con/sin tildes, estados vacíos, restablecimiento y documentos filtrados por cliente.
- Explicación de 9 s con pausa, continuación, repetición, pasos manuales y movimiento reducido. Sin JavaScript se conserva la explicación estática.
- Video de 18 s en escritorio y vertical: reproducción efectiva, pausa al cerrar y ninguna descarga del MP4 antes de solicitar reproducción. Texto alternativo del recorrido.
- Formulario: prepara el mensaje para WhatsApp con el número y correo autorizados. La prueba intercepta `window.open`; no contacta ni envía mensajes a esos servicios.
- Favicon SVG, ICO, PNG y apple-touch-icon con HTTP 200 en las cuatro páginas; títulos breves. No se controla la caché ni el recorte que haga cada navegador.
- Marca: punto circular en el SVG maestro, archivos regenerados y ZIP legibles. Los 12 JPG de perfil siguen siendo 1080 × 1080.

## Reflujo y accesibilidad

Viewports: 320×740, 375×812, 390×844, 650×900, 768×1024, 820×1180, 844×390, 1024×768, 1280×800, 1440×1000 y 1920×1080. Además, reflujo a 640 px como equivalente de viewport CSS a 1280 px con zoom 200 %; no se confunde con probar todos los ajustes de zoom nativos.

Sin desbordamiento horizontal en los recorridos probados; cuadros de diálogo dentro de la pantalla. En móvil la comparación se apila y simplifica la parte «Antes» para no reducir la tipografía a dos columnas estrechas. Campos de contacto y búsqueda de 16 px en móvil. Controles primarios de al menos 44 px, foco visible, navegación con teclado y cierre de diálogo.

Axe: sin infracciones detectadas en los estados auditados con reglas WCAG 2 A/AA y 2.1 A/AA. Se comprobó portada, demo desplegada, ficha, documento y video. No sustituye una auditoría humana completa con lector de pantalla.

La primera prueba detectó contraste transitorio insuficiente en la entrada del diálogo por la animación de opacidad. Se eliminó el fundido del contenido; la transición usa desplazamiento breve y conserva el contraste. La prueba posterior pasa. No se silenciaron reglas para resolverlo.

Inspección visual de escritorio, comparación móvil, ficha y documento; fotogramas del video vertical y de escritorio. Se corrigió un glifo de flecha sin representación por un SVG y el espacio tras el salto de línea al apilar la comparación.

## Rendimiento observado, no rendimiento de campo

Método reproducible: `scripts/demo/audit.mjs`; salida íntegra en `rendimiento-laboratorio-v4.json`. Un recorrido por escenario, no percentiles de una población de visitas. Red CDP simulada a 1,6 Mbps y 100 ms; escritorio sin ralentización de CPU y móvil a 4×. Mismo navegador/máquina, sin dispositivos físicos.

| Observación | Escritorio | Móvil, CPU 4× |
| --- | ---: | ---: |
| LCP observado al cargar | 604 ms | 864 ms |
| Recursos iniciales, sin contar el documento HTML | 101.251 bytes | 101.251 bytes |
| MP4 solicitado al cargar | No | No |
| Mayor duración observada de evento de interacción | 24 ms | 72 ms |
| Mayor tarea larga observada, incluida carga | 91 ms | 227 ms |
| Suma de layout shifts sin entrada reciente, durante el recorrido | 0,00075 | 0 |
| Intervalo rAF p95, ventana de 3,3 s durante explicación | 16,7 ms | 16,7 ms |
| Intervalos rAF > 50 ms en esa ventana | 0 de 198 | 0 de 198 |
| Errores JavaScript | 0 | 0 |

El intervalo rAF mide programación de cuadros, no cuadros perdidos del compositor ni reproducción física de una pantalla. La mayor duración de evento no se presenta como INP de campo. La suma de layout shifts del recorrido tampoco se presenta como el CLS oficial calculado por ventanas de sesión. Se reportan los datos tal como los recoge el script, con su alcance.

El bundle de producción usa aproximadamente 8,1 kB de JS y 11,3 kB de CSS comprimidos por gzip. Fuentes locales: 24,8 y 36,9 kB. Los videos son pequeños (aprox. 196 y 152 KiB de archivos en disco) y no bloquean la portada. No se añadieron frameworks de animación, reproductores de terceros ni trackers.

## Lo que falta para evaluar ventas

No hay evidencia suficiente para afirmar aumento de conversión, comprensión de prospectos o atención ocular. El plan de tareas con clientes potenciales, interpretación de mapas de clic/scroll y medición comercial está en `investigacion-ux-v4.md`. El siguiente resultado útil será observar si personas del público objetivo completan la tarea y si llegan consultas pertinentes; no perseguir más animaciones como fin en sí mismo.
