import { TYPES, escape, id, normalize, safeURL, COMPANY_STATUS, SECTORS, duplicateCompany, validateRecord, calendarEvents } from './domain.js';

export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/)[0];
  const countOutside = delimiter => { let count = 0, quoted = false; for (const char of firstLine) { if (char === '"') quoted = !quoted; if (!quoted && char === delimiter) count++; } return count; };
  const delimiter = countOutside(';') > countOutside(',') ? ';' : ',';
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (char === delimiter && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (quoted) throw new Error('El CSV tiene comillas sin cerrar. Revisa el archivo.');
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('El archivo debe contener encabezados y al menos una empresa.');
  if (rows.length > 5001) throw new Error('Importa hasta 5 000 empresas por archivo.');
  const aliases = { empresa: 'name', nombre: 'name', name: 'name', razon_social: 'name', ruc: 'ruc', categoria: 'sector', sector: 'sector', rubro: 'sector', ciudad: 'city', city: 'city', distrito: 'district', direccion: 'address', address: 'address', web: 'website', website: 'website', sitio_web: 'website', telefono: 'phone', phone: 'phone', correo: 'email', email: 'email', fuente: 'source_url', fuente_url: 'source_url', source_url: 'source_url', estado: 'status', status: 'status', prioridad: 'priority', priority: 'priority', necesidad: 'need', need: 'need', contacto: 'contact_name', contact_name: 'contact_name', cargo: 'contact_role', notas: 'notes' };
  const headers = rows[0].map(value => aliases[normalize(value).replace(/[ -]/g, '_')] || '');
  if (!headers.includes('name')) throw new Error('Falta una columna «empresa» o «nombre». Descarga la plantilla.');
  return rows.slice(1).map((cells, index) => ({ line: index + 2, raw: Object.fromEntries(headers.filter(Boolean).map(key => [key, cells[headers.indexOf(key)]?.trim() || ''])) }));
}
export function prepareCompanyImport(rows, existing) {
  const accepted = [], duplicates = [], errors = [];
  for (const { line, raw } of rows) {
    const sector = SECTORS.find(value => normalize(value) === normalize(raw.sector)) || raw.sector || 'Otros alquileres';
    const status = Object.keys(COMPANY_STATUS).find(key => key === normalize(raw.status) || normalize(COMPANY_STATUS[key]) === normalize(raw.status)) || 'nueva';
    const company = { id: id(), name: raw.name || '', ruc: raw.ruc || '', sector, city: raw.city || 'Lima', district: raw.district || '', address: raw.address || '', website: raw.website ? safeURL(raw.website) : '', phone: raw.phone || '', email: raw.email || '', source_url: raw.source_url ? safeURL(raw.source_url) : '', source: 'Investigación en internet', status, priority: ['alta', 'media', 'baja'].includes(normalize(raw.priority)) ? normalize(raw.priority) : 'media', need: raw.need || '', notes: raw.notes || '', researched_at: '', archived: false };
    try {
      if (raw.website && !company.website || raw.source_url && !company.source_url) throw new Error('Revisa el enlace web o la fuente.');
      validateRecord('companies', company);
      const duplicate = duplicateCompany(company, [...existing, ...accepted.map(item => item.company)]);
      if (duplicate) duplicates.push({ line, name: company.name, reason: `Ya existe «${duplicate.name}».` });
      else accepted.push({ line, company, contact: raw.contact_name ? { id: id(), company_id: company.id, name: raw.contact_name, role: raw.contact_role || '', phone: company.phone, email: company.email, decision_maker: false } : null });
    } catch (error) { errors.push({ line, name: company.name, reason: error.message }); }
  }
  return { accepted, duplicates, errors };
}
export const csvCell = value => '"' + (/^[=+\-@\t\r]/.test(String(value ?? '')) ? "'" : '') + String(value ?? '').replace(/"/g, '""') + '"';
export function toCSV(rows, fields) { return '\uFEFF' + [fields.map(field => csvCell(field.label)).join(','), ...rows.map(row => fields.map(field => csvCell(typeof field.value === 'function' ? field.value(row) : row[field.value])).join(','))].join('\r\n'); }
export function download(name, content, type = 'text/plain;charset=utf-8') { const link = document.createElement('a'); const url = URL.createObjectURL(new Blob([content], { type })); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000); }
export function backup(data) { return JSON.stringify({ app: 'nexo-crm', schema: 1, exported_at: new Date().toISOString(), data }, null, 2); }
export function parseBackup(text) {
  let value; try { value = JSON.parse(text); } catch { throw new Error('El respaldo no es un JSON válido.'); }
  if (value.app !== 'nexo-crm' || value.schema !== 1 || !value.data) throw new Error('Este archivo no es un respaldo compatible de Nexo CRM.');
  const data = Object.fromEntries(TYPES.map(type => [type, value.data[type] || []]));
  for (const type of TYPES) {
    if (!Array.isArray(data[type]) || data[type].length > 20000) throw new Error('El respaldo contiene una colección inválida o demasiado grande.');
    const seen = new Set();
    for (const row of data[type]) {
      if (!row || typeof row !== 'object' || !/^[a-zA-Z0-9_-]{1,100}$/.test(row.id) || seen.has(row.id)) throw new Error('El respaldo tiene identificadores inválidos o repetidos.');
      seen.add(row.id); validateRecord(type, row);
    }
  }
  const hasCompany = id => data.companies.some(row => row.id === id);
  const hasDeal = id => data.deals.some(row => row.id === id);
  for (const type of ['contacts','deals','activities']) for (const row of data[type]) if (!hasCompany(row.company_id)) throw new Error('El respaldo tiene registros sin su empresa.');
  for (const row of data.tasks) if (row.company_id && !hasCompany(row.company_id) || row.deal_id && !hasDeal(row.deal_id)) throw new Error('El respaldo tiene tareas con relaciones incompletas.');
  for (const type of ['payments','milestones']) for (const row of data[type]) if (!hasDeal(row.deal_id)) throw new Error('El respaldo tiene cobros o hitos sin su venta.');
  return data;
}
function icsEscape(text) { return String(text).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
function fold(line) { let result = '', chunk = ''; const encoder = new TextEncoder(); for (const char of line) { if (encoder.encode(chunk + char).length > 73) { result += chunk + '\r\n '; chunk = ''; } chunk += char; } return result + chunk; }
export function toICS(data) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nexo//CRM//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Nexo — agenda comercial', 'X-WR-TIMEZONE:America/Lima'];
  const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z');
  for (const event of calendarEvents(data)) {
    lines.push('BEGIN:VEVENT', `UID:${event.source}-${event.type}-${event.id}@nexoamedida.com`, `DTSTAMP:${stamp}`, `SUMMARY:${icsEscape(event.title)}`);
    if (event.time) {
      const start = new Date(`${event.date}T${event.time}:00-05:00`); const end = new Date(start.getTime() + (event.duration || 30) * 60_000);
      const format = date => date.toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z');
      lines.push(`DTSTART:${format(start)}`, `DTEND:${format(end)}`);
    } else lines.push(`DTSTART;VALUE=DATE:${event.date.replace(/-/g,'')}`);
    const company = data.companies.find(company => company.id === event.company_id);
    lines.push(`DESCRIPTION:${icsEscape([company?.name, 'Hora de Lima. Evento exportado desde Nexo CRM.'].filter(Boolean).join(' — '))}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR'); return lines.map(fold).join('\r\n') + '\r\n';
}
export const companyCSVFields = [ {label:'empresa',value:'name'},{label:'ruc',value:'ruc'},{label:'categoria',value:'sector'},{label:'ciudad',value:'city'},{label:'distrito',value:'district'},{label:'web',value:'website'},{label:'telefono',value:'phone'},{label:'correo',value:'email'},{label:'fuente_url',value:'source_url'},{label:'estado',value:'status'},{label:'prioridad',value:'priority'},{label:'necesidad',value:'need'} ];
