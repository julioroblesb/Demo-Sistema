export const ZONE = 'America/Lima';
export const TYPES = ['companies', 'contacts', 'deals', 'tasks', 'activities', 'payments', 'milestones', 'settings'];
export const COMPANY_STATUS = { nueva: 'Por investigar', investigada: 'Investigada', contactada: 'Contactada', conversacion: 'En conversación', calificada: 'Calificada', cliente: 'Cliente', no_encaja: 'No encaja', no_contactar: 'No contactar' };
// Keep stored legacy codes valid; simplify presentation without migrating live records.
export const SIMPLE_COMPANY_STATUS = { nueva: 'Filtrado', contactada: 'Contactado', conversacion: 'Seguimiento', cliente: 'Ganado', no_contactar: 'Perdido' };
export const companyStatusKey = status => ({investigada:'nueva',calificada:'conversacion',no_encaja:'no_contactar'}[status] || status);
export const companyStatusLabel = status => SIMPLE_COMPANY_STATUS[companyStatusKey(status)] || COMPANY_STATUS[status] || status;
export const SECTORS = ['Maquinaria y construcción', 'Impresoras y oficina', 'Tecnología y audiovisuales', 'Vehículos y transporte', 'Eventos y mobiliario', 'Herramientas', 'Equipos médicos', 'Inmuebles y espacios', 'Otros alquileres'];
// These five keys remain compatible with the installed PostgreSQL contract.
export const STAGES = { diagnostico: 'Filtrado', demo: 'Contactado', propuesta: 'Seguimiento', ganada: 'Ganado', perdida: 'Perdido' };
export const STAGE_HELP = { diagnostico: 'Las empresas que registras y todavía vas a contactar.', demo: 'Contacto guardado con sus canales, fecha y hora. Registra si respondieron.', propuesta: 'Organiza reuniones, cotizaciones, proformas, visitas y próximas acciones.', ganada: 'Acuerdo confirmado. Controla el importe, los cobros y la entrega.', perdida: 'Seguimiento cerrado. El motivo y la historia se conservan.' };
export const STAGE_STATUS = { diagnostico:'nueva', demo:'contactada', propuesta:'conversacion', ganada:'cliente', perdida:'no_contactar' };
export const CONTACT_CHANNELS = { correo:'Correo', whatsapp:'WhatsApp', llamada:'Llamada', instagram:'Instagram', facebook:'Facebook', linkedin:'LinkedIn', presencial:'Presencial', otro:'Otro canal' };
export const TASK_KINDS = { seguimiento: 'Seguimiento', llamada: 'Llamada', reunion: 'Reunión', cotizacion:'Cotización', proforma:'Proforma', visita:'Visita', correo: 'Correo', whatsapp: 'WhatsApp', propuesta: 'Propuesta', entrega: 'Entrega', otro: 'Otra tarea' };
export const PRIORITIES = { alta: 'Alta', media: 'Media', baja: 'Baja' };
export const DELIVERY = { pendiente: 'Por iniciar', desarrollo: 'En desarrollo', revision: 'En revisión', entregado: 'Entregado' };
export const DEFAULT_SETTINGS = { id: 'preferences', target_companies: 300, target_sales: 0, target_amount_cents: 0, currency: 'PEN', deadline: '', daily_contacts: 5, display_name: 'Julio', version: 0 };
export const emptyData = () => Object.fromEntries(TYPES.map(type => [type, []]));
export const id = () => crypto.randomUUID();
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function today(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function localTime(now = new Date()) { return new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(now); }
export function addDays(date, count) { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + count); return value.toISOString().slice(0, 10); }
export function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0,10) === value; }
export function dateLabel(value, options = {}) { if (!value) return 'Sin fecha'; return new Intl.DateTimeFormat('es-PE', { timeZone: ZONE, day: 'numeric', month: 'short', ...options }).format(new Date(value.length === 10 ? value + 'T12:00:00-05:00' : value)); }
export function dateTime(value) { return value ? new Intl.DateTimeFormat('es-PE', { timeZone: ZONE, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : ''; }
export function toCents(value) {
  const raw = String(value ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error('Escribe un monto positivo, con hasta dos decimales.');
  const [whole, decimal = ''] = raw.split('.'); const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents > 100_000_000_000) throw new Error('El monto excede el límite permitido.');
  return cents;
}
export const fromCents = value => (Number(value || 0) / 100).toFixed(2);
export const money = (value, currency = 'PEN') => new Intl.NumberFormat('es-PE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value || 0) / 100);
export const percent = (count, total) => total > 0 ? Math.min(100, Math.round(count / total * 100)) : 0;
export const isOpen = deal => !['ganada', 'perdida'].includes(deal.stage) && !deal.archived;
export const isPending = task => !['hecha', 'cancelada'].includes(task.status);
export function safeURL(value) {
  if (!value?.trim()) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(value.trim()) && !/^https?:/i.test(value.trim())) return '';
  try { const url = new URL(/^https?:\/\//i.test(value) ? value.trim() : `https://${value.trim()}`); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function websiteHost(value) { try { return new URL(safeURL(value)).hostname.replace(/^www\./, ''); } catch { return ''; } }
export function whatsapp(phone) { let digits = String(phone || '').replace(/\D/g, ''); if (/^9\d{8}$/.test(digits)) digits = '51' + digits; return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}` : ''; }
const normalizedPhone = value => {
  let digits=String(value||'').replace(/\D/g,'').replace(/^00/,'');
  if (/^9\d{8}$/.test(digits)) digits='51'+digits;
  return digits.length>=7?digits:'';
};
const normalizedName = value => normalize(value).replace(/[^a-z0-9]+/g,' ').trim();
export function companyDuplicates(candidate,companies,ignoreId='',contacts=[]) {
  const matches=[];
  for(const company of companies){
    if(company.id===ignoreId)continue;
    const fields=[],linked=contacts.filter(contact=>contact.company_id===company.id);
    const same=(key,label,normalizer,values=[company[key]])=>{const value=normalizer(candidate[key]);if(value&&values.some(other=>normalizer(other)===value))fields.push({key,label,value:candidate[key]});};
    same('ruc','RUC',value=>String(value||'').replace(/\D/g,''));
    same('name','Nombre',normalizedName);
    same('phone','Teléfono',normalizedPhone,[company.phone,...linked.map(contact=>contact.phone)]);
    same('email','Correo',value=>String(value||'').trim().toLowerCase(),[company.email,...linked.map(contact=>contact.email)]);
    // Different RUCs can legitimately share a group website.
    if(!(candidate.ruc&&company.ruc&&candidate.ruc!==company.ruc))same('website','Página web',websiteHost);
    if(fields.length)matches.push({company,fields});
  }
  return matches;
}
export function duplicateCompany(candidate,companies,ignoreId='',contacts=[]) {return companyDuplicates(candidate,companies,ignoreId,contacts)[0]?.company;}
export function matchesSearch(query,...records) {
  const needle=normalize(query);if(!needle)return true;
  const values=[];
  const collect=value=>{if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object'){for(const [key,item] of Object.entries(value))if(!['id','company_id','deal_id','owner_id','version','created_at','updated_at'].includes(key)){collect(item);if(key==='phone'&&normalizedPhone(item))values.push(normalizedPhone(item));}}else if(typeof value==='string'||typeof value==='number')values.push(String(value));};
  records.forEach(collect);
  if(/^[+\d\s().-]+$/.test(needle)){const digits=needle.replace(/\D/g,'');if(digits.length>=3&&values.some(value=>value.replace(/\D/g,'').includes(digits)))return true;}
  const haystack=normalize(values.join(' '));return needle.split(/\s+/).every(term=>haystack.includes(term));
}
export function companyMatchesSearch(query,company,data){return matchesSearch(query,company,companyStatusLabel(company.status),STAGES[companyStage(company,data)],...['contacts','activities','tasks','deals'].map(type=>(data[type]||[]).filter(row=>row.company_id===company.id)));}
export function dealStageKey(deal) {
  const row=typeof deal==='string'?{stage:deal}:deal;
  return row?.stage==='negociacion'||(row?.stage==='demo'&&row.pipeline_version!==2)?'propuesta':row?.stage;
}
export function activityTime(activity) {
  const value=activity.occurred_at||(['contacto','respuesta'].includes(activity.kind)?activity.created_at:'')||(activity.date?`${activity.date}T${activity.time||'12:00'}:00-05:00`:activity.created_at);
  return value&&!Number.isNaN(Date.parse(value))?new Date(value).toISOString():'';
}
export function contactHistory(companyId,data) {
  const rows=(data.activities||[]).filter(row=>row.company_id===companyId);
  const attempts=rows.filter(row=>row.kind==='contacto'||['correo','whatsapp','llamada','reunion','presencial'].includes(row.kind));
  attempts.sort((a,b)=>activityTime(b).localeCompare(activityTime(a)));
  const contact=attempts[0];if(!contact){const responses=rows.filter(row=>row.kind==='respuesta').sort((a,b)=>activityTime(b).localeCompare(activityTime(a)));return {contact:null,at:'',channels:[],response:responses[0]||null};}
  const at=activityTime(contact);
  // Old single-channel records saved at the same instant form one contact.
  const group=attempts.filter(row=>activityTime(row)===at);
  const channels=[...new Set(group.flatMap(row=>row.kind==='contacto'?row.channels||[]:[row.kind==='reunion'?'presencial':row.kind]))].filter(key=>CONTACT_CHANNELS[key]);
  const responses=rows.filter(row=>row.kind==='respuesta'&&(row.contact_id===contact.id||!row.contact_id&&activityTime(row)>=at));
  responses.push(...group.filter(row=>['conversacion','no_interes','no_contactar'].includes(row.outcome)));
  responses.sort((a,b)=>activityTime(b).localeCompare(activityTime(a)));
  return {contact,at,channels,response:responses[0]||null};
}
export function companyStage(company,data) {
  if(STAGES[company.pipeline_stage])return company.pipeline_stage;
  if(['no_contactar','no_encaja'].includes(company.status))return 'perdida';
  const deals=(data.deals||[]).filter(row=>row.company_id===company.id&&!row.archived);
  const open=deals.filter(isOpen);
  if(open.some(row=>dealStageKey(row)==='propuesta'))return 'propuesta';
  if(!open.length&&(deals.some(row=>row.stage==='ganada')||company.status==='cliente'))return 'ganada';
  if(!open.length&&deals.some(row=>row.stage==='perdida'))return 'perdida';
  if(['conversacion','calificada'].includes(company.status))return 'propuesta';
  const history=contactHistory(company.id,data);
  if(history.response?.outcome==='conversacion')return 'propuesta';
  if(history.response&&['no_interes','no_contactar'].includes(history.response.outcome))return 'perdida';
  if(history.contact||company.status==='contactada'||open.some(row=>dealStageKey(row)==='demo'))return 'demo';
  return 'diagnostico';
}
export function pipelineCompanies(data,query=''){
  return data.companies.filter(company=>!company.archived&&companyMatchesSearch(query,company,data));
}
export function paid(dealId, data) { return data.payments.filter(payment => payment.deal_id === dealId && !payment.voided).reduce((sum, payment) => sum + payment.amount_cents, 0); }
export function milestonesProgress(dealId, data) { const list = data.milestones.filter(item => item.deal_id === dealId && !item.archived); return { done: list.filter(item => item.done).length, total: list.length, percentage: percent(list.filter(item => item.done).length, list.length) }; }
export function metrics(data, currency = 'PEN', date = today()) {
  const companies = data.companies; const deals = data.deals.filter(deal => !deal.archived); const won = deals.filter(deal => deal.stage === 'ganada'); const lost = deals.filter(deal => deal.stage === 'perdida');
  const attempts = data.activities.filter(activity => ['contacto', 'llamada', 'whatsapp', 'correo', 'reunion'].includes(activity.kind));
  const contacts = new Set(attempts.map(activity => activity.company_id).filter(Boolean));
  const totalWon = won.filter(deal => deal.currency === currency).reduce((sum, deal) => sum + deal.amount_cents, 0);
  const totalPaid = data.payments.filter(payment => !payment.voided && won.some(deal => deal.id === payment.deal_id && deal.currency === currency)).reduce((sum, payment) => sum + payment.amount_cents, 0);
  return { registered: companies.length, contacted: contacts.size, conversations: new Set(data.activities.filter(activity => activity.outcome === 'conversacion').map(activity => activity.company_id)).size, won: won.length, lost: lost.length, open: deals.filter(isOpen).length, totalWon, totalPaid, outstanding: totalWon - totalPaid, pipeline: deals.filter(deal => isOpen(deal) && deal.currency === currency).reduce((sum, deal) => sum + deal.amount_cents, 0), overdue: data.tasks.filter(task => isPending(task) && task.due_date < date).length, dueToday: data.tasks.filter(task => isPending(task) && task.due_date === date).length, conversion: won.length + lost.length ? Math.round(won.length / (won.length + lost.length) * 100) : null };
}
export function calendarEvents(data) {
  return [
    ...data.tasks.filter(isPending).map(task => ({ id: task.id, source: 'task', type: task.kind === 'reunion' ? 'reunion' : 'tarea', date: task.due_date, time: task.due_time || '', title: task.title, company_id: task.company_id || '', deal_id: task.deal_id || '', duration: task.duration || 30 })),
    ...data.deals.filter(deal => isOpen(deal) && deal.expected_close).map(deal => ({ id: deal.id, source: 'deal', type: 'cierre', date: deal.expected_close, title: `Cierre: ${deal.title}`, company_id: deal.company_id, deal_id: deal.id, time: '' })),
    ...data.deals.filter(deal => deal.stage === 'ganada' && deal.delivery_date && deal.delivery_status !== 'entregado').map(deal => ({ id: deal.id, source: 'deal', type: 'entrega', date: deal.delivery_date, title: `Entrega: ${deal.title}`, company_id: deal.company_id, deal_id: deal.id, time: '' })),
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
export function validateRecord(type, record) {
  const required = (key, name) => { if (!String(record[key] ?? '').trim()) throw new Error(`Completa ${name}.`); };
  if (type === 'companies') {
    required('name', 'el nombre de la empresa');
    if (record.ruc && !/^\d{11}$/.test(record.ruc)) throw new Error('El RUC debe tener 11 dígitos. Puedes dejarlo vacío.');
    if (!COMPANY_STATUS[record.status]) throw new Error('Selecciona un estado válido.');
    if (record.pipeline_stage && !STAGES[record.pipeline_stage]) throw new Error('Selecciona una etapa válida del pipeline.');
  }
  if (type === 'contacts') { required('name', 'el nombre del contacto'); required('company_id', 'la empresa'); }
  if (['companies', 'contacts'].includes(type) && record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) throw new Error('Revisa el correo electrónico.');
  if (type === 'deals') {
    required('title', 'el nombre de la oportunidad'); required('company_id', 'la empresa');
    if (!['diagnostico','demo','propuesta','negociacion','ganada','perdida'].includes(record.stage)) throw new Error('Selecciona una etapa válida.');
    if (!['PEN', 'USD'].includes(record.currency)) throw new Error('Selecciona soles o dólares.');
    if (!Number.isSafeInteger(record.amount_cents) || record.amount_cents < 0) throw new Error('Revisa el importe de la oportunidad.');
    if (record.stage === 'ganada' && (!record.closed_date || record.amount_cents <= 0)) throw new Error('Para registrar una venta, indica un importe mayor a cero y su fecha de cierre.');
    if (record.stage === 'perdida' && !record.lost_reason?.trim()) throw new Error('Indica por qué se perdió la oportunidad.');
    if (record.stage === 'ganada' && record.delivery_date && record.closed_date && record.delivery_date < record.closed_date) throw new Error('La entrega debe ser el mismo día del cierre o después.');
  }
  if (type === 'tasks') { required('title', 'el título de la tarea'); required('due_date', 'la fecha de la tarea'); if (!['pendiente', 'progreso', 'hecha', 'cancelada'].includes(record.status)) throw new Error('Estado de tarea inválido.'); }
  if (type === 'activities') { required('body', 'el comentario o detalle'); required('company_id', 'la empresa');if(record.kind==='contacto'&&(!Array.isArray(record.channels)||!record.channels.length||record.channels.some(key=>!CONTACT_CHANNELS[key])))throw new Error('Elige al menos un canal de contacto.');if(['contacto','respuesta'].includes(record.kind)&&(!record.occurred_at||Number.isNaN(Date.parse(record.occurred_at))))throw new Error('No se pudo registrar la fecha y hora del contacto.'); }
  if (type === 'payments') { required('deal_id', 'la venta'); required('date', 'la fecha del cobro'); if (!Number.isSafeInteger(record.amount_cents) || record.amount_cents <= 0) throw new Error('El cobro debe ser mayor a cero.'); if (record.date > today()) throw new Error('Un cobro recibido no puede tener una fecha futura.'); }
  if (type === 'milestones') { required('title', 'el nombre del hito'); required('deal_id', 'la venta'); }
  if(type==='settings'&&(!Number.isInteger(record.target_companies)||record.target_companies<1||record.target_companies>100000||!Number.isInteger(record.daily_contacts)||record.daily_contacts<1||record.daily_contacts>300||!['PEN','USD'].includes(record.currency)))throw new Error('Revisa las metas y la moneda.');
  for(const key of ['name','title','next_step','body','notes'])if(record[key]&&String(record[key]).length>({name:180,title:220,next_step:300,body:12000,notes:10000}[key]))throw new Error('El texto de '+key+' supera la longitud permitida.');
  for (const key of ['due_date', 'expected_close', 'closed_date', 'delivery_date', 'date', 'deadline']) if (record[key] && !validDate(record[key])) throw new Error('Hay una fecha que no es válida.');
  if (record.due_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(record.due_time)) throw new Error('La hora no es válida.');
  for (const key of ['website', 'source_url', 'proposal_url', 'document_url', 'meeting_url']) if (record[key] && !safeURL(record[key])) throw new Error('Usa un enlace http o https válido.');
  return record;
}
export function initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase(); }
