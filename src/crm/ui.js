import { escape as e, initials, money, dateLabel, dateTime, CONTACT_CHANNELS, contactHistory, dealStageKey, COMPANY_STATUS, companyStatusLabel, PRIORITIES, STAGES, TASK_KINDS, isPending, today } from './domain.js';
const paths = {
 home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
 companies:'M4 21V5l8-3v19m0-14h8v14M7 7v1m0 3v1m0 3v1m9-5v1m0 3v1M2 21h20',
 pipeline:'M3 3v18h18M6 15h4v3H6zm5-5h4v8h-4zm5-5h4v13h-4z',
 calendar:'M4 5h16v16H4zM7 3v4m10-4v4M4 10h16m-12 4h1m3 0h1m3 0h1m-9 4h1m3 0h1',
 tasks:'M9 6h12M9 12h12M9 18h12M3 6l1 1 2-3M3 12l1 1 2-3M3 18l1 1 2-3',
 sales:'M3 8h18v13H3zM7 8V5h10v3M3 12h18m-11 0v3h4v-3',
 reports:'M4 3h12l4 4v14H4zM8 17v-3m4 3v-6m4 6v-9',
 settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 plus:'M12 5v14M5 12h14', search:'M21 21l-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
 arrow:'M5 12h14m-6-6 6 6-6 6', diagonal:'M7 17 17 7M7 7h10v10', chevron:'m9 5 7 7-7 7', left:'m15 5-7 7 7 7',
 check:'m5 12 4 4L19 6', send:'M22 2 11 13M22 2l-7 20-4-9-9-4z', download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
 close:'m6 6 12 12M6 18 18 6', more:'M5 12h.01M12 12h.01M19 12h.01', menu:'M4 6h16M4 12h16M4 18h16',
 clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', mail:'M3 5h18v14H3zM3 5l9 8 9-8',
 phone:'M7 3 3 5c0 9 7 16 16 16l2-4-5-3-2 2c-3-1-5-3-6-6l2-2z', chat:'M21 11a8 8 0 0 1-8 8H6l-4 3 1-6a8 8 0 1 1 18-5',
 note:'M4 3h16v18H4zM8 8h8m-8 4h8m-8 4h5', edit:'m15 4 5 5M4 20l4-1L21 6l-4-4L4 15z',
 refresh:'M20 7a8 8 0 1 0 1 8M20 3v5h-5', logout:'M9 3H3v18h6m6-15 6 6-6 6m-7-6h13',
 target:'M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5 9-9m-5 0h5v5', lock:'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4m-4 5v2',
 alert:'m12 3 10 18H2zM12 9v4m0 4h.01', archive:'M3 3h18v5H3zm2 5v13h14V8m-10 4h6', link:'m9 15 6-6m-7 3-3 3a4 4 0 0 0 6 6l3-3m-4-12 3-3a4 4 0 0 1 6 6l-3 3',
 user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3', flag:'M5 21V3m0 1h13l-3 5 3 5H5', print:'M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6z', book:'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zm9 2v15',
};
export const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.note}"/></svg>`;
export const action = (label, name, options = {}) => `<button type="button" class="${options.class || 'button secondary'}" data-action="${name}"${options.id ? ` data-id="${e(options.id)}"` : ''}${options.type ? ` data-type="${e(options.type)}"` : ''}${options.extra || ''}>${options.icon ? icon(options.icon) : ''}${label}</button>`;
export const badge = (label, tone = '') => `<span class="badge ${tone}">${e(label)}</span>`;
export const companyStatus = status => badge(companyStatusLabel(status), ['cliente','calificada','conversacion'].includes(status) ? 'green' : status === 'no_contactar' ? 'red' : '');
export const stageBadge = stage => {const key=typeof stage==='string'?(stage==='negociacion'?'propuesta':stage):dealStageKey(stage);return `<span class="badge pipeline-stage-badge stage-${e(key)}">${e(STAGES[key]||'Filtrado')}</span>`;};
export function contactSummary(company,data) {
  const history=contactHistory(company.id,data);
  const positive=history.response?.outcome==='conversacion';
  const response=history.response?`<span class="response-state ${positive?'positive':'negative'}">${positive?'Respuesta positiva':'Respuesta negativa'}</span>`:'';
  if(!history.contact)return `<div class="contact-summary no-contact"><span>${['contactada','conversacion','calificada'].includes(company.status)?'Contacto anterior sin fecha registrada':'Sin contacto registrado'}</span>${response}</div>`;
  return `<div class="contact-summary contacted"><div class="contact-summary-title">${icon('check')}<strong>Último contacto</strong></div><time datetime="${e(history.at)}">${dateTime(history.at)||'Fecha no registrada'}</time><div class="contact-channel-list">${history.channels.map(key=>`<span>${e(CONTACT_CHANNELS[key])}</span>`).join('')||'<span>Canal no registrado</span>'}</div>${response||'<span class="response-state waiting">Sin respuesta registrada</span>'}</div>`;
}
export const priorityBadge = priority => `<span class="priority ${e(priority)}"><i aria-hidden="true"></i>${PRIORITIES[priority] || 'Media'}</span>`;
export const avatar = (name, size = '') => `<span class="company-avatar ${size}">${e(initials(name || 'Nexo'))}</span>`;
export function options(values, selected = '', empty = '') { const list = Array.isArray(values) ? values.map(value => [value, value]) : Object.entries(values); return (empty ? `<option value="">${e(empty)}</option>` : '') + list.map(([value,label]) => `<option value="${e(value)}"${String(value) === String(selected) ? ' selected' : ''}>${e(label)}</option>`).join(''); }
export function field(name, label, value = '', attrs = '') { return `<div class="field"><label for="field-${name}">${label}</label><input id="field-${name}" name="${name}" value="${e(value)}" ${attrs}></div>`; }
export function select(name, label, values, value = '', empty = '', attrs = '') { return `<div class="field"><label for="field-${name}">${label}</label><select id="field-${name}" name="${name}" ${attrs}>${options(values,value,empty)}</select></div>`; }
export function textarea(name, label, value = '', attrs = '') { return `<div class="field"><label for="field-${name}">${label}</label><textarea id="field-${name}" name="${name}" rows="3" ${attrs}>${e(value)}</textarea></div>`; }
export function empty(title, detail, controls = '', symbol = 'companies') { return `<div class="empty-state"><span class="empty-symbol">${icon(symbol)}</span><h3>${title}</h3><p>${detail}</p><div class="empty-actions">${controls}</div></div>`; }
export function sectionHeading(title, detail, controls = '') { return `<div class="section-heading"><div><h2>${title}</h2>${detail ? `<p>${detail}</p>` : ''}</div><div class="heading-actions">${controls}</div></div>`; }
export function taskRow(task, data, compact = false) {
  const company = data.companies.find(company => company.id === task.company_id);
  const late = isPending(task) && task.due_date < today();
  return `<div class="task-row ${!isPending(task) ? 'done' : ''}"><button type="button" class="task-check" data-action="toggle-task" data-id="${task.id}" aria-label="${isPending(task) ? 'Completar' : 'Reabrir'}: ${e(task.title)}" aria-pressed="${!isPending(task)}">${!isPending(task) ? icon('check') : ''}</button><button type="button" class="task-text" data-action="edit-task" data-id="${task.id}"><strong>${e(task.title)}</strong><span>${e(company?.name || 'Sin empresa')} ${compact ? '' : '· ' + TASK_KINDS[task.kind]}</span></button><div class="task-meta">${!compact ? priorityBadge(task.priority) : ''}<span class="${late ? 'overdue' : ''}">${task.due_date === today() ? 'Hoy' : dateLabel(task.due_date)}${task.due_time ? ' · ' + task.due_time : ''}</span></div></div>`;
}
export const progress = (value, total, label, className = '') => `<div class="progress-track ${className}" role="progressbar" aria-label="${e(label)}" aria-valuemin="0" aria-valuemax="${Math.max(total,1)}" aria-valuenow="${Math.min(value,Math.max(total,1))}" aria-valuetext="${value} de ${total}"><span style="width:${total ? Math.min(100,value/total*100) : 0}%"></span></div>`;

// Detail navigation is one component, independent of action-button defaults.
const detailId=(kind,recordId,key,part)=>`detail-${kind}-${recordId}-${key}-${part}`;
export function detailTabs(kind,recordId,items,selected) {
  return `<div class="detail-tabs" role="tablist" aria-label="${kind==='company'?'Información de empresa':'Información de oportunidad'}">${Object.entries(items).map(([key,item])=>`<button type="button" class="detail-tab${selected===key?' selected':''}" role="tab" id="${e(detailId(kind,recordId,key,'tab'))}" aria-selected="${selected===key}" aria-controls="${e(detailId(kind,recordId,key,'panel'))}" tabindex="${selected===key?'0':'-1'}" data-action="${kind}-tab" data-id="${e(recordId)}" data-type="${e(key)}"><span class="detail-tab-label">${e(item.label)}</span>${Number.isInteger(item.count)?`<span class="detail-tab-count">${item.count}</span>`:''}</button>`).join('')}</div>`;
}
export function detailPanels(kind,recordId,items,selected,body) {
  return Object.keys(items).map(key=>`<section class="detail-body" role="tabpanel" id="${e(detailId(kind,recordId,key,'panel'))}" aria-labelledby="${e(detailId(kind,recordId,key,'tab'))}" tabindex="0"${selected===key?'':' hidden'}>${selected===key?body:''}</section>`).join('');
}
