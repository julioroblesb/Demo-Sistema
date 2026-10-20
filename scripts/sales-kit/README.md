# Kit comercial de Nexo

Material para la prospección de empresas de alquiler: siete mensajes editables, derivación desde ventas, seguimientos y guion de reunión. Sin precios, testimonios ni resultados comerciales inventados.

## Generación

Con las dependencias npm del proyecto, Chromium en `/usr/bin/chromium` y `python-docx` instalado:

```sh
python3 scripts/sales-kit/generate.py
npm run build
```

`content.json` contiene los correos y la guía. El generador produce la página interna, una ficha HTML/PDF A4, la guía Word, los correos TXT y un ZIP con carpetas separadas para compartir y para uso interno. CSS y JavaScript del portal se mantienen como archivos fuente en `public/SKYROTE13/kit-comercial/`.

## Publicación

- Consulta: `/SKYROTE13/kit-comercial/`.
- Adjunto para correo: `/presentacion/Nexo-Informacion-Conectada.pdf`.
- Adjunto para WhatsApp: `/presentacion/Nexo-WhatsApp-Informacion.jpg`.
- La presentación anterior sobre equipos permanece en `/presentacion/Nexo-Alquileres-Presentacion.pdf`.
- Alternativa legible en navegador: `/presentacion/nexo-informacion-conectada.html`.

La ruta interna lleva `noindex`, pero es una página estática con material genérico: no contiene la lista de prospectos, credenciales ni datos del CRM. Los correos se copian para que Julio revise los campos y los envíe desde su cuenta. El kit no realiza envíos ni agenda reuniones automáticamente.

## Verificación del 20 de octubre de 2026

Compilación correcta. Se verificaron las cinco descargas desde Chromium, los botones de copiar correo y WhatsApp, los siete mensajes, el DOCX editable y el ZIP sin errores. PDF etiquetado de una página A4 (aproximadamente 136 KiB), inspeccionado visualmente con la identidad existente. Portal sin desbordamiento a 320, 390, 768 y 1440 px; auditoría Axe A/AA sin infracciones detectadas. La ficha HTML también se revisó a 320 y 1440 px. Estas comprobaciones no verifican entrega de correo ni resultados comerciales.

## Revisión de mensajes para correo y WhatsApp

La actualización centra el mensaje en información dispersa entre Excels, carpetas y personas. `campaign.mjs` genera un PDF A4 de una página para correo y un JPG de 1080 × 1350 px para WhatsApp, usando la marca y fuentes existentes. Son documentos y un diagrama tipográfico, sin capturas inventadas ni métricas de ahorro no medidas. La referencia al proyecto real proviene del usuario; no se añaden clientes, testimonios o resultados atribuidos.

Los dos mensajes de hoy aparecen primero en el portal; WhatsApp tiene su propio control de copia sin campo de asunto. La guía, TXT y ZIP incluyen ambos canales. Si se usan el mismo día, se coordinan en un seguimiento único y se continúa por el canal que responda.
