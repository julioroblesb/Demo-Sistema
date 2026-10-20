# Seis carruseles de soluciones

Colección independiente en `/estudio-6e94b8f2c731/soluciones/`, enlazada desde el estudio existente. Conserva los materiales previos y no modifica datos del CRM.

`content.json` contiene los seis casos, cinco láminas por caso y dos descripciones por publicación. `render.mjs` compone los vectores, reutiliza logo/fuentes/paleta y exporta 30 JPG 1080 × 1080 y un PDF de revisión de 30 páginas. Comprueba geometría antes de exportar. `package.py` valida dimensiones, incorpora textos alternativos, crea seis ZIP individuales y un ZIP completo sin ZIP anidados. `portal.py` crea el visor y copia CSS/JS.

Desde la raíz del repositorio, con las dependencias npm, Chromium, Python y Pillow:

```sh
node scripts/content-studio/soluciones/render.mjs
python3 scripts/content-studio/soluciones/package.py
python3 scripts/content-studio/soluciones/portal.py
npm run build
```

Para modificar únicamente el portal, basta con los dos últimos comandos. La vista de directorio se revisa desde el servidor de producción o un servidor estático de `dist`, igual que el estudio existente.

El visor permite avanzar con botones, teclado o un gesto táctil; abre las imágenes a tamaño completo y descarga la lámina elegida. Las descripciones cambian entre Instagram y Facebook y se copian de forma independiente. El PDF sirve para revisar, no para subirlo como carrusel. No se programan publicaciones ni se activan anuncios.

[Base editorial y fuentes](../../../docs/contenido/criterio-seis-carruseles.md) distingue escenas de trabajo y cálculos operativos de resultados atribuidos a clientes.

## Verificación del 20 de octubre de 2026

Compilación de producción correcta. Se verificaron los 30 JPG con dimensiones exactas, el PDF cuadrado de 30 páginas, los cálculos operativos y los siete ZIP sin errores. La revisión en Chromium recorrió las cinco láminas de cada caso, los controles de teclado, la copia exacta de las doce descripciones y las siete descargas de paquetes. Portal sin desbordamiento a 320, 390, 768 y 1440 px y auditoría Axe A/AA sin infracciones detectadas. También se probó el gesto táctil en una vista móvil y se conservaron las doce publicaciones anteriores. Se inspeccionaron las seis portadas y láminas de flujo, datos y cierre. Estas comprobaciones no miden resultados comerciales ni sustituyen pruebas en teléfonos físicos.
