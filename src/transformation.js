const root = document.querySelector('.transform-lab');
const stage = root.querySelector('.tr-stage');
const before = root.querySelector('#before-button');
const after = root.querySelector('#after-button');
const play = root.querySelector('#unify-button');
const browser = root.querySelector('.tr-browser');
const desktops = root.querySelector('.tr-desktops');
const announcement = root.querySelector('#tr-announcement');
const label = root.querySelector('#tr-stage-label');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let phase = 'before';
let animations = [];
let timers = [];
let sequence = 0;

function cancelSequence() {
  sequence += 1;
  timers.forEach(clearTimeout);
  timers = [];
  animations.forEach(animation => animation.cancel());
  animations = [];
  root.querySelectorAll('.tr-flying-file').forEach(file => file.remove());
}

function later(callback, delay) {
  timers.push(setTimeout(callback, delay));
}

function markStep(step) {
  root.querySelectorAll('[data-step]').forEach((element, index) => {
    element.classList.toggle('current', index === step);
    element.classList.toggle('complete', index < step);
    if (index === step) element.setAttribute('aria-current', 'step');
    else element.removeAttribute('aria-current');
  });
}

function setResult(connected) {
  phase = connected ? 'after' : 'before';
  stage.dataset.phase = phase;
  browser.inert = !connected;
  browser.setAttribute('aria-hidden', String(!connected));
  desktops.setAttribute('aria-hidden', String(connected));
  before.classList.toggle('active', !connected);
  after.classList.toggle('active', connected);
  before.setAttribute('aria-pressed', String(!connected));
  after.setAttribute('aria-pressed', String(connected));
  play.removeAttribute('aria-busy');
  play.innerHTML = connected
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2-5M4 3v5h5"/></svg><span>Repetir transformación</span>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7z"/></svg><span>Ver la transformación</span>';
  label.textContent = connected
    ? 'Un cliente, sus equipos y toda su historia. Conectados.'
    : 'Tres áreas. Tres versiones de la misma historia.';
  announcement.textContent = connected
    ? 'Información conectada. Puedes cambiar entre EQ-024 y EQ-018 o explorar la demo completa.'
    : 'Activa la transformación para ver cómo se conecta la información.';
  markStep(connected ? 2 : 0);
}

function reset() {
  cancelSequence();
  // A control inside the system must not remain focused when it becomes inert.
  if (browser.contains(document.activeElement)) before.focus();
  setResult(false);
}

function flyFiles(run) {
  const stageRect = stage.getBoundingClientRect();
  root.querySelectorAll('[data-source]').forEach((source, index) => {
    const target = root.querySelector(`[data-target="${source.dataset.source}"]`);
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const flight = source.cloneNode(true);
    flight.removeAttribute('data-source');
    flight.classList.add('tr-flying-file');
    flight.setAttribute('aria-hidden', 'true');
    Object.assign(flight.style, {
      left: `${from.left - stageRect.left}px`,
      top: `${from.top - stageRect.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    });
    stage.append(flight);
    const dx = to.left + to.width / 2 - from.left - from.width / 2;
    const dy = to.top + to.height / 2 - from.top - from.height / 2;
    const animation = flight.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * .5}px, ${dy * .35 - 24}px) scale(.85)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.45)`, opacity: 0, offset: 1 },
    ], { duration: 900, delay: index * 90, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'both' });
    animations.push(animation);
    animation.finished.then(() => {
      flight.remove();
      if (run !== sequence) return;
      const highlight = target.animate([
        { backgroundColor: '#d9ecdf' },
        { backgroundColor: 'transparent' },
      ], { duration: 600, easing: 'ease-out' });
      animations.push(highlight);
    }).catch(() => { /* Cancelling or changing the scene is intentional. */ });
  });
}

function connect() {
  cancelSequence();
  selectEquipment(0);
  if (reducedMotion.matches) {
    setResult(true);
    return;
  }
  setResult(false);
  const run = sequence;
  phase = 'connecting';
  stage.dataset.phase = 'gather';
  play.setAttribute('aria-busy', 'true');
  play.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2-5M4 3v5h5"/></svg><span>Volver a empezar</span>';
  label.textContent = 'Relacionamos cada dato con su cliente y su equipo.';
  announcement.textContent = 'Conectando clientes, equipos, contratos y movimientos.';
  markStep(1);
  later(() => {
    stage.dataset.phase = 'assembling';
    flyFiles(run);
  }, 480);
  later(() => {
    stage.dataset.phase = 'settling';
    label.textContent = 'Las piezas encajan. Ahora puedes ver la historia completa.';
  }, 1600);
  later(() => setResult(true), 2300);
}

before.addEventListener('click', reset);
after.addEventListener('click', () => {
  if (phase !== 'after') connect();
});
play.addEventListener('click', connect);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches && phase === 'connecting') {
    cancelSequence();
    setResult(true);
  }
});
// Complete an interrupted presentation when leaving the tab; no background loops.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && phase === 'connecting') {
    cancelSequence();
    setResult(true);
  }
});

const equipment = [
  { name: 'Ricoh IM C3000', serial: 'DEMO-RC024', counter: '42,580', id: 'EQ-024', previous: 'Devolución de Grupo del Pacífico' },
  { name: 'HP DesignJet T650', serial: 'DEMO-HP018', counter: '8,240', id: 'EQ-018', previous: 'Ingreso a almacén de Andina' },
];
function selectEquipment(index, animate = false) {
  const asset = equipment[index];
  root.querySelector('#tr-asset-name').textContent = asset.name;
  root.querySelector('#tr-asset-serial').textContent = `Serie ${asset.serial}`;
  root.querySelector('#tr-asset-counter').textContent = asset.counter;
  root.querySelector('#tr-contract-name').textContent = `Contrato de alquiler · ${asset.id}`;
  root.querySelector('#tr-maintenance-name').textContent = `Reporte de mantenimiento · ${asset.id}`;
  root.querySelector('#tr-previous-client').textContent = asset.previous;
  root.querySelectorAll('[data-tr-asset]').forEach(tab => {
    const selected = Number(tab.dataset.trAsset) === index;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  });
  if (animate && !reducedMotion.matches) {
    const animation = root.querySelector('.tr-equipment').animate([
      { opacity: .55, transform: 'translateY(4px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 220, easing: 'ease-out' });
    animations.push(animation);
  }
  if (animate) announcement.textContent = `${asset.name}, ${asset.id}: documentos e historial actualizados.`;
}

root.querySelectorAll('[data-tr-asset]').forEach(button => {
  button.addEventListener('click', () => selectEquipment(Number(button.dataset.trAsset), true));
});
setResult(false);
