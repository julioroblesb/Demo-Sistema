// The PDF develops a workflow and a first implementation scope; the image stays a summary.
export const SECTOR_GUIDES={
 impresion:{
  label:'Impresoras y fotocopiadoras',kicker:'GUÍA DE OPERACIÓN · EQUIPOS DE IMPRESIÓN',
  title:'Una visita técnica.\nInformación útil para toda la empresa.',
  lead:'La visita no termina con el trabajo en campo. Su reporte puede dar continuidad al servicio, al control administrativo y a la relación con el cliente.',
  flowTitle:'Cómo puede circular la información',
  steps:[
   ['Antes de salir','El técnico consulta la ficha del equipo: cliente, ubicación, incidencias y trabajos anteriores. Llega con antecedentes, sin reconstruir la historia por llamadas.'],
   ['Durante la visita','Registra diagnóstico, intervención, repuestos y contador desde su celular. Adjunta las evidencias y el reporte que correspondan a ese equipo.'],
   ['Al guardar el reporte','La visita queda relacionada con la impresora y su cliente. Las personas autorizadas pueden consultar el mismo registro, sin esperar una entrega en papel ni volver a digitarlo.'],
   ['Después de la atención','El equipo da seguimiento a lo pendiente: un repuesto, otra visita, una respuesta al cliente o la revisión de documentos para el cierre del periodo.']
  ],
  roles:[
   ['Servicio técnico','Diagnósticos, trabajos, repuestos y próximas acciones.','Preparar la siguiente atención con antecedentes.'],
   ['Administración','Equipo, ubicación, cliente, contrato y documentos.','Controlar la operación con información relacionada.'],
   ['Facturación','Contadores fechados, periodos y reportes de respaldo.','Preparar y revisar sus cargos con sustento.'],
   ['Atención al cliente','Última atención, estado del caso y compromisos pendientes.','Responder con contexto y coordinar el siguiente paso.']
  ],
  secondTitle:'Conectemos primero el flujo\nque más interrumpe a su equipo.',
  secondLead:'Acordamos con su equipo un primer flujo útil. Después ampliamos el sistema según las prioridades de su operación.',
  phases:[
   ['Elegir un recorrido','Identificar dónde se corta hoy la información: desde la solicitud del cliente hasta la visita, el registro del trabajo y su seguimiento.'],
   ['Relacionar los registros','Definir qué identifica a cada equipo y cómo se vinculan clientes, contratos, reportes y documentos. Reunir los datos actuales sin perder su origen.'],
   ['Probarlo con las áreas','Revisar el registro desde celular, quién puede consultar o editar y cómo se gestionan los pendientes. Ajustar el flujo antes de extenderlo.']
  ],
  foundations:['Listado de equipos, series, clientes y ubicaciones.','Formato de reporte técnico y datos que registra una visita.','Documentos y archivos que hoy consulta cada área.','Personas que registran, revisan o necesitan esa información.'],
  boundary:'Los formatos que hoy usa su equipo son el punto de partida. Acordamos cómo registrar la visita, qué documentos conservar y quién puede consultar o actualizar cada dato.',
  agenda:['Ver un proyecto real desarrollado por Nexo.','Conversar sobre una interrupción habitual de su operación.','Identificar un primer flujo que valga la pena conectar.']
 },
 computadoras:{
  label:'Laptops y computadoras',kicker:'GUÍA DE OPERACIÓN · ALQUILER DE COMPUTADORAS',
  title:'Del pedido a la devolución.\nUn alquiler que se puede seguir.',
  lead:'Confirmar una laptop para una fecha requiere más que saber dónde está hoy. La reserva, el retorno previsto y su revisión deben dar contexto al siguiente alquiler.',
  flowTitle:'Cómo puede avanzar cada alquiler',
  steps:[
   ['Confirmar el periodo','Ventas consulta equipos y reservas para las fechas solicitadas. Distingue lo disponible de lo comprometido o pendiente de revisión antes de ofrecer una entrega.'],
   ['Preparar la salida','Almacén relaciona cada número de serie con el cliente, el contrato y su entrega. Registra los accesorios y el estado con el que sale cada equipo.'],
   ['Registrar el retorno','La devolución se contrasta con la entrega: fecha, cargador, accesorios y condición. Las observaciones quedan asociadas al mismo alquiler.'],
   ['Habilitar el siguiente uso','Soporte registra la revisión o el mantenimiento. Almacén y ventas pueden distinguir una laptop devuelta de una laptop lista para volver a alquilar.']
  ],
  roles:[
   ['Ventas','Periodo solicitado, reservas y equipos habilitados.','Confirmar una propuesta con mayor claridad.'],
   ['Almacén','Series, ubicación, entregas, accesorios y retornos.','Coordinar la salida y recibir lo que corresponde.'],
   ['Soporte','Condición del equipo, incidencias y revisiones.','Priorizar el trabajo necesario antes de otro alquiler.'],
   ['Administración','Cliente, contrato, documentos y fechas acordadas.','Dar seguimiento al alquiler con sus respaldos.']
  ],
  secondTitle:'Empiece por saber qué puede ofrecer.\nDespués conecte el resto del alquiler.',
  secondLead:'Definimos el primer alcance con quienes venden, entregan, reciben y revisan los equipos. Cada etapa aprovecha la información de la anterior.',
  phases:[
   ['Ordenar equipos y estados','Acordar una identificación por serie y distinguir disponibilidad, reserva, entrega y revisión. Definir cómo se consultan las fechas de cada alquiler.'],
   ['Conectar la entrega y el retorno','Relacionar contrato, cliente, accesorios y condición de salida y llegada. Vincular los documentos al alquiler correspondiente.'],
   ['Dar continuidad al trabajo','Organizar retornos previstos, pendientes y revisiones. Acordar quién actualiza el estado y cuándo el equipo vuelve a estar habilitado.']
  ],
  foundations:['Inventario con marca, modelo, número de serie y estado.','Reservas, contratos y fechas previstas de retorno.','Formatos de entrega y devolución, incluidos accesorios.','Criterios de revisión antes de volver a ofrecer un equipo.'],
  boundary:'Cada empresa decide qué necesita registrar al entregar, recibir y revisar un equipo. Acordamos los estados, responsables y documentos para que la información acompañe todo el alquiler.',
  agenda:['Ver un proyecto real desarrollado por Nexo.','Revisar cómo confirman hoy una disponibilidad.','Identificar el primer punto que convendría conectar.']
 }
};
