import {id,today,localTime,STAGES,STAGE_STATUS,CONTACT_CHANNELS,companyStage,contactHistory,isOpen,isPending} from './domain.js';

const op=(type,record)=>({type,record,expected:record.version||0});
const stamp=now=>({occurred_at:now.toISOString(),date:today(now),time:localTime(now)});
const companyUpdate=(company,stage)=>({...company,status:STAGE_STATUS[stage],pipeline_stage:stage});
const log=(company,body,now)=>op('activities',{id:id(),company_id:company.id,deal_id:'',kind:'sistema',outcome:'comentario',body,...stamp(now)});
const assertSize=operations=>{if(operations.length>180)throw new Error('Esta empresa tiene demasiadas tareas vinculadas para cerrar todo de una vez. Reduce las tareas pendientes antes de volver a intentarlo.');return operations;};

// All writes are submitted in one existing crm_commit transaction.
export function stageOperations(data,company,stage,{reason='',now=new Date(),allowContact=false}={}) {
 if(!STAGES[stage])throw new Error('Elige una etapa válida.');
 if(stage==='demo'&&!allowContact)throw new Error('Registra los canales antes de pasar a Contactado.');
 if(stage==='ganada')throw new Error('Registra el importe y la fecha para confirmar una venta ganada.');
 if(stage==='perdida'&&!reason.trim())throw new Error('Indica el motivo del cierre.');
 const operations=[op('companies',companyUpdate(company,stage))];
 const open=data.deals.filter(deal=>deal.company_id===company.id&&isOpen(deal));
 for(const deal of open)operations.push(op('deals',{...deal,stage,pipeline_version:2,closed_date:stage==='perdida'?today(now):'',lost_reason:stage==='perdida'?reason.trim():'',next_step:stage==='perdida'?'':deal.next_step||'',next_action_date:stage==='perdida'?'':deal.next_action_date||''}));
 if(stage==='perdida'){
  // Preserve tasks belonging to completed sales: their deliveries are still owed.
  for(const task of data.tasks.filter(task=>task.company_id===company.id&&isPending(task))){
   const deal=data.deals.find(deal=>deal.id===task.deal_id);
   if(deal?.stage==='ganada'||task.kind==='entrega')continue;
   operations.push(op('tasks',{...task,status:'cancelada',cancel_reason:reason.trim()}));
  }
 }
 operations.push(log(company,`${STAGES[stage]}${reason?': '+reason.trim():''}`,now));
 return assertSize(operations);
}

export function contactOperations(data,company,channels,{body='',move=false,allowReopen=false,now=new Date()}={}) {
 if(!Array.isArray(channels)||channels.some(key=>!CONTACT_CHANNELS[key]))throw new Error('Revisa los canales seleccionados.');
 const chosen=Object.keys(CONTACT_CHANNELS).filter(key=>channels.includes(key));
 if(!chosen.length)throw new Error('Elige al menos un canal de contacto.');
 const current=companyStage(company,data);
 if(current==='perdida'&&!allowReopen)throw new Error('El seguimiento está cerrado. Reabre la empresa antes de contactarla.');
 const stage=move||current==='diagnostico'?'demo':current;
 let operations;
 if(stage!==current||move)operations=stageOperations(data,company,stage,{allowContact:true,now});
 else operations=[op('companies',companyUpdate(company,stage))];
 const contact={id:id(),company_id:company.id,deal_id:'',kind:'contacto',channels:chosen,outcome:'sin_respuesta',body:body.trim()||`Contacto realizado por ${chosen.map(key=>CONTACT_CHANNELS[key]).join(' y ')}.`,...stamp(now)};
 operations.push(op('activities',contact));
 return assertSize(operations);
}

export function responseOperations(data,company,outcome,{body='',contactId='',now=new Date()}={}) {
 if(!['conversacion','no_interes'].includes(outcome))throw new Error('Elige una respuesta positiva o negativa.');
 const history=contactHistory(company.id,data);
 if(!history.contact&&!['demo','propuesta'].includes(companyStage(company,data)))throw new Error('Registra primero el contacto y sus canales.');
 if(contactId&&history.contact?.id!==contactId)throw new Error('Se registró otro contacto desde otro dispositivo. Revisa el contacto más reciente antes de guardar la respuesta.');
 const positive=outcome==='conversacion';
 const stage=companyStage(company,data);
 if(['ganada','perdida'].includes(stage))throw new Error('La empresa ya está cerrada. Revisa su ficha antes de registrar otra respuesta.');
 const reason=body.trim()||'Respuesta negativa: no tiene interés en continuar.';
 const operations=stageOperations(data,company,positive?'propuesta':'perdida',{reason:positive?'':reason,now});
 operations.push(op('activities',{id:id(),company_id:company.id,deal_id:'',kind:'respuesta',contact_id:history.contact?.id||'',outcome,body:positive?(body.trim()||'Respuesta positiva. Continuar el seguimiento.'):reason,...stamp(now)}));
 return assertSize(operations);
}

export function saleCompanyOperation(company){return op('companies',companyUpdate(company,'ganada'));}
