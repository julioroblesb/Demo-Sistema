import './transformation.js';
import { icon } from './icons.js';

const $ = selector => document.querySelector(selector);
document.querySelectorAll('[data-icon]').forEach(element => {
  element.innerHTML = icon(element.dataset.icon);
});

const clients = [
  { id: 1, name: 'Constructora Horizonte', initials: 'CH', color: 'purple', sector: 'Construcción', contact: 'Lucía Mendoza', assets: ['EQ-024', 'EQ-018'] },
  { id: 2, name: 'Grupo del Pacífico', initials: 'GP', color: 'blue', sector: 'Servicios empresariales', contact: 'Diego Torres', assets: ['EQ-031'] },
  { id: 3, name: 'Estudio Norte', initials: 'EN', color: 'orange', sector: 'Arquitectura', contact: 'Valeria Ríos', assets: ['EQ-042'] },
];
const assets = [
  { id: 'EQ-024', name: 'Impresora multifuncional', model: 'Ricoh IM C3000', serial: 'DEMO-RC024', client: 1, counter: '42,580', date: '12 oct 2026' },
  { id: 'EQ-018', name: 'Plotter de gran formato', model: 'HP DesignJet T650', serial: 'DEMO-HP018', client: 1, counter: '8,240', date: '08 oct 2026' },
  { id: 'EQ-031', name: 'Impresora multifuncional', model: 'Canon imageRUNNER', serial: 'DEMO-CN031', client: 2, counter: '26,310', date: '05 oct 2026' },
  { id: 'EQ-042', name: 'Escáner documental', model: 'Epson WorkForce', serial: 'DEMO-EP042', client: 3, counter: '12,670', date: '02 oct 2026' },
];
let view = 'clients';
let selected = 1;
let modalTrigger = null;
const clientFor = asset => clients.find(client => client.id === asset.client);
const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function empty(message) {
  return `<div class="empty"><p>${message}</p><button type="button" data-reset-search>Ver todos los registros</button></div>`;
}
function assetRows(list) {
  return list.map(asset => `
    <button type="button" class="asset-row" data-asset="${asset.id}">
      <span class="asset-icon">${icon('assets')}</span>
      <span class="asset-description"><strong>${asset.model}</strong><small>${asset.id} · Serie ${asset.serial}</small></span>
      <span class="asset-state">En alquiler</span><span class="row-arrow">${icon('diagonal')}</span>
    </button>`).join('') || empty('No encontramos equipos que coincidan con tu búsqueda.');
}
function setView(nextView) {
  view = nextView;
  $('#search').value = '';
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  render();
}
function render() {
  const query = normalized($('#search').value);
  const matchesAsset = asset => normalized([asset.name, asset.model, asset.serial, asset.id, clientFor(asset).name].join(' ')).includes(query);
  const filteredAssets = assets.filter(matchesAsset);
  const filteredClients = clients.filter(client => normalized([client.name, client.sector, client.contact].join(' ')).includes(query)
    || assets.some(asset => asset.client === client.id && matchesAsset(asset)));
  const labels = { clients: 'Clientes', assets: 'Equipos', documents: 'Documentos', history: 'Historial' };
  const titles = { clients: 'Cada cliente, con todo conectado.', assets: 'Cada equipo tiene una historia.', documents: 'Los documentos, en su contexto.', history: 'Toda la operación deja una huella.' };
  $('#view-name').textContent = labels[view];
  $('#panel-title').textContent = titles[view];
  const count = view === 'clients' ? filteredClients.length : filteredAssets.length;
  const noun = { clients: count === 1 ? 'cliente' : 'clientes', assets: count === 1 ? 'equipo' : 'equipos', documents: count === 1 ? 'documento' : 'documentos', history: count === 1 ? 'movimiento' : 'movimientos' }[view];
  $('#record-count').textContent = `${count} ${noun}`;
  $('#clear-search').hidden = !query;
  let output = '';
  if (view === 'clients') {
    if (!filteredClients.length) output = empty('No encontramos clientes con esa búsqueda.');
    else {
      // Keep the details consistent with the visible selection when filtering.
      if (!filteredClients.some(client => client.id === selected)) selected = filteredClients[0].id;
      const client = clients.find(client => client.id === selected);
      output = `<div class="client-grid">${filteredClients.map(item => `
        <button type="button" class="client-card ${item.id === selected ? 'chosen' : ''}" data-client="${item.id}" aria-pressed="${item.id === selected}">
          <span class="client-avatar ${item.color}">${item.initials}</span><span class="client-card-arrow">${icon('diagonal')}</span>
          <strong>${item.name}</strong><small>${item.sector}</small><span class="client-meta">${item.assets.length} equipos <i>·</i> Cliente activo</span>
        </button>`).join('')}</div>
        <div class="client-detail"><div class="detail-heading"><div><h4>${client.name}</h4><p>Contacto: ${client.contact}<span class="contact-separator"> · </span></p></div><span class="connected-tag">${icon('link')} Información conectada</span></div>
        <div class="detail-tabs"><span class="tab-selected">Equipos asociados <b>${client.assets.length}</b></span><button type="button" data-client-docs="${client.id}">Documentos ${icon('diagonal')}</button></div>
        ${assetRows(assets.filter(asset => asset.client === selected))}</div>`;
    }
  }
  if (view === 'assets') output = `<div class="list-panel">${assetRows(filteredAssets)}</div>`;
  if (view === 'documents') output = `<div class="list-panel">${filteredAssets.map(asset => `
    <button type="button" class="asset-row" data-doc="${asset.id}"><span class="file-icon pdf">${icon('documents')}</span><span class="asset-description"><strong>Contrato de alquiler · ${asset.id}</strong><small>${clientFor(asset).name} · Documento ficticio</small></span><span class="row-arrow">${icon('diagonal')}</span></button>`).join('') || empty('No encontramos documentos con esa búsqueda.')}</div>`;
  if (view === 'history') output = `<div class="list-panel">${filteredAssets.map(asset => `
    <button type="button" class="asset-row" data-asset="${asset.id}"><span class="asset-icon">${icon('history')}</span><span class="asset-description"><strong>Asignado a ${clientFor(asset).name}</strong><small>${asset.id} · ${asset.date} · Ver historial completo</small></span><span class="row-arrow">${icon('diagonal')}</span></button>`).join('') || empty('No encontramos movimientos con esa búsqueda.')}</div>`;
  $('#demo-content').innerHTML = output;
}

function openDialog() {
  const dialog = $('#detail-dialog');
  if (!dialog.open) {
    modalTrigger = document.activeElement;
    dialog.showModal();
  }
  $('#close-dialog').focus({ preventScroll: true });
}
function showAsset(id) {
  const asset = assets.find(item => item.id === id);
  if (!asset) return;
  const client = clientFor(asset);
  $('#detail-content').innerHTML = `
    <p class="modal-label">Ficha del equipo · Demostración</p><h2 id="detail-title" class="modal-title">${asset.model}</h2><p class="modal-subtitle">${asset.id} · Serie ${asset.serial}</p>
    <div class="modal-stats"><div><small>Cliente actual</small><strong>${client.name}</strong></div><div><small>Contador actual</small><strong>${asset.counter}</strong></div></div>
    <h3 class="modal-section-title">Historial conectado</h3><ol class="timeline">
      <li><small>${asset.date}</small><strong>Asignado a ${client.name}</strong><p>Contrato y acta de entrega vinculados al equipo.</p></li>
      <li><small>20 sep 2026</small><strong>Mantenimiento preventivo</strong><p>Revisión general y registro de contador.</p></li>
      <li><small>01 sep 2026</small><strong>${id === 'EQ-024' ? 'Devolución de Grupo del Pacífico' : 'Ingreso a almacén'}</strong><p>El historial se conserva al cambiar de ubicación.</p></li>
    </ol><button class="copy-button" type="button" data-doc="${id}">${icon('documents')} Ver contrato asociado ${icon('diagonal')}</button>
    <p class="modal-note">Recorrido ilustrativo con datos completamente ficticios.</p>`;
  openDialog();
}
function showDoc(id) {
  const asset = assets.find(item => item.id === id);
  if (!asset) return;
  $('#detail-content').innerHTML = `
    <p class="modal-label">Documento de demostración</p><div class="fake-document"><span class="watermark" aria-hidden="true">DEMO</span><span class="mini-label">Andina Equipos · Empresa ficticia</span><h2 id="detail-title" class="modal-title">Contrato de alquiler</h2><p>Referencia: DEMO-${asset.id}</p><hr><p><strong>Cliente</strong><br>${clientFor(asset).name}</p><p><strong>Equipo relacionado</strong><br>${asset.model} · ${asset.serial}</p><p>Este documento ilustra cómo un contrato queda relacionado con un cliente y un equipo. No tiene validez contractual.</p></div>
    <button class="copy-button" type="button" data-asset="${id}">${icon('arrow')} Volver al equipo</button>`;
  openDialog();
}

// Delegation keeps dynamic lists keyboard accessible through native buttons.
document.addEventListener('click', event => {
  const button = event.target.closest('button, a');
  if (!button) return;
  if (button.dataset.client) {
    selected = Number(button.dataset.client);
    render();
    $(`[data-client="${selected}"]`)?.focus({ preventScroll: true });
  }
  if (button.dataset.asset) showAsset(button.dataset.asset);
  if (button.dataset.doc) showDoc(button.dataset.doc);
  if (button.dataset.view) setView(button.dataset.view);
  if (button.dataset.jumpView) setView(button.dataset.jumpView);
  if (button.dataset.clientDocs) {
    const client = clients.find(item => item.id === Number(button.dataset.clientDocs));
    setView('documents');
    $('#search').value = client.name;
    render();
  }
  if (button.hasAttribute('data-reset-search')) {
    $('#search').value = '';
    render();
    $('#search').focus({ preventScroll: true });
  }
});
$('#search').addEventListener('input', render);
$('#clear-search').addEventListener('click', () => {
  $('#search').value = '';
  render();
  $('#search').focus({ preventScroll: true });
});
$('#close-dialog').addEventListener('click', () => $('#detail-dialog').close());
$('#detail-dialog').addEventListener('click', event => {
  if (event.target !== $('#detail-dialog')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});
$('#detail-dialog').addEventListener('close', () => {
  if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
});

// The dossier is a three-date story, independent from the full demo.
const dossierEvents = [
  { state: 'Cliente anterior', client: 'Grupo del Pacífico', tag: 'Devuelto', description: 'La devolución queda registrada. El equipo conserva el vínculo con su cliente anterior.' },
  { state: 'Servicio registrado', client: 'Mantenimiento preventivo', tag: 'Revisado', description: 'La revisión y el contador pasan a formar parte del historial del mismo equipo.' },
  { state: 'Cliente actual', client: 'Constructora Horizonte', tag: 'En alquiler', description: 'El contrato, la entrega y los documentos están relacionados con este equipo.' },
];
let dossierAnimation;
function updateDossier(index, animate = true) {
  const entry = dossierEvents[index];
  $('#dossier-state').textContent = entry.state;
  $('#dossier-client').textContent = entry.client;
  $('#dossier-tag').textContent = entry.tag;
  $('#dossier-description').textContent = entry.description;
  $('.dossier-timeline').dataset.index = String(index);
  document.querySelectorAll('[data-dossier]').forEach(button => {
    const current = Number(button.dataset.dossier) === index;
    button.classList.toggle('active', current);
    button.classList.toggle('is-past', Number(button.dataset.dossier) < index);
    button.setAttribute('aria-pressed', String(current));
  });
  dossierAnimation?.cancel();
  if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dossierAnimation = $('.dossier-event').animate([
      { opacity: .55, transform: 'translateY(4px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 220, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
}
document.querySelectorAll('[data-dossier]').forEach(button => button.addEventListener('click', () => updateDossier(Number(button.dataset.dossier))));
updateDossier(2, false);

const menuToggle = $('#menu-toggle');
const nav = $('#main-nav');
const compactNavigation = matchMedia('(max-width: 860px)');
function setMenu(open, restoreFocus = false) {
  const expanded = compactNavigation.matches && open;
  nav.dataset.open = String(expanded);
  nav.inert = compactNavigation.matches && !expanded;
  menuToggle.setAttribute('aria-expanded', String(expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
  if (restoreFocus) menuToggle.focus({ preventScroll: true });
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
compactNavigation.addEventListener('change', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', event => {
  if (menuToggle.getAttribute('aria-expanded') === 'true' && !$('.header').contains(event.target)) setMenu(false);
});
setMenu(false);

$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const need = $('#need').value.trim();
  const message = `Hola, soy ${name}. Quiero conversar sobre un sistema para mi empresa.\n\n${need}${email ? `\n\nMi correo: ${email}` : ''}`;
  const whatsapp = `https://wa.me/51936755465?text=${encodeURIComponent(message)}`;
  const mail = `mailto:asesoria@nexoamedida.com?subject=${encodeURIComponent('Consulta sobre mi operación — Nexo')}&body=${encodeURIComponent(message)}`;
  $('#open-whatsapp').href = whatsapp;
  $('#email-message').href = mail;
  $('#contact-result').hidden = false;
  window.open(whatsapp, '_blank', 'noopener,noreferrer');
});
$('#year').textContent = new Date().getFullYear();
render();
