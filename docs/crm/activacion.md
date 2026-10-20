# Activar Nexo CRM en Supabase

Ruta del CRM: https://nexoamedida.com/SKYROTE13/ . No está enlazada desde la landing. El enlace secreto y `noindex` no son autenticación: el acceso real requiere una sesión personal y autorización en PostgreSQL.

Proyecto: `hwilhpcermjxsaplando`. La configuración pública está en `public/SKYROTE13/supabase-config.json`. Esa clave identifica el proyecto; los permisos de PostgreSQL protegen los datos. Nunca publicar una contraseña, cadena PostgreSQL con contraseña, token CLI, `service_role` ni clave `sb_secret_`.

## Pasos del propietario

1. En [SQL Editor](https://supabase.com/dashboard/project/hwilhpcermjxsaplando/sql/new), abrir una consulta, pegar TODO el contenido de [instalar-crm.sql](https://nexoamedida.com/SKYROTE13/instalar-crm.sql) y pulsar **Run**. El esquema es repetible; no borra datos existentes.
2. En [Authentication → Users](https://supabase.com/dashboard/project/hwilhpcermjxsaplando/auth/users), **Add user → Create new user**, crear el correo y contraseña personales, con **Auto Confirm User**. Esta es la cuenta para entrar al CRM, distinta de la contraseña de PostgreSQL.
3. Copiar el UUID de ese usuario. En el CRM → **Configurar conexión**, pegar el UUID y pulsar **Copiar autorización personal**. Ejecutar esa consulta en SQL Editor. Autoriza únicamente ese UUID. No autorizar cuentas desconocidas.
4. En Authentication → Sign In / Providers, desactivar **Allow new users to sign up**. No hay registro público en la aplicación. Revisar MFA y las opciones de recuperación en la cuenta del proveedor según necesidad.
5. Entrar al CRM con ese correo y contraseña. La base real empieza vacía. Crear una empresa de prueba propia, abrir el enlace en otro dispositivo e iniciar sesión: verificar que aparece y editar una tarea desde ambos. Los ejemplos de «Explorar con datos de prueba» nunca se suben automáticamente.

No hace falta cambiar DNS ni configurar Donweb para esta conexión. La landing continúa en GitHub Pages.

## Datos y límites

- Base PostgreSQL con RLS para lecturas del propietario autorizado. No hay lectura anónima ni escritura directa del navegador.
- `crm_commit` guarda transacciones con control de versiones y validación de relaciones y cobros. Si otro dispositivo editó una ficha, se rechaza la versión antigua y se conserva el borrador para revisarlo.
- Realtime notifica cambios; también se actualiza al volver a la pestaña, recuperar internet y cada 60 segundos cuando Realtime no está disponible y la pestaña está visible. El estado de conexión informa fallos. No se confirma un guardado antes de la respuesta del servidor.
- Sin internet se puede consultar lo ya cargado, pero no se guardan cambios en una cola offline. Cerrar sesión limpia los datos de la vista.
- Importación CSV con revisión previa, deduplicación y bloques confirmados. Respaldo JSON descargable y restauración aditiva: añade registros nuevos, conserva existentes. Crear respaldos periódicos; el plan gratuito no sustituye una política de recuperación.
- Valores en céntimos, PEN y USD separados; fechas y horas de operación en Lima. «Ganado» y «cobrado» son métricas distintas. No se realizan transferencias bancarias ni se emiten facturas.
- Sujeto a cuotas y condiciones actuales del plan gratuito de Supabase. No se garantiza disponibilidad permanente ni capacidad ilimitada.

## Pruebas

`npm test` ejecuta la compilación, las pruebas de dominio y los recorridos de navegador. `npm run test:crm:rules` ejecuta el SQL sobre PostgreSQL local PGlite con roles y funciones de autenticación de prueba: RLS, anónimo, otro usuario, permiso directo, transacciones, conflictos, saldos, anulación y aislamiento entre propietarios. No verifica entrega de correo, autenticación remota, Realtime remoto ni la instalación efectiva en el proyecto del propietario.

## Registro, búsqueda y seguimiento simplificados

- Etapas visibles: **Filtrado → Contactado → Seguimiento → Ganado / Perdido**. Cada empresa no archivada tiene una sola tarjeta, con o sin oportunidades. Las oportunidades anteriores siguen disponibles en su ficha; mostrar una empresa no crea ventas ni importes.
- Cambiar a **Contactado**, con «Mover», arrastrando o editando una oportunidad, exige seleccionar uno o varios canales. Al guardar se registra el instante del contacto y su fecha y hora de Lima. El tablero, la tabla del pipeline, la tabla de empresas y la ficha muestran el último contacto saliente y su respuesta. Abrir un enlace de correo o WhatsApp no registra un envío.
- **Registrar respuesta** permite elegir Positiva o Negativa. Positiva pasa a Seguimiento. Negativa pasa a Perdido, cierra las oportunidades abiertas y cancela las tareas comerciales pendientes en una sola transacción; conserva comentarios, contactos, ventas ganadas, cobros, hitos y tareas de entrega. Volver a una etapa abierta desde un cierre requiere una decisión explícita dentro del CRM. Un contacto adicional durante Seguimiento conserva la etapa y espera su propia respuesta.
- **Seguimiento** permite agendar reuniones, cotizaciones, proformas, visitas y los tipos de tarea existentes. Las tareas aparecen en agenda, lista y ficha; el pipeline muestra la próxima pendiente. Para **Ganado** se solicita importe y fecha de cierre y se mantienen los controles de cobros y entrega.
- La actualización **no requiere cambiar el SQL de Supabase**: emplea los códigos admitidos por el esquema instalado y los campos JSON existentes. Los datos anteriores se interpretan al leerlos, sin escrituras masivas: nueva/investigada → Filtrado; contactada → Contactado; conversación/calificada y oportunidades de demo o negociación anteriores → Seguimiento; cliente/ventas ganadas → Ganado; no encaja/no contactar → Perdido. Las fechas que nunca se registraron se muestran como no disponibles.
- La búsqueda por empresa y la búsqueda global incluyen teléfono, correo, dirección, RUC, contactos, notas y datos relacionados. Se ignoran mayúsculas y tildes; los teléfonos se encuentran con espacios y con prefijo peruano.
- Los avisos de coincidencias muestran empresa y campos iguales (nombre, RUC, teléfono, correo o web). También se revisan contactos y empresas archivadas. Un RUC repetido impide crear otra ficha desde el formulario. Para teléfonos, correos, nombres o web compartidos, se solicita revisar y confirmar **Guardar de todos modos**. La importación CSV señala coincidencias y omite esas filas en la revisión. Son comprobaciones de la aplicación sobre los registros cargados; no se ha añadido una restricción SQL de unicidad ni se promete resolver un alta simultánea desde clientes externos.
