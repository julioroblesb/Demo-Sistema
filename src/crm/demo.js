import { emptyData, DEFAULT_SETTINGS, today, addDays, id } from './domain.js';
export function seedDemo() {
  const data = emptyData(); const day = today(); const timestamp = new Date().toISOString();
  const meta = row => ({ ...row, version: 1, created_at: timestamp, updated_at: timestamp });
  data.companies = [
    ['demo-empresa-1','Andina Equipos','Maquinaria y construcción','Lima','calificada','alta','Controlar ubicación, alquileres y mantenimiento'],
    ['demo-empresa-2','Oficina Conectada','Impresoras y oficina','Lima','conversacion','alta','Relacionar contratos y servicios por impresora'],
    ['demo-empresa-3','Escena Eventos','Eventos y mobiliario','Arequipa','investigada','media','Organizar reservas y devoluciones'],
    ['demo-empresa-4','Ruta Flota','Vehículos y transporte','Lima','contactada','media','Consultar disponibilidad y documentación'],
    ['demo-empresa-5','Proyección AV','Tecnología y audiovisuales','Trujillo','cliente','alta','Centralizar clientes, equipos y documentos'],
    ['demo-empresa-6','Herramientas Norte','Herramientas','Piura','nueva','baja',''],
  ].map(([id,name,sector,city,status,priority,need]) => meta({ id,name,sector,city,status,priority,need,ruc:'',district:'',address:'',website:'',phone:'',email:'',source_url:'',source:'Ejemplo de uso',notes:'',archived:false }));
  data.contacts = [meta({ id:'demo-contacto-1',company_id:'demo-empresa-1',name:'Mariana Torres',role:'Administración',email:'',phone:'',decision_maker:true }),meta({id:'demo-contacto-2',company_id:'demo-empresa-2',name:'Carlos Ríos',role:'Operaciones',email:'',phone:'',decision_maker:false})];
  data.deals = [
    meta({id:'demo-deal-1',company_id:'demo-empresa-1',title:'Sistema de alquileres y mantenimiento',stage:'propuesta',amount_cents:680000,currency:'PEN',paid_cents:0,expected_close:addDays(day,7),closed_date:'',delivery_date:'',delivery_status:'pendiente',next_step:'Revisar el alcance con administración',next_action_date:addDays(day,1),need:'Ubicar equipos y consultar el último servicio sin buscar entre archivos.',decision_maker:'Mariana Torres',budget:'Por confirmar',proposal_url:'',lost_reason:'',notes:'',archived:false}),
    meta({id:'demo-deal-2',company_id:'demo-empresa-2',title:'Clientes, impresoras y contratos',stage:'demo',amount_cents:420000,currency:'PEN',paid_cents:0,expected_close:addDays(day,10),closed_date:'',delivery_date:'',delivery_status:'pendiente',next_step:'Mostrar una ficha con el historial de una impresora',next_action_date:day,need:'Contratos y reportes de servicio están separados.',decision_maker:'Por identificar',budget:'Por confirmar',proposal_url:'',lost_reason:'',notes:'',archived:false}),
    meta({id:'demo-deal-3',company_id:'demo-empresa-5',title:'Primera etapa: equipos y documentos',stage:'ganada',amount_cents:520000,currency:'PEN',paid_cents:260000,expected_close:addDays(day,-3),closed_date:addDays(day,-3),delivery_date:addDays(day,15),delivery_status:'desarrollo',next_step:'Validar el primer prototipo',next_action_date:addDays(day,3),need:'Unir la información de cada alquiler.',decision_maker:'Dirección',budget:'Acordado',proposal_url:'',lost_reason:'',notes:'',archived:false}),
  ];
  data.tasks = [
    meta({id:'demo-tarea-1',title:'Enviar el alcance de la primera etapa',kind:'propuesta',company_id:'demo-empresa-1',deal_id:'demo-deal-1',due_date:addDays(day,-1),due_time:'10:00',duration:30,priority:'alta',status:'pendiente',notes:'Confirmar qué reportes necesitan consultar.',meeting_url:''}),
    meta({id:'demo-tarea-2',title:'Demo: historial de una impresora',kind:'reunion',company_id:'demo-empresa-2',deal_id:'demo-deal-2',due_date:day,due_time:'15:00',duration:45,priority:'alta',status:'pendiente',notes:'Empezar por su problema de contratos y mantenimiento.',meeting_url:''}),
    meta({id:'demo-tarea-3',title:'Identificar quién coordina los alquileres',kind:'llamada',company_id:'demo-empresa-3',deal_id:'',due_date:addDays(day,1),due_time:'09:30',duration:15,priority:'media',status:'pendiente',notes:'Preguntar cómo registran reservas y devoluciones.',meeting_url:''}),
  ];
  data.activities=[meta({id:'demo-nota-1',company_id:'demo-empresa-1',deal_id:'demo-deal-1',kind:'llamada',outcome:'conversacion',body:'Revisamos cómo consultan dónde está cada equipo. Solicitó una propuesta con un alcance inicial.',date:addDays(day,-2),time:'11:00'}),meta({id:'demo-nota-2',company_id:'demo-empresa-2',deal_id:'demo-deal-2',kind:'correo',outcome:'conversacion',body:'Confirmó interés en ver un ejemplo con impresoras, contratos y reportes.',date:addDays(day,-1),time:'16:00'})];
  data.payments=[meta({id:'demo-cobro-1',deal_id:'demo-deal-3',amount_cents:260000,date:addDays(day,-3),method:'Transferencia',reference:'Adelanto inicial · Demo',voided:false,void_reason:''})];
  data.milestones=[meta({id:'demo-hito-1',deal_id:'demo-deal-3',title:'Acordar alcance de la primera etapa',due_date:addDays(day,-2),done:true}),meta({id:'demo-hito-2',deal_id:'demo-deal-3',title:'Presentar el primer prototipo',due_date:addDays(day,5),done:false}),meta({id:'demo-hito-3',deal_id:'demo-deal-3',title:'Validar y entregar',due_date:addDays(day,15),done:false})];
  data.settings=[meta({...DEFAULT_SETTINGS,target_sales:3,target_amount_cents:1500000})];
  return data;
}
