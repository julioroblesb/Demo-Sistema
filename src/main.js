import './transformation.js';
import { icon } from './icons.js';
import data from './demo-data.json';

const $ = selector => document.querySelector(selector);
document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
const { clients, assets, documents } = data;
let view = 'clients';
let selected = 1;
let modalTrigger = null;
const clientFor = asset => clients.find(client => client.id === asset.client);
const assetFor = document => assets.find(asset => asset.id === document.asset);
const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const assetPicture = (asset, className = '') => `<img class="${className}" src="/demo/equipos/${asset.kind}.svg" alt="" width="260" height="230">`;

function empty(message) {
  return `<div class="empty"><p>${message}</p><button type="button" data-reset-search>Ver todos los registros</button></div>`;
}
function assetRows(list) {
  return list.map(asset => `
    <button type="button" class="asset-row" data-asset="${asset.id}">
      ${assetPicture(asset, 'asset-thumbnail')}
      <span class="asset-description"><strong>${asset.name}</strong><span>${asset.model}</span><small>${asset.location}</small></span>
      <span class="asset-state">En uso</span><span class="row-arrow"><span>Ver ficha</span>${icon('diagonal')}</span>
    </button>`).join('') || empty('No encontramos equipos con esa búsqueda.');
}
function documentRows(list) {
  return list.map(doc => {
    const asset = assetFor(doc);
    return `<button type="button" class="asset-row document-row" data-doc="${doc.id}"><span class="pdf-label">PDF</span><span class="asset-description"><strong>${doc.title}</strong><span>${asset.name} ${asset.model}</span><small>${clientFor(asset).name} · ${doc.date}</small></span><span class="row-arrow"><span>Ver reporte</span>${icon('diagonal')}</span></button>`;
  }).join('') || empty('No encontramos documentos con esa búsqueda.');
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
  const filteredDocs = documents.filter(doc => normalized([doc.title, doc.date, doc.summary, assetFor(doc).name, assetFor(doc).model, clientFor(assetFor(doc)).name, doc.id].join(' ')).includes(query));
  const events = filteredAssets.flatMap(asset => asset.events.map(event => ({ ...event, asset })));
  const labels = { clients: 'Clientes', assets: 'Equipos', documents: 'Documentos', history: 'Historial' };
  const titles = { clients: '¿Qué tiene cada cliente?', assets: 'Encuentra el equipo que necesitas.', documents: 'Abre o descarga cada documento.', history: '¿Qué pasó con cada equipo?' };
  $('#view-name').textContent = labels[view];
  $('#panel-title').textContent = titles[view];
  const count = { clients: filteredClients.length, assets: filteredAssets.length, documents: filteredDocs.length, history: events.length }[view];
  const noun = { clients: count === 1 ? 'cliente' : 'clientes', assets: count === 1 ? 'equipo' : 'equipos', documents: count === 1 ? 'documento' : 'documentos', history: count === 1 ? 'registro' : 'registros' }[view];
  $('#record-count').textContent = `${count} ${noun}`;
  $('#clear-search').hidden = !query;
  let output = '';
  if (view === 'clients') {
    if (!filteredClients.length) output = empty('No encontramos clientes con esa búsqueda.');
    else {
      if (!filteredClients.some(client => client.id === selected)) selected = filteredClients[0].id;
      const client = clients.find(client => client.id === selected);
      output = `<div class="client-grid">${filteredClients.map(item => `
        <button type="button" class="client-card ${item.id === selected ? 'chosen' : ''}" data-client="${item.id}" aria-pressed="${item.id === selected}">
          <span class="client-avatar ${item.color}">${item.initials}</span><span class="client-card-arrow">${icon('diagonal')}</span>
          <strong>${item.name}</strong><small>${item.sector}</small><span class="client-meta">Ver sus ${item.assets.length} ${item.assets.length === 1 ? 'equipo' : 'equipos'}</span>
        </button>`).join('')}</div>
        <div class="client-detail"><div class="detail-heading"><div><h4>${client.name}</h4><p>Contacto: ${client.contact}</p></div><span class="connected-tag">${icon('link')} Cliente seleccionado</span></div>
        <div class="detail-tabs"><span class="tab-selected">Sus equipos <b>${client.assets.length}</b></span><button type="button" data-client-docs="${client.id}">Ver documentos ${icon('diagonal')}</button></div>
        ${assetRows(assets.filter(asset => asset.client === selected))}</div>`;
    }
  }
  if (view === 'assets') output = `<div class="list-panel">${assetRows(filteredAssets)}</div>`;
  if (view === 'documents') output = `<div class="list-panel">${documentRows(filteredDocs)}</div>`;
  if (view === 'history') output = `<div class="list-panel">${events.map(event => `
    <button type="button" class="asset-row" data-doc="${event.document}"><span class="asset-icon">${icon('history')}</span><span class="asset-description"><strong>${event.title}</strong><span>${event.asset.name} ${event.asset.model}</span><small>${event.date} · ${clientFor(event.asset).name}</small></span><span class="row-arrow"><span>Ver reporte</span>${icon('diagonal')}</span></button>`).join('') || empty('No encontramos registros con esa búsqueda.')}</div>`;
  $('#demo-content').innerHTML = output;
  $('#demo-instruction').textContent = { clients: '1. Elige un cliente. 2. Abre la ficha de su equipo. 3. Consulta el mantenimiento y su PDF.', assets: 'Abre la ficha de una impresora, un monitor o una tablet.', documents: 'Cada documento está vinculado a un cliente y a su equipo. Puedes descargar el PDF.', history: 'Cada servicio y entrega tiene su reporte. Pulsa «Ver reporte» para leerlo.' }[view];
}
function openDialog() {
  const dialog = $('#detail-dialog');
  if (!dialog.open) {
    modalTrigger = document.activeElement;
    dialog.showModal();
  }
  dialog.scrollTop = 0;
  $('#close-dialog').focus({ preventScroll: true });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('#detail-content').animate([{ transform: 'translateY(6px)' }, { transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' });
  }
}
function showAsset(id) {
  const asset = assets.find(item => item.id === id);
  if (!asset) return;
  const client = clientFor(asset);
  $('#detail-content').innerHTML = `
    <p class="modal-label">${client.name} <span aria-hidden="true">/</span> Ficha del equipo</p>
    <div class="equipment-heading">${assetPicture(asset, 'equipment-picture')}<div><h2 id="detail-title" class="modal-title">${asset.name}</h2><p class="equipment-model-name">${asset.model}</p><span class="equipment-ready">● En uso</span></div></div>
    <dl class="equipment-facts"><div><dt>Cliente</dt><dd>${client.name}</dd></div><div><dt>Ubicación</dt><dd>${asset.location}</dd></div><div><dt>${asset.metricLabel}</dt><dd>${asset.metric}</dd></div><div><dt>Código · Serie</dt><dd>${asset.id} · ${asset.serial}</dd></div></dl>
    <div class="history-heading"><h3 class="modal-section-title">Historial de mantenimiento y entregas</h3><span>${asset.events.length} registros</span></div>
    <ol class="timeline">${asset.events.map(event => `<li><small>${event.date}</small><strong>${event.title}</strong><p>${event.description}</p><button type="button" class="report-link" data-doc="${event.document}">${icon('documents')} Ver reporte <span>PDF</span>${icon('diagonal')}</button></li>`).join('')}</ol>
    <button class="copy-button" type="button" data-doc="${id}-contrato">${icon('documents')} Consultar contrato ${icon('diagonal')}</button>
    <p class="modal-note">Demo de Nexo · Explora los registros y descarga sus documentos.</p>`;
  openDialog();
}
function showDoc(id) {
  const doc = documents.find(item => item.id === id);
  if (!doc) return;
  const asset = assetFor(doc);
  $('#detail-content').innerHTML = `
    <button class="document-back" type="button" data-asset="${asset.id}">← Volver a ${asset.name.toLowerCase()} ${asset.model}</button>
    <article class="document-preview"><div class="document-masthead"><img src="/brand/nexo-logo.svg" alt="Nexo" width="110" height="39"><span>Demo · PDF</span></div><p class="modal-label">${doc.date} · ${asset.id}</p><h2 id="detail-title" class="modal-title">${doc.title}</h2>
    <dl class="document-context"><div><dt>Cliente</dt><dd>${clientFor(asset).name}</dd></div><div><dt>Equipo</dt><dd>${asset.name} ${asset.model} · ${asset.serial}</dd></div></dl>
    <h3>${doc.kind === 'mantenimiento' ? 'Motivo de la revisión' : 'Detalle del registro'}</h3><p>${doc.summary}</p><h3>${doc.kind === 'mantenimiento' ? 'Trabajo realizado' : 'Información asociada'}</h3><ul>${doc.items.map(item => `<li>${item}</li>`).join('')}</ul><p class="document-result"><span aria-hidden="true">✓</span> ${doc.result}</p>${doc.next ? `<h3>Recomendación</h3><p>${doc.next}</p>` : ''}
    </article><div class="document-actions"><a class="button" href="${doc.file}" download>Descargar PDF ${icon('documents')}</a><a class="quiet-link" href="${doc.file}" target="_blank" rel="noopener">Abrir PDF en otra pestaña ${icon('diagonal')}</a></div>`;
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

// Navigation opens the optional workspace; the main explanation remains visible without it.
function revealDemo() { $('#demo-disclosure').open = true; }
document.querySelectorAll('a[href="#demo"]').forEach(link => link.addEventListener('click', revealDemo));
if (location.hash === '#demo') revealDemo();
document.querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => {
  selected = 1;
  setView('clients');
  if (button.dataset.guide === 'client') {
    $('[data-client="1"]').focus({ preventScroll: true });
    $('[data-client="1"]').scrollIntoView({ block: 'center', behavior: 'instant' });
  }
  if (button.dataset.guide === 'asset') showAsset('EQ-024');
  if (button.dataset.guide === 'document') showDoc('EQ-024-mantenimiento');
}));

// The opening example leads directly to the same equipment shown in the workspace.
document.querySelectorAll('[data-open-example]').forEach(button => button.addEventListener('click', () => showAsset('EQ-024')));

$('#watch-demo').addEventListener('click', () => {
  const format = matchMedia('(max-width: 650px)').matches ? 'vertical' : 'escritorio';
  $('#detail-content').innerHTML = `<div class="video-dialog"><p class="modal-label">De la consulta al documento</p><h2 id="detail-title" class="modal-title">Así encuentras el último mantenimiento.</h2><video class="demo-video" controls playsinline preload="none" poster="/demo/recorrido-${format}.jpg" aria-label="Recorrido por la demo: cliente, impresora, mantenimiento y PDF"><source src="/demo/recorrido-${format}.mp4" type="video/mp4"></video><p class="video-description">18 segundos · Sin audio, con indicaciones en pantalla.</p><details class="video-transcript"><summary>Leer los pasos del video</summary><ol><li>En Clientes, elige Constructora Horizonte. Verás su impresora y su monitor.</li><li>Abre la ficha de la impresora Ricoh IM C3000. El historial muestra el mantenimiento del 12 de octubre.</li><li>Pulsa «Ver reporte» para consultar el trabajo realizado. «Descargar PDF» guarda ese mismo documento.</li></ol></details></div>`;
  openDialog();
});
$('#detail-dialog').addEventListener('close', () => { $('#detail-content video')?.pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) $('#detail-content video')?.pause(); });
