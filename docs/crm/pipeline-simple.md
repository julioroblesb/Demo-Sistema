# Pipeline por empresa · octubre de 2026

El tablero y su tabla muestran una empresa por tarjeta/fila y cinco etapas: Filtrado, Contactado, Seguimiento, Ganado y Perdido. La tabla de Empresas comparte el mismo cálculo, las acciones de movimiento y el resumen del contacto. Las oportunidades, ventas y cobros siguen siendo registros individuales de cada empresa.

## Persistencia y compatibilidad

No hay migración de base de datos ni escritura al cargar registros. Se utiliza `crm_commit` y el esquema ya instalado. El esquema local probado coincide byte a byte con el SQL descargable. Las lecturas privadas, la autenticación, RLS, la autorización personal y las versiones se conservan.

Los códigos de etapa admitidos existentes se presentan así:

| Código | Etapa actual |
| --- | --- |
| `diagnostico` | Filtrado |
| `demo` con `pipeline_version: 2` | Contactado |
| `propuesta` | Seguimiento |
| `ganada` | Ganado |
| `perdida` | Perdido |

Una oportunidad anterior en `demo` sin versión 2 o en `negociacion` se interpreta como Seguimiento: esos registros describían una negociación comercial, no un primer contacto. Ambos códigos anteriores siguen siendo válidos para respaldos. Al editar se guarda una de las cinco opciones actuales y la versión de representación 2.

El campo opcional `companies.pipeline_stage` identifica la etapa elegida para el ciclo actual. Tiene prioridad sobre el historial, de modo que reabrir una empresa con ventas anteriores no borra esas ventas ni la devuelve automáticamente a Ganado. También se actualiza su código `status` existente. Sin ese campo, se derivan las etapas a partir del estado, oportunidades e historial anterior. Las empresas archivadas se mantienen fuera del pipeline.

## Contacto, respuesta y cierre

`activities.kind: contacto` guarda `channels` (lista validada), `occurred_at` (ISO), `date` y `time` (Lima). Se calcula al pulsar Guardar, no al abrir el formulario; no se deduce de pulsar un enlace externo. La transacción actualiza la empresa y, cuando cambia su etapa, las oportunidades abiertas. Se admiten correo, WhatsApp, llamada, Instagram, Facebook, LinkedIn, presencial y otro canal. Los registros anteriores de canal único se siguen leyendo.

`activities.kind: respuesta` guarda el instante, resultado y `contact_id` del último contacto. La respuesta no sustituye la fecha del contacto saliente. Un contacto posterior conserva el historial y vuelve a mostrar respuesta pendiente. Los formularios comprueban versión de la empresa e identificador del contacto; una edición atrasada no reemplaza otra de un segundo dispositivo.

Una negativa guarda Perdido, el motivo y la cancelación de acciones comerciales pendientes en la misma transacción. Las oportunidades ganadas, pagos, hitos, tareas vinculadas a ventas ganadas y tareas de tipo entrega se conservan. Una empresa perdida no admite nuevas tareas comerciales pendientes hasta reabrir su seguimiento. Se conserva el límite de 180 operaciones atómicas del backend: si un cierre lo excede, se informa el problema y no se guarda parcialmente.

El importe visible se obtiene de oportunidades existentes, separado por moneda. Registrar un contacto o una respuesta no crea una oportunidad ni altera cifras financieras. Ganado exige registrar o confirmar una venta con importe y cierre; los cobros y las entregas siguen en su ficha.

## Validación

Pruebas puras de las operaciones y del historial; PostgreSQL local con el SQL instalado, transacciones, conflictos y conservación de ventas; navegador con alta, multiselección obligatoria, arrastre/cancelación, respuesta positiva y negativa, agenda, tablas, venta y accesibilidad. El adaptador Supabase utiliza el SDK real contra respuestas HTTP simuladas. Las pruebas no escriben en la cuenta real del propietario ni certifican su conexión remota.
