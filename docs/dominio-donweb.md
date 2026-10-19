# Dominio propio: nexoamedida.com

El dominio se toma de las capturas del panel de DonWeb proporcionadas por el usuario. La web se publica en GitHub Pages desde la rama `gh-pages`, carpeta raíz.

## Configuración del proyecto

- `public/CNAME` contiene `nexoamedida.com`. Vite lo copia a `dist/CNAME`.
- El sitio debe compilarse con base `/`, porque el dominio sirve la web desde su raíz.
- Publicar el contenido de `dist/` junto con `.nojekyll` en la rama `gh-pages`, conservando siempre `CNAME`.
- Usar `npm run build`. No usar `--base=/Demo-Sistema/` en la versión del dominio propio.

## DonWeb

En Dominios → nexoamedida.com → Nameservers y Zona DNS → NS y Registros DNS:

1. Mantener los nameservers `ns1.donweb.com` y `ns2.donweb.com` que muestra el panel.
2. Crear la zona DNS si no existe.
3. Añadir estos cinco registros, uno por uno:

| Tipo | Nombre | Contenido | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 14400 |
| A | @ | 185.199.109.153 | 14400 |
| A | @ | 185.199.110.153 | 14400 |
| A | @ | 185.199.111.153 | 14400 |
| CNAME | www | julioroblesb.github.io | 14400 |

El campo Nombre del formulario indica que `@` corresponde a la raíz. Si el panel lo convierte en `nexoamedida.com`, se trata del mismo nombre. El CNAME de `www` apunta al hostname de GitHub, sin esquema, ruta ni nombre del repositorio.

Si la zona recién creada incluye registros A, AAAA o CNAME de parking para esos mismos nombres, sustituir solo los que entren en conflicto con el sitio. Conservar los registros de correo y las verificaciones que correspondan. No usar Redirección y parking para alojar esta web.

## GitHub Pages y HTTPS

En https://github.com/julioroblesb/Demo-Sistema/settings/pages comprobar:

- Source: Deploy from a branch.
- Branch: gh-pages / (root).
- Custom domain: nexoamedida.com.
- Enforce HTTPS: activar cuando GitHub haya emitido el certificado.

El certificado lo gestiona GitHub Pages gratuitamente. La emisión depende de que los DNS y el dominio de Pages coincidan; puede tardar hasta 24 horas después de la configuración correcta. La propagación DNS puede tardar hasta 48 horas según las cachés.

La comprobación del panel de Pages por API está bloqueada en este entorno. Un push correcto de CNAME confirma que el archivo quedó publicado en la rama, pero no prueba por sí solo la configuración efectiva, la propagación DNS ni la emisión del certificado.

Referencia: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
