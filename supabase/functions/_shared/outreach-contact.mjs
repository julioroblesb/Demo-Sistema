import {companyStage, today, localTime} from './crm/domain.js';
import {contactOperations} from './crm/prospecting.js';
import {OutboundError} from './whatsapp-core.mjs';

// Register provider-confirmed sends independently of sending them. Retrying this
// transaction must never call the provider or create a second contact activity.
export async function logOutboundContact(crm, {companyId, sendId, channel, body, sentAt}) {
  if (!['correo', 'whatsapp'].includes(channel)) throw new Error('Canal inválido.');
  const activityId = (channel === 'correo' ? 'mail-' : 'wa-') + sendId;
  const now = new Date(sentAt || Date.now());
  for (let attempt = 0; attempt < 3; attempt++) {
    const data = await crm.loadData();
    if (data.activities.some(row => row.id === activityId)) return;
    const company = data.companies.find(row => row.id === companyId);
    if (!company) throw new OutboundError('COMPANY_NOT_FOUND', 'No se encontró la empresa para registrar el contacto.', 404);
    // A late delivery records history without reopening a closed relationship.
    const operations = company.archived || companyStage(company, data) === 'perdida'
      ? [{type: 'activities', expected: 0, record: {
        kind: 'contacto', company_id: company.id, deal_id: '', channels: [channel],
        outcome: 'sin_respuesta', body, occurred_at: now.toISOString(), date: today(now), time: localTime(now)
      }}]
      : contactOperations(data, company, [channel], {body, now});
    const activity = operations.find(op => op.type === 'activities' && op.record.kind === 'contacto').record;
    activity.id = activityId;
    activity.outbound_id = sendId;
    try { await crm.commit(operations); return; } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}
