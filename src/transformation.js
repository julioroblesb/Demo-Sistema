// Both outcomes stay visible. Playback explains their relationships, not how to operate a UI.
const root = document.querySelector('.comparison');
const play = document.querySelector('#story-play');
const caption = document.querySelector('#story-caption');
const status = document.querySelector('#story-status');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const steps = [
  '1. El cliente: de una fila en Excel a una ficha con sus equipos.',
  '2. El contrato: del PDF en una carpeta al documento de ese equipo.',
  '3. El historial: de notas separadas a servicios y movimientos relacionados.',
];
let current = -1;
let running = false;
let timer;
let remaining = 3000;
let deadline = 0;
let finished = false;
let transferAnimation;
function transfer(index) {
  transferAnimation?.cancel();
  root.querySelector('.story-transfer')?.remove();
  if (motion.matches) return;
  // Batch position reads before creating the moving label.
  const bounds = root.getBoundingClientRect();
  const source = root.querySelector(`[data-story-item="${index}"]`).getBoundingClientRect();
  const target = root.querySelector(`[data-story-target="${index}"]`).getBoundingClientRect();
  const badge = document.createElement('span');
  badge.className = 'story-transfer';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = ['Cliente', 'Contrato', 'Historial'][index] + ' →';
  badge.style.left = `${source.x + source.width / 2 - bounds.x - 48}px`;
  badge.style.top = `${source.y + source.height / 2 - bounds.y - 17}px`;
  root.append(badge);
  const dx = target.x + target.width / 2 - source.x - source.width / 2;
  const dy = target.y + target.height / 2 - source.y - source.height / 2;
  transferAnimation = badge.animate([
    { transform: 'translate(0, 0) scale(.94)', opacity: 0, offset: 0 },
    { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: .12 },
    { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1, offset: .84 },
    { transform: `translate(${dx}px, ${dy}px) scale(.94)`, opacity: 0, offset: 1 },
  ], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  transferAnimation.addEventListener('finish', () => badge.remove(), { once: true });
}


function updateControl() {
  play.setAttribute('aria-pressed', String(running));
  play.querySelector('span').textContent = running ? 'Pausar explicación' : finished ? 'Repetir explicación · 9 s' : current < 0 ? 'Ver explicación · 9 s' : 'Continuar explicación';
  if (motion.matches) play.querySelector('span').textContent = current < 0 ? 'Ver explicación paso a paso' : 'Ver siguiente paso';
  play.querySelector('svg').innerHTML = running ? '<path d="M9 5v14M15 5v14"/>' : '<path d="m9 5 10 7-10 7z"/>';
}
function selectStep(index) {
  current = index;
  root.dataset.step = String(index);
  caption.textContent = steps[index];
  transfer(index);
  root.querySelectorAll('[data-story-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.storyStep) === index)));
}
function pause(announce = false) {
  if (running) remaining = Math.max(0, deadline - performance.now());
  running = false;
  transferAnimation?.pause();
  clearTimeout(timer);
  updateControl();
  if (announce) status.textContent = 'Explicación en pausa.';
}
function schedule() {
  deadline = performance.now() + remaining;
  timer = setTimeout(() => {
    if (current < steps.length - 1) {
      selectStep(current + 1);
      remaining = 3000;
      schedule();
    } else {
      running = false;
      finished = true;
      root.dataset.step = 'complete';
      caption.textContent = 'El resultado: sabes qué tiene cada cliente y qué pasó con cada equipo.';
      status.textContent = 'Explicación terminada. Puedes repetirla o probar la demo.';
      updateControl();
    }
  }, remaining);
}
play.addEventListener('click', () => {
  if (running) return pause(true);
  if (motion.matches) {
    selectStep(current < 2 ? current + 1 : 0);
    finished = false;
    status.textContent = steps[current];
    play.querySelector('span').textContent = 'Ver siguiente paso';
    return;
  }
  if (current < 0 || finished) {
    finished = false;
    remaining = 3000;
    selectStep(0);
  }
  running = true;
  transferAnimation?.play();
  updateControl();
  schedule();
});
root.querySelectorAll('[data-story-step]').forEach(button => button.addEventListener('click', () => {
  pause();
  finished = false;
  remaining = 3000;
  selectStep(Number(button.dataset.storyStep));
  status.textContent = steps[current];
  updateControl();
}));
function syncMotion() {
  pause();
  transferAnimation?.cancel();
  root.querySelector('.story-transfer')?.remove();
  if (motion.matches) play.querySelector('span').textContent = 'Ver explicación paso a paso';
}
motion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: .1 }).observe(root);
syncMotion();
