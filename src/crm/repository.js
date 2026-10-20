import { TYPES, emptyData, validateRecord } from './domain.js';
import { seedDemo } from './demo.js';
export const DEMO_KEY = 'nexo-crm-demo-v1';
export const CONFIG_KEY = 'nexo-crm-connection-v1';
const clone = value => structuredClone(value);
export class ConflictError extends Error { constructor() { super('Este registro cambió en otro dispositivo. Cierra y vuelve a abrir la ficha antes de guardar; tu cambio aún no se ha enviado.'); this.name = 'ConflictError'; } }
export function checkOperations(data, operations) {
  const next = clone(data);
  for (const operation of operations) {
    if (!TYPES.includes(operation.type)) throw new Error('Tipo de registro inválido.');
    validateRecord(operation.type, operation.record);
    const list = next[operation.type], existing = list.find(row => row.id === operation.record.id);
    if (operation.expected !== undefined && (existing?.version || 0) !== operation.expected) throw new ConflictError();
    if (existing) list[list.findIndex(row => row.id === existing.id)] = operation.record; else list.push(operation.record);
  }
  for (const op of operations) {
    const row = op.record;
    if (row.company_id && !next.companies.some(company => company.id === row.company_id)) throw new Error('La empresa vinculada no está disponible.');
    if (row.deal_id && !next.deals.some(deal => deal.id === row.deal_id)) throw new Error('La oportunidad vinculada no está disponible.');
    if (row.deal_id && row.company_id) { const deal = next.deals.find(deal => deal.id === row.deal_id); if (deal.company_id !== row.company_id) throw new Error('La oportunidad pertenece a otra empresa.'); }
  }
  for (const deal of next.deals) {
    const paid = next.payments.filter(row => row.deal_id === deal.id && !row.voided).reduce((sum, row) => sum + row.amount_cents, 0);
    if (paid > deal.amount_cents) throw new Error('El total cobrado no puede superar el importe de la venta.');
    if (paid && deal.stage !== 'ganada') throw new Error('Esta oportunidad ya tiene cobros. Conserva la venta ganada o anula primero esos cobros.');
    if (next.payments.some(row => row.deal_id === deal.id) && (deal.paid_cents || 0) !== paid) throw new Error('El saldo cambió. Actualiza la ficha y vuelve a registrar el movimiento.');
  }
  return next;
}
export class DemoRepository {
  constructor(onChange) { this.onChange = onChange; this.storageListener = event => { if (event.key === DEMO_KEY) this.emit(); }; addEventListener('storage', this.storageListener); }
  read() { const value = localStorage.getItem(DEMO_KEY); if (!value) { const seed = seedDemo(); localStorage.setItem(DEMO_KEY, JSON.stringify(seed)); return seed; } try { const data = JSON.parse(value); return { ...emptyData(), ...data }; } catch { throw new Error('No se pudieron leer los datos de prueba. Puedes restablecerlos desde Ajustes.'); } }
  async start() { this.emit(); }
  emit() { this.onChange(clone(this.read()), { ready: true, connected: true, demo: true }); }
  async commit(operations) {
    const current = this.read(); const next = checkOperations(current, operations); const now = new Date().toISOString();
    for (const { type, record } of operations) {
      const previous = current[type].find(row => row.id === record.id);
      const stored = { ...record, version: (previous?.version || 0) + 1, created_at: previous?.created_at || now, updated_at: now };
      next[type][next[type].findIndex(row => row.id === record.id)] = stored;
    }
    localStorage.setItem(DEMO_KEY, JSON.stringify(next)); this.emit();
  }
  async reset() { localStorage.setItem(DEMO_KEY, JSON.stringify(seedDemo())); this.emit(); }
  stop() { removeEventListener('storage', this.storageListener); }
}
export function parseConnection(text) {
  if (/private_key|service_role|sb_secret_|BEGIN PRIVATE KEY|postgresql:\/\//i.test(text)) throw new Error('Esta es una credencial administrativa. Usa solo la URL y la clave publishable de Supabase.');
  let value; try { value=JSON.parse(text); } catch { throw new Error('Pega la configuración JSON completa.'); }
  const url=String(value.url||'').replace(/\/$/,''), publishableKey=String(value.publishableKey||'');
  if (!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url)) throw new Error('Revisa la URL del proyecto Supabase.');
  if (!/^sb_publishable_[A-Za-z0-9_-]{15,}$/.test(publishableKey)) throw new Error('Usa la clave pública publishable del proyecto.');
  return {url,publishableKey};
}
export async function createCloud(config) { const { CloudConnection } = await import('./supabase.js'); return new CloudConnection(config); }
