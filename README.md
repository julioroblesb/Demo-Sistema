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

Las fuentes de Google son opcionales; hay fuentes locales de respaldo.
