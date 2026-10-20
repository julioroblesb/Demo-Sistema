# Kit comercial de Nexo

Material para la prospección de empresas de alquiler: seis correos editables, derivación desde ventas, seguimientos y guion de reunión. Sin precios, testimonios ni resultados comerciales inventados.

## Generación

Con las dependencias npm del proyecto, Chromium en `/usr/bin/chromium` y `python-docx` instalado:

```sh
python3 scripts/sales-kit/generate.py
npm run build
```

`content.json` contiene los correos y la guía. El generador produce la página interna, una ficha HTML/PDF A4, la guía Word, los correos TXT y un ZIP con carpetas separadas para compartir y para uso interno. CSS y JavaScript del portal se mantienen como archivos fuente en `public/SKYROTE13/kit-comercial/`.

## Publicación

- Consulta: `/SKYROTE13/kit-comercial/`.
- Pieza para prospectos: `/presentacion/Nexo-Alquileres-Presentacion.pdf`.
- Alternativa legible en navegador: `/presentacion/nexo-alquileres.html`.

La ruta interna lleva `noindex`, pero es una página estática con material genérico: no contiene la lista de prospectos, credenciales ni datos del CRM. Los correos se copian para que Julio revise los campos y los envíe desde su cuenta. El kit no realiza envíos ni agenda reuniones automáticamente.

## Verificación del 20 de octubre de 2026

Compilación correcta. Se verificaron las cuatro descargas desde Chromium, el botón de copiar, los seis mensajes, el DOCX editable y el ZIP sin errores. PDF etiquetado de una página A4 (aproximadamente 114 KiB), inspeccionado visualmente con la identidad existente. Portal sin desbordamiento a 320, 390, 768 y 1440 px; auditoría Axe A/AA sin infracciones detectadas. La ficha HTML también se revisó a 320 y 1440 px. Estas comprobaciones no verifican entrega de correo ni resultados comerciales.
