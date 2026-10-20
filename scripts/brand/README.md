# Exportaciones de marca

El punto circular conserva la caja exterior del glifo anterior: centro (320,136), radio 136, con la transformación original. No se modifica la forma de las letras ni del isotipo.

Requisitos de exportación: Python con fonttools, brotli, uharfbuzz, cairosvg, Pillow; ImageMagick (`magick`); Node con las dependencias del proyecto; Chromium local. Son herramientas de producción de archivos y no dependencias del sitio publicado.

Desde la raíz del repositorio:

```bash
python scripts/brand/generate.py
python scripts/brand/profiles.py
node scripts/brand/publish.mjs
node scripts/site-icons.mjs
```

Los dos primeros scripts escriben en `../deliverables`. El tercero imprime el manual, empaqueta el kit y copia el maestro y favicons a `public`. El último normaliza los encabezados de las cuatro páginas. Al cambiar el maestro, regenerar también los PDF de demo y las piezas del estudio siguiendo sus README para que los archivos descargados compartan el logo.

`public/favicon.svg` conserva el isotipo vectorial de ocho direcciones. ICO con tamaños 16/32/48, PNG 32×32 y apple-touch-icon 180×180 cubren los usos de navegador y pantalla de inicio. Los favicons deben tener rutas absolutas, también en páginas anidadas.
