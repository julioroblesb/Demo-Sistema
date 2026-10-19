# Revisión de diseño: transformación de información

## Propósito y dirección

La persona que visita es un dueño o responsable de operaciones que reconoce sus Excels, carpetas y registros separados. La escena debe explicar la relación entre cliente, equipo, contrato e historial. Se conserva la identidad existente aprobada por el usuario: Manrope en títulos, DM Sans en interfaz, fondo claro y verde Nexo.

Paleta: tinta #20352b, verde #247459, verde profundo #173e2e, escenario #eef2ee, superficie #ffffff, secundario #607168. El color identifica el origen: verde para hojas de cálculo, ámbar para carpetas, azul para registros comerciales.

Composición: tres escritorios de departamentos, con sus propios archivos y contexto, convergen en una única ventana de operación. La ficha final muestra un cliente y la información conectada de sus equipos. Los controles y el relato quedan fuera del área en movimiento. En móvil los escritorios forman una composición vertical y la ventana final reduce columnas.

Movimiento: una secuencia activada por el visitante. Los archivos originales viajan a sus destinos mediante transformaciones calculadas a partir de posiciones reales. Las conexiones se dibujan durante la integración; la ficha termina legible y estable. Sin bucles, captura del scroll ni dependencias de animación. Se puede interrumpir o repetir. Con movimiento reducido, se cambia directamente al resultado.

## Fuentes revisadas

- [Frontend Design de Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design): propósito, identidad deliberada y un solo momento visual protagonista. No se atribuye esta fuente a OpenAI ni se afirma una cifra de instalaciones.
- [Impeccable](https://github.com/pbakaus/impeccable): se aplicaron las pautas de `animate` y `craft-floor`: continuidad espacial, jerarquía, movimiento reducido, comprobación visual y transiciones interrumpibles.
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): revisión de su documentación y recomendaciones de responsive, contraste, estados y SVG en lugar de símbolos de texto para los iconos de la escena. No se instaló el CLI ni se reemplazó el stack.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill): revisión de la referencia de movimiento y ruta de rediseño. Se toma la idea de una escena distintiva y curvas de desaceleración. Se descartan los presupuestos de animación para toda la página: el usuario pidió refinar una interacción existente.
- Esable.design: no verificable desde este entorno; la conexión devuelve 403. No se atribuyen capacidades ni se afirma haber aplicado la habilidad.
- [Awesome Design Skills](https://github.com/bergside/awesome-design-skills): catálogo de estilos, no una única habilidad de motion. Se inspeccionó su contenido; estilos expresivos como Pulse no encajan con la identidad aprobada. Para esta implementación se usa Web Animations API, SVG y CSS.

Las fuentes externas son referencias de diseño; no se ejecutaron sus instaladores ni se añadieron habilidades al repositorio.
