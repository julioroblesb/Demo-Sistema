# Nexo — landing y demo comercial

Landing en español para sistemas de información operativa a medida. Nexo es una marca provisional.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+.

```sh
npm ci --cache /tmp/nexo-npm-cache
npm run dev
```

## Producción

```sh
npm run build
npm run preview
```

Se genera un sitio estático en `dist/`, compatible con alojamiento estático. No necesita credenciales, base de datos ni acceso al sistema de LR. Todos los datos de la demo son ficticios y los cambios se reinician al recargar.

## Antes de publicar comercialmente

- Confirmar nombre y marca.
- Conectar el formulario a un canal comercial real (correo, WhatsApp o servicio de formularios). Actualmente prepara texto para copiar e informa que no envía solicitudes.
- Si se incorpora recepción de datos, añadir la información de privacidad correspondiente al tratamiento real.

Manrope y DM Sans se sirven desde el propio sitio, sin peticiones a Google Fonts. Sus licencias OFL se incluyen en `public/licenses/`.

## Transformación interactiva

La escena inicial muestra tres escritorios con seis fuentes de información. Al pulsar **Ver la transformación**, los archivos viajan hasta una ficha que relaciona cliente, equipos, documentos e historial. La secuencia se puede repetir o interrumpir. Respeta la preferencia de movimiento reducido y no usa servicios externos ni librerías de animación.

Las referencias de diseño revisadas y las decisiones están en [docs/design-review.md](docs/design-review.md).

Para generar la versión de GitHub Pages con el dominio propio `nexoamedida.com`:

```sh
npm run build
```

Publicar el contenido generado de `dist/`, incluido `CNAME`, y un archivo vacío `.nojekyll` en la rama `gh-pages`, configurada como origen de GitHub Pages. La base de los recursos debe ser `/` para el dominio propio. El código fuente permanece en `main`.

La configuración exacta de DonWeb y los pasos de HTTPS están en [docs/dominio-donweb.md](docs/dominio-donweb.md).

## Diseño y contacto

La identidad fija y las reglas de interfaz están en [DESIGN.md](DESIGN.md). La investigación de habilidades públicas y los criterios aplicados a la revisión comercial están en [docs/investigacion-diseno-v2.md](docs/investigacion-diseno-v2.md).

El contacto abre una consulta preparada en WhatsApp al número `+51 936 755 465`, con correo alternativo `asesoria@nexoamedida.com`. El visitante realiza el envío en su aplicación; no hay un servicio backend de formularios ni una confirmación automática de recepción.

## Pruebas de regresión

```sh
npm test
```

Las pruebas usan Playwright y axe sobre la compilación de producción. Si Chromium no está instalado, ejecuta `npx playwright install chromium`; también puedes señalar un ejecutable existente con `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Cubren 11 dimensiones, orientación horizontal, teclado, movimiento reducido, relaciones de datos y URLs de contacto. Los mensajes se interceptan en las pruebas; no se envían consultas reales.
