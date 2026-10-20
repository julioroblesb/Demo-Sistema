# Demo y archivos asociados

- `src/demo-data.json`: fuente única de clientes, equipos, documentos y eventos. Datos de demostración, sin acceso a registros de clientes reales.
- `node scripts/demo/documents.mjs`: genera los 12 PDF A4 etiquetados con Chromium a partir del JSON. Usa el logo y las fuentes locales.
- Con la app en `http://127.0.0.1:4192`, `node scripts/demo/video.mjs`: registra la propia demo, con indicaciones de tres pasos y encuadre para cada formato. Exporta MP4 H.264 de 18 s, escritorio 1280×900 y vertical 540×960, y sus portadas. `NEXO_PREVIEW_URL` permite otra dirección local. Requiere Chromium, ffmpeg y ffprobe.
- Con el build servido en `http://127.0.0.1:4194`, `node scripts/demo/audit.mjs`: perfil de laboratorio con red simulada y dos niveles de CPU. No instala analítica ni contacta servicios de medición. Resultados en `docs/rendimiento-laboratorio-v4.json`.

Los PDF y videos no se cargan con la portada. No son contratos reales ni testimonios de clientes. Las ilustraciones SVG son diagramas del tipo de equipo, no fotografías oficiales de los modelos.

El video tiene controles nativos, no usa autoplay y tiene alternativa textual en el diálogo. La preferencia de movimiento reducido cambia la explicación animada a pasos manuales.
