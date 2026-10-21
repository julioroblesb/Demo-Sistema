import {companyStage,normalize,contactHistory} from './domain.js';
import {recipientChoices} from '../../integrations/outreach/whatsapp-domain.mjs';
export const CAMPAIGN_LABELS={preparing:'Preparando',queued:'En cola',paused:'Pausada',completed:'Terminada',cancelled:'Cancelada'};
export const DELIVERY_LABELS={pending:'Pendiente',sending:'Solicitando envío',queued:'En cola de WhatsApp',processing:'Procesando',sent:'Enviado',failed:'Con error',uncertain:'Por verificar',skipped:'Omitido',cancelled:'Cancelado'};
export const isCampaign=row=>row.category==='outreach_campaign';
export const isDelivery=row=>row.category==='outreach_delivery';
export const atOf=row=>row.occurred_at||(row.date?`${row.date}T${row.time||'00:00'}:00-05:00`:row.created_at||'');
export const channelsOf=row=>[...new Set([...(row.channels||[]),...(['correo','whatsapp'].includes(row.kind)?[row.kind]:[])])].filter(c=>['correo','whatsapp'].includes(c));
export function outreachFor(data,company){return [...data.activities.filter(row=>row.company_id===company.id&&channelsOf(row).length),...data.settings.filter(row=>isDelivery(row)&&row.company_id===company.id&&row.status==='sent').map(row=>({...row,kind:row.channel,occurred_at:row.sent_at}))];}
export function campaignRecipient(data,company){return {email:company.email||data.contacts.find(row=>row.company_id===company.id&&row.email)?.email||'',choice:recipientChoices(data,company)[0]};}
export function campaignCandidates(data,values,selected=new Set()){
 let rows=data.companies.filter(company=>!company.archived&&!['no_contactar','no_encaja'].includes(company.status)&&companyStage(company,data)!=='perdida');
 if(values.channel){const channels=values.channel==='ambos'?['correo','whatsapp']:[values.channel];rows=rows.filter(c=>!data.settings.some(j=>isDelivery(j)&&j.company_id===c.id&&channels.includes(j.channel)&&!['sent','failed','skipped','cancelled'].includes(j.status)));}
 if(values.scope==='seleccionadas')rows=rows.filter(c=>selected.has(c.id));
 if(values.contacted==='never')rows=rows.filter(c=>!contactHistory(c.id,data).contact&&!['contactada','conversacion','calificada','cliente'].includes(c.status));
 if(values.contacted==='contacted')rows=rows.filter(c=>!!contactHistory(c.id,data).contact||['contactada','conversacion','calificada','cliente'].includes(c.status));
 if(values.stage&&values.stage!=='all')rows=rows.filter(c=>companyStage(c,data)===values.stage);
 for(const key of ['city','district','sector'])if(values[key]&&values[key]!=='all')rows=rows.filter(c=>normalize(c[key]||'')===normalize(values[key]));
 if(values.region==='lima')rows=rows.filter(c=>normalize(c.city||'').includes('lima'));
 if(values.region==='provincias')rows=rows.filter(c=>c.city&&!normalize(c.city).includes('lima'));
 const has=(c,ch)=>outreachFor(data,c).some(a=>channelsOf(a).includes(ch));
 if(values.sent==='never')rows=rows.filter(c=>!outreachFor(data,c).length);
 if(values.sent==='email')rows=rows.filter(c=>has(c,'correo'));
 if(values.sent==='whatsapp')rows=rows.filter(c=>has(c,'whatsapp'));
 if(values.sent==='mixed')rows=rows.filter(c=>has(c,'correo')&&has(c,'whatsapp'));
 if(values.sent==='no_email')rows=rows.filter(c=>!has(c,'correo'));
 if(values.sent==='no_whatsapp')rows=rows.filter(c=>!has(c,'whatsapp'));
 if(values.last==='over_7'||values.last==='over_30'){const limit=Date.now()-(values.last==='over_7'?7:30)*86400000;rows=rows.filter(c=>{const latest=outreachFor(data,c).map(atOf).sort().at(-1);return !latest||Date.parse(latest)<limit;});}
 if(values.available&&values.available!=='all')rows=rows.filter(c=>{const r=campaignRecipient(data,c);return values.available==='correo'?r.email:values.available==='whatsapp'?r.choice?.phone:r.email&&r.choice?.phone;});
 rows.sort((a,b)=>{const order=String(a.created_at||a.id).localeCompare(String(b.created_at||b.id))||a.id.localeCompare(b.id);return values.order==='newest'?-order:order;});return rows;
}
export function campaignCounts(campaign,data){const jobs=data.settings.filter(j=>isDelivery(j)&&j.campaign_id===campaign.id),sent=jobs.filter(j=>j.status==='sent').length,errors=jobs.filter(j=>['failed','uncertain'].includes(j.status)).length,done=jobs.filter(j=>['sent','failed','uncertain','skipped','cancelled'].includes(j.status)).length;return {jobs,sent,errors,done,pending:jobs.length-done,total:jobs.length};}
