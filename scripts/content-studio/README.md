# Estudio de contenido Nexo

Portal estático en `public/estudio-6e94b8f2c731/`. La ruta se mantiene fuera del menú principal. **No es autenticación**: la página, sus archivos y el repositorio son públicos. `noindex` solicita exclusión de buscadores; no es una garantía de confidencialidad.

Se conservan el SVG maestro y las fuentes locales de la marca. Las piezas son composiciones HTML y diagramas propios exportados a JPG. Los videos son recreaciones editoriales animadas con datos ficticios, no capturas de un producto en producción. Sin testimonios, cifras de ahorro ni clientes inventados como prueba comercial.

## Material producido

- 12 publicaciones: 4 imágenes, 4 carruseles de 5 láminas y 4 videos.
- P04 incluye otras 5 láminas cuadradas para el anuncio.
- Cada video: MP4 H.264 vertical 1080×1920 y feed 1080×1350, aproximadamente 24 s, sin audio. Texto explicativo en pantalla; GIF 540×675 como vista previa y JPG de portada.
- 8 secuencias de 3 historias JPG 1080×1920: 24 imágenes.
- Portada de Facebook 1640×624 y enlace al kit de perfiles existente.
- Copies de Facebook e Instagram por publicación, copy y titulares separados para anuncios, guía de uso, calendario CSV/ICS y Excel actualizado.
- ZIP por publicación, por secuencia, lanzamiento y entrega completa. Los archivos grandes no se cargan automáticamente en el portal.

## Reconstrucción

Desde la raíz del repo, con Node, dependencias del lockfile instaladas, Chromium y FFmpeg. Python necesita `openpyxl` para el Excel. El navegador de Playwright necesita FFmpeg para grabar. `npx playwright install ffmpeg` instala su binario cuando la red lo permite. En este entorno ya existe `/usr/bin/ffmpeg` y se reutilizó mediante un enlace en la ubicación de FFmpeg esperada por Playwright, sin descargar artefactos externos.

```sh
python scripts/content-studio/prepare.py
node scripts/content-studio/render.mjs
node scripts/content-studio/movies.mjs
python scripts/content-studio/portal.py
python scripts/content-studio/package.py
npm test
```

`render.mjs` exporta imágenes y prepara escenas de video en `/tmp/nexo-movies`. `movies.mjs` las reproduce en Chromium, graba, codifica MP4 con FFmpeg y exporta GIFs. `portal.py` genera el HTML, CSS, JS, textos y calendario. `package.py` comprueba que los assets existen y crea los ZIP sin duplicar otros ZIP dentro del paquete completo. Regenerar piezas cambia los binarios: hacerlo sólo si se modifica el contenido o el diseño.

Las horas originales están en Lima y se exportan a ICS en UTC (+5 horas). Las fechas son sugeridas, no programaciones reales. El botón de marcado usa localStorage y no publica ni sincroniza cuentas. La copia usa Clipboard API con selección de texto como alternativa.

## Vista y verificación

Para la ruta de directorio usar la vista de producción (`npm run build` y `npm run preview`). Vite en desarrollo puede resolver `/estudio-…/` como la landing; el servidor de producción sirve el index anidado, igual que GitHub Pages. En desarrollo también se puede abrir la ruta completa terminada en `/index.html`.

`tests/content-studio.spec.js`: aislamiento de la landing, noindex, conteo y filtros, navegación, copia, persistencia local, ZIP, todos los archivos anunciados, calendario, reproducción MP4, GIF bajo demanda, tamaños 320/390/820/1440 y axe. Se mantienen las pruebas de la landing. Resultado: 29 pruebas superadas. FFprobe verificó los ocho MP4: H.264, dimensiones correctas y duración de 23,92–24,00 s. Los ZIP se verificaron con `testzip`.

Revisión visual: JPG de lanzamiento y carrusel, fotogramas de video, portal y detalle de pieza en móvil y escritorio. Las pruebas automáticas no certifican toda la accesibilidad ni equivalen a revisión en teléfonos físicos.
