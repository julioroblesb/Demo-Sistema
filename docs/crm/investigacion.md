# CRM Nexo: investigación previa y decisiones

20 de octubre de 2026, Lima. Investigación terminada antes de crear el código del CRM. Objetivo: convertir una investigación manual de 300 empresas de alquiler en un proceso comercial verificable, con contactos, oportunidades, seguimiento, cobros y entregas. No existe una muestra propia que permita prometer cuántas de esas 300 comprarán.

## Alcance y calidad de las fuentes

Se consultaron los capítulos y documentos originales que se detallan abajo. Dos son libros universitarios abiertos; los demás son manuales extensos de sistemas de CRM, patrones documentados, recomendaciones de accesibilidad y guías técnicas originales. No se afirma haber leído completos los libros ni que un manual de proveedor pruebe mejoras de ventas. Los commits de los repositorios consultados están en `fuentes.json`.

Los dominios editoriales de Founding Sales y del informe State of Sales no pudieron consultarse por restricciones de red. No se los cuenta entre las fuentes leídas, ni se inventan hallazgos del libro SPIN Selling, mencionado por OpenStax pero no consultado directamente.

| # | Fuente original consultada | Lectura y análisis | Aplicación concreta |
|---|---|---|---|
| 1 | [OpenStax / Rice University, Principles of Marketing](https://github.com/openstax/osbooks-principles-marketing/blob/main/modules/m00099/index.cnxml) | Capítulos «Steps in the Personal Selling Process», «Customer Relationship Management» y mercado B2B. Distingue prospección, calificación, investigación previa, contacto, presentación, objeciones, cierre y seguimiento. | Empresas investigadas no equivalen a oportunidades. Registro de fuente, necesidad, decisor, próxima acción y resultado. |
| 2 | [OpenStax / Rice University, Entrepreneurship](https://github.com/openstax/osbooks-entrepreneurship/blob/main/modules/m71153/index.cnxml) | «Sales and Customer Service» y «Market Research, Market Opportunity Recognition, and Target Market». Objetivos antes de contactar; medir resultados frente a objetivos; cumplir y acompañar el pedido después del cierre. | Meta inicial 300 empresas; monto y meta de ventas configurables; entrega y cobro posteriores al cierre. No adoptar sus ejemplos numéricos como tasas para Nexo. |
| 3 | [SuiteCRM: oportunidades](https://github.com/salesagility/SuiteDocs/blob/master/content/user/sales-relationships/opportunities.es.adoc) y leads | Documentación de oportunidad cualificada, organización, contactos, importe, moneda, cierre, siguiente paso y relaciones. También calendario y tareas en español. | Relaciones explícitas empresa/contactos/oportunidades/tareas/comentarios; una empresa puede originar más de una oportunidad. |
| 4 | [Odoo: actividades de CRM](https://github.com/odoo/documentation/blob/19.0/content/applications/sales/crm/optimize/utilize_activities.rst) | Actividades vinculadas, fecha, responsable, siguiente actividad; previsión por fecha de cierre y registro de razones de pérdida. | «Qué sigue» con vencimiento y tareas atrasadas. Pipeline con cierre ganado/perdido y motivo de pérdida. El plazo de cierre no se confunde con el plazo de entrega. |
| 5 | [Frappe CRM: modelo de oportunidad](https://github.com/frappe/crm/blob/main/crm/fcrm/doctype/crm_deal/crm_deal.json) y tareas | Modelo real y validaciones: propietario, estado, próximo paso, cierre esperado/real, moneda, valor y pérdida. Estado de la tarea separado de su prioridad. | Datos de negocio coherentes; tarea abierta/completada independiente de prioridad. Registrar cambios relevantes en la actividad del registro. |
| 6 | [Atomic CRM / Marmelab: arquitectura](https://github.com/marmelab/atomic-crm/blob/main/doc/src/content/docs/developers/architecture-choices.mdx) | Arquitectura, importación/exportación y uso móvil. La tabla resumen y la ficha responden necesidades distintas. Importar datos requiere ejemplos, mapeo y feedback. | Lista consultable de 300 empresas, detalle contextual, importación CSV con vista previa y errores, respaldo JSON y exportación CSV. No copiar todo su framework ni su proveedor. |
| 7 | [Salesforce Lightning Design System: Path](https://github.com/salesforce-ux/design-system/blob/master/ui/components/path/docs.mdx) y Data Tables | El paso seleccionado no siempre es el estado comercial guardado. Acciones y cabeceras deben ser semánticas; adaptar densidad a táctil. | Etapa comercial visible, control explícito de cambio, tablero y vista de lista; no depender de arrastrar para operar. |
| 8 | [W3C COGA: controles claros](https://github.com/w3c/coga/blob/main/design-guide/o1p05-clear-controls.html) y palabras claras | Controles reconocibles y vocabulario común. La persona no debe descubrir qué parte se puede tocar ni aprender un término arbitrario para completar una tarea. | «Nueva empresa», «Registrar llamada», «Marcar venta ganada», «Registrar cobro», «Próxima acción». Etiquetas y estados vacíos concretos. |
| 9 | [WAI-ARIA APG: diálogo modal](https://github.com/w3c/aria-practices/blob/main/content/patterns/dialog-modal/dialog-modal-pattern.html) y selector de fecha | Foco dentro del diálogo, Escape, devolución de foco, título accesible. El calendario de fecha tiene interacción específica que no se obtiene añadiendo roles. | Diálogos nativos, foco conservado, campos de fecha nativos, calendario de agenda operable con botones. |
| 10 | [W3C WCAG 2.2: Dragging Movements](https://github.com/w3c/wcag/blob/main/understanding/22/dragging-movements.html), Target Size y Error Prevention | Arrastrar exige alternativa con clic/toque; datos importantes requieren revisión, corrección o reversión. No exigir confirmación por cada guardado trivial. | Selector de etapa además de arrastre; cierre ganado/perdido con datos explícitos; importación revisable; archivar en lugar de borrar empresas por accidente. |
| 11 | [OWASP: Authorization Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Authorization_Cheat_Sheet.md) y Multi-Tenant Security | Una URL opaca no es autorización. Denegar por defecto y comprobar cada operación. Identidad del navegador no basta si el servidor no valida el acceso. | Inicio de sesión personal y reglas de Firestore por UID autorizado; sin credenciales administrativas en el sitio ni en el repositorio. |
| 12 | [Google Firebase: quickstart de Firestore](https://github.com/firebase/quickstart-js/blob/master/firestore/README.md) y Authentication | Arquitectura web con SDK, configuración de proyecto, correo/contraseña y emuladores. El ejemplo permite prescindir de funciones de servidor; no debe copiarse su configuración de ejemplo «test mode». | Firestore y Authentication, reglas cerradas, proyecto propio; ni Cloud Functions ni Cloud Storage para mantener el alcance dentro del plan Spark y sus cuotas. |
| 13 | [Google Firebase: pruebas de reglas](https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/README.md) | Pruebas de permitir y denegar, contextos autenticados y anónimos, emulador de reglas. | Probar lectura/escritura del dueño y denegación sin sesión o con otra identidad. Distinguir emulación local de despliegue real. |
| 14 | [Google Firebase JS SDK](https://github.com/firebase/firebase-js-sdk/tree/main/packages/firestore) y Auth | SDK soportado, listeners de cambios y transacciones; pruebas locales de autenticación. | Suscripciones entre dispositivos, guardado confirmado, detección de edición simultánea y renovación de sesión gestionada por el SDK. |

## Decisiones que surgen de comparar las fuentes

### 300 empresas es una meta de actividad, no un pronóstico de ventas

El registro de 300 empresas sirve para organizar trabajo. No existe una equivalencia verificable «300 empresas = X ventas». La barra de avance del registro no debe inflarse con duplicados o con los datos de demostración. El dinero ganado y el dinero cobrado responden preguntas diferentes y se muestran por separado.

OpenStax describe siete pasos en un libro y seis en otro. SuiteCRM ofrece más etapas y Odoo permite personalizarlas. Esto muestra que no hay un número universal de columnas. Para Nexo se adopta un recorrido manejable: diagnóstico, demo, propuesta, negociación y cierre. La investigación previa y el primer contacto pertenecen al estado de la empresa; no hay que crear una oportunidad monetaria para cada nombre obtenido de internet.

### El seguimiento debe conducir una acción concreta

Un tablero puede verse lleno y, aun así, esconder oportunidades abandonadas. Cada ficha debe mostrar qué falta, qué se hará y cuándo. El inicio prioriza vencidas, tareas de hoy y oportunidades sin siguiente acción. Los comentarios son historial; no reemplazan una tarea con fecha. La agenda reúne reuniones, tareas, cierres esperados y entregas, con el tipo visible.

### Una venta ganada inicia trabajo adicional

Se conserva el monto pactado, moneda y fecha de cierre. Los cobros se registran como movimientos separados y el saldo se calcula; no se marca automáticamente todo como pagado. Se pueden seguir fecha de entrega e hitos. Registrar un cobro en el CRM no procesa un pago, emite un comprobante SUNAT ni acredita que un banco lo recibió.

La previsión ponderada de un proveedor suele usar probabilidades por etapa. No tenemos datos históricos de Nexo para calibrarlas: no se insertan porcentajes automáticos que aparenten precisión. Se puede mostrar el valor abierto y el valor ganado, distinguiendo monedas sin inventar un tipo de cambio.

### Intuitivo significa menos decisiones innecesarias

La primera pantalla responde «qué tengo que hacer hoy». La empresa permite ver sus contactos, tareas, conversaciones y oportunidades sin perder contexto. Al crear un registro se pide lo esencial; el resto se agrupa como información opcional. En móvil se priorizan acciones y listas legibles. El tablero no depende exclusivamente del arrastre ni de color para comunicar estados.

No se añade animación permanente al trabajo de datos. Las transiciones breves ayudan a identificar paneles; confirmaciones, errores y estado de guardado son más importantes que efectos decorativos. Se respeta movimiento reducido.

### Importar 300 registros exige tratar los errores como parte del producto

Se proporciona una plantilla con columnas claras; CSV con comas o punto y coma y campos entrecomillados. Antes de importar: vista previa, duplicados, errores por fila y cantidad real a guardar. Un error parcial no debe fingir una importación completa. Los campos calculados del progreso nunca se importan como hechos.

Datos y comentarios se exportan a un respaldo JSON con versión del formato; CSV para empresas y oportunidades; agenda en ICS. Los valores exportados que podrían interpretarse como fórmulas se protegen. Ningún archivo descargado se sube a otra cuenta automáticamente.

### Acceso personal y sincronización

El usuario pidió acceso desde computadora y celular. Un CRM solo en localStorage no cumple ese requisito. Tampoco basta publicar su contenido en un repositorio o en la ruta «secreta» de GitHub Pages.

Se descarta Supabase por preferencia explícita. MySQL requeriría servidor de API, alojamiento y autenticación adicionales. Se elige Firebase Authentication y Firestore para que la aplicación estática ya alojada se conecte a una base de datos gestionada sin servidor propio. El plan gratuito está sujeto a las cuotas y condiciones de Firebase; no se garantiza gratuidad ilimitada. No se utiliza Storage (cuyos requisitos comerciales han cambiado), Functions, SMS ni Analytics. Documentos externos se enlazan en lugar de subir archivos.

No hay cuenta Firebase ni credenciales de despliegue disponibles. Por tanto, se construirá la aplicación y la activación guiada, pero no se afirmará que existe una base de datos pública configurada sin que el propietario cree y conecte el proyecto. La demostración se identifica y se mantiene separada de los datos reales. La aplicación no convierte automáticamente el modo de prueba en producción.

## Funciones previstas y criterio de terminado

1. Inicio con meta 300, metas financieras editables, tareas de hoy, alertas y siguiente acción.
2. Empresas de alquiler con categoría, RUC opcional, fuente URL, contactos, prioridad, necesidad y estado.
3. Pipeline de oportunidades con importe/moneda, etapa, cierre esperado, siguiente paso, propuesta y pérdida.
4. Tareas y reuniones vinculadas, fechas y hora de Lima; calendario mensual y agenda; exportación ICS.
5. Ficha con contactos múltiples, comentarios e historial de actividades; contacto manual por enlaces.
6. Ventas ganadas, cobros parciales, saldo, fechas de entrega e hitos.
7. Reportes con definiciones de métricas, monedas separadas y filtros por periodo.
8. Importación con revisión, prevención de duplicados, CSV y respaldo JSON completo.
9. Acceso personal, logout, sincronización, estado de conexión y conflicto de edición.
10. Ruta /SKYROTE13/, no enlazada desde la landing y con noindex; favicon y marca existentes.

Comprobación: tareas completas con datos de prueba, importación de 300 empresas sin duplicación, cambio de etapa y cierre, cobro parcial, entrega, respaldo, fechas de Lima, persistencia y reactividad, reglas de acceso, teclado, tamaños pequeños y regresión de la landing. Los resultados se registrarán por separado: no se llamará «sincronización real probada» a una prueba con un adaptador local.

## Sesgos y límites

Los manuales describen productos que sus autores venden o mantienen. Su coincidencia sobre objetos y actividades es un argumento de diseño, no evidencia causal de aumento de ingresos. Las guías de accesibilidad aportan requisitos de interacción, no una preferencia estética. Los libros incluyen cifras secundarias y ejemplos de conversión/retención que no se trasladan al mercado peruano ni a Nexo. Se toman conceptos y se contrastan; no se copian grandes fragmentos ni se usa material del libro como contenido publicitario del CRM.
