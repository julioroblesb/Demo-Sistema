import ExcelJS from 'exceljs';
import {STAGES, PRIORITIES, CONTACT_CHANNELS, TASK_KINDS, companyStage, dealStageKey, contactHistory} from './domain.js';
import {DELIVERY_LABELS, isDelivery} from './campaigns.js';

export const EXCEL_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const yes = value => value ? 'Sí' : 'No';
const channels = values => (values || []).map(value => CONTACT_CHANNELS[value] || value).join(', ');
const outcomes = {comentario:'Comentario', sin_respuesta:'Sin respuesta', conversacion:'Respuesta positiva', no_interes:'Sin interés', no_contactar:'No contactar'};
const lima = new Intl.DateTimeFormat('es-PE', {timeZone:'America/Lima', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
function dateTime(value) {
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)) return value || '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : lima.format(date);
}

// ExcelJS stores strings as text cells, preserving RUCs, leading zeros, phone
// prefixes and text that begins with '=' without interpreting it as a formula.
export async function createCompaniesExcel(data) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nexo';
  workbook.subject = 'Empresas y seguimiento comercial';
  const companyNames = new Map(data.companies.map(row => [row.id, row.name]));
  const dealNames = new Map(data.deals.map(row => [row.id, row.title]));
  const companyFor = row => companyNames.get(row.company_id) || '';
  const contactsFor = company => data.contacts.filter(row => row.company_id === company.id);

  function sheet(name, headers, rows) {
    const worksheet = workbook.addWorksheet(name, {views:[{state:'frozen', ySplit:1}]});
    worksheet.columns = headers.map(header => ({header, width: Math.min(42, Math.max(20, header.length + 3)), style:{numFmt:'@', alignment:{vertical:'top', wrapText:true}}}));
    for (const values of rows) worksheet.addRow(values.map(value => value == null ? '' : String(value)));
    worksheet.autoFilter = {from:{row:1, column:1}, to:{row:1, column:headers.length}};
    const heading = worksheet.getRow(1);
    heading.height = 32;
    heading.eachCell(cell => {
      cell.font = {name:'Calibri', size:11, bold:true, color:{argb:'FFFFFFFF'}};
      cell.fill = {type:'pattern', pattern:'solid', fgColor:{argb:'FF247459'}};
    });
    return worksheet;
  }

  sheet('Empresas', [
    'Empresa','RUC','Rubro / qué alquila','Teléfono','Correo','Página web','Ciudad / provincia','Distrito','Dirección',
    'Etapa','Prioridad','Necesidad o problema','Notas de investigación','Origen','Enlace de la fuente','Fecha de investigación',
    'Archivada','Personas de contacto','Teléfonos de contactos','Correos de contactos','Último contacto (Lima)',
    'Canales del último contacto','Última respuesta','Fecha de la respuesta (Lima)','Registro creado (Lima)','Última actualización (Lima)'
  ], data.companies.map(company => {
    const contacts = contactsFor(company), history = contactHistory(company.id, data);
    return [company.name, company.ruc, company.sector, company.phone, company.email, company.website, company.city, company.district, company.address,
      STAGES[companyStage(company, data)], PRIORITIES[company.priority] || company.priority, company.need, company.notes, company.source, company.source_url, dateTime(company.researched_at),
      yes(company.archived), contacts.map(row => row.name).join('\n'), contacts.map(row => row.phone).filter(Boolean).join('\n'), contacts.map(row => row.email).filter(Boolean).join('\n'),
      dateTime(history.at), channels(history.channels), outcomes[history.response?.outcome] || history.response?.outcome, dateTime(history.response?.occurred_at || (history.response?.date ? `${history.response.date}T${history.response.time || '00:00'}:00-05:00` : '')),
      dateTime(company.created_at), dateTime(company.updated_at)];
  }));

  sheet('Contactos', ['Empresa','Nombre del contacto','Cargo o área','Teléfono / WhatsApp','Correo','Participa en la decisión','Notas'],
    data.contacts.map(row => [companyFor(row), row.name, row.role, row.phone, row.email, yes(row.decision_maker), row.notes]));

  sheet('Actividad', ['Empresa','Oportunidad','Tipo','Canales','Resultado','Comentario o mensaje','Fecha','Hora de Lima','Instante registrado (Lima)'],
    data.activities.map(row => [companyFor(row), dealNames.get(row.deal_id), ({nota:'Comentario', contacto:'Contacto realizado', respuesta:'Respuesta recibida', sistema:'Cambio registrado'})[row.kind] || TASK_KINDS[row.kind] || row.kind,
      channels(row.channels || (CONTACT_CHANNELS[row.kind] ? [row.kind] : [])), outcomes[row.outcome] || row.outcome, row.body, row.date, row.time, dateTime(row.occurred_at)]));

  sheet('Tareas', ['Empresa','Oportunidad','Tarea','Tipo','Fecha','Hora de Lima','Duración (minutos)','Prioridad','Estado','Enlace de reunión','Notas'],
    data.tasks.map(row => [companyFor(row) || companyNames.get(data.deals.find(deal => deal.id === row.deal_id)?.company_id), dealNames.get(row.deal_id), row.title, TASK_KINDS[row.kind] || row.kind,
      row.due_date, row.due_time, row.duration, PRIORITIES[row.priority] || row.priority, ({pendiente:'Pendiente', progreso:'En progreso', hecha:'Completada', cancelada:'Cancelada'})[row.status] || row.status, row.meeting_url, row.notes]));

  sheet('Oportunidades', ['Empresa','Oportunidad','Etapa','Moneda','Importe acordado','Cierre esperado','Fecha de cierre','Fecha de entrega','Estado de entrega','Próximo paso','Fecha del próximo paso','Necesidad','Responsable de decisión','Presupuesto','Enlace de propuesta','Motivo de pérdida','Notas','Archivada'],
    data.deals.map(row => [companyFor(row), row.title, STAGES[dealStageKey(row)] || row.stage, row.currency, row.amount_cents == null ? '' : (row.amount_cents / 100).toFixed(2), row.expected_close, row.closed_date, row.delivery_date, row.delivery_status,
      row.next_step, row.next_action_date, row.need, row.decision_maker, row.budget, row.proposal_url, row.lost_reason, row.notes, yes(row.archived)]));

  const campaigns = new Map(data.settings.filter(row => row.category === 'outreach_campaign').map(row => [row.id, row.name]));
  sheet('Envíos de campañas', ['Empresa','Campaña','Canal','Destinatario','Estado','Mensaje de WhatsApp','Fecha de envío (Lima)','Fecha de creación (Lima)','Detalle del error'],
    data.settings.filter(isDelivery).map(row => [companyFor(row), campaigns.get(row.campaign_id), CONTACT_CHANNELS[row.channel] || row.channel, row.recipient,
      DELIVERY_LABELS[row.status] || row.status, row.caption, dateTime(row.sent_at), dateTime(row.created_at), row.error]));

  return workbook.xlsx.writeBuffer();
}
