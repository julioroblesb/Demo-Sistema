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

Para generar la versión de GitHub Pages de este repositorio:

```sh
npm run build -- --base=/Demo-Sistema/
```

Publicar el contenido generado de `dist/` y un archivo vacío `.nojekyll` en la rama `gh-pages`, configurada como origen de GitHub Pages. El código fuente permanece en `main`.
