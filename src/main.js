import './style.css';

const body = document.body;
const stage = document.querySelector('#stage');
const video = document.querySelector('#heroVideo');
const invitation = document.querySelector('#invitation');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let openingStarted = false;
let scrollUnlocked = false;
let syncFrame = 0;
let fallbackTimer = 0;

function unlockInvitation() {
  if (scrollUnlocked) return;
  scrollUnlocked = true;
  body.classList.remove('is-locked');
  invitation.removeAttribute('aria-hidden');
}

function revealFinalScene() {
  window.clearTimeout(fallbackTimer);
  window.cancelAnimationFrame(syncFrame);
  video.pause();
  stage.classList.remove('is-playing');
  stage.classList.add('is-fallback', 'is-open', 'show-focus', 'show-eyebrow', 'show-ramik', 'show-ampersand', 'show-mariam', 'show-date', 'show-transition');
  unlockInvitation();
}

function syncOpening() {
  const time = video.currentTime;

  stage.classList.toggle('show-focus', time >= 2.25);
  stage.classList.toggle('show-eyebrow', time >= 2.55);
  stage.classList.toggle('show-ramik', time >= 2.85);
  stage.classList.toggle('show-ampersand', time >= 3.1);
  stage.classList.toggle('show-mariam', time >= 3.25);
  stage.classList.toggle('show-date', time >= 3.7);
  stage.classList.toggle('show-transition', time >= 4.15);

  stage.dataset.phase = time < .8
    ? 'anticipation'
    : time < 2.55
      ? 'opening'
      : time < 4.65
        ? 'typography'
        : 'hold';

  if (time >= 4.65) unlockInvitation();

  if (!video.paused && !video.ended) {
    syncFrame = window.requestAnimationFrame(syncOpening);
  }
}

async function startOpening() {
  if (openingStarted) return;
  openingStarted = true;

  if (reducedMotion.matches) {
    revealFinalScene();
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.controls = false;
  video.loop = false;

  try {
    await (document.fonts?.ready ?? Promise.resolve());
    video.currentTime = 0;
    await video.play();
  } catch {
    revealFinalScene();
  }
}

video.addEventListener('playing', () => {
  window.clearTimeout(fallbackTimer);
  stage.classList.add('is-playing');
  window.cancelAnimationFrame(syncFrame);
  syncFrame = window.requestAnimationFrame(syncOpening);
}, { once: true });

video.addEventListener('ended', () => {
  window.cancelAnimationFrame(syncFrame);
  stage.classList.add('is-open', 'show-focus', 'show-eyebrow', 'show-ramik', 'show-ampersand', 'show-mariam', 'show-date', 'show-transition');
  unlockInvitation();
});

video.addEventListener('error', revealFinalScene, { once: true });

fallbackTimer = window.setTimeout(() => {
  if (!stage.classList.contains('is-playing')) revealFinalScene();
}, 6_500);

if (document.readyState === 'complete') {
  window.setTimeout(startOpening, 120);
} else {
  window.addEventListener('load', () => window.setTimeout(startOpening, 120), { once: true });
}

window.addEventListener('pagehide', () => {
  window.clearTimeout(fallbackTimer);
  window.cancelAnimationFrame(syncFrame);
});

const pluralize = (value, forms) => {
  const abs = Math.abs(value) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last > 1 && last < 5) return forms[1];
  return forms[2];
};

const target = new Date('2026-09-09T17:00:00+03:00').getTime();
const units = [
  ['days', 86_400_000, ['День', 'Дня', 'Дней']],
  ['hours', 3_600_000, ['Час', 'Часа', 'Часов']],
  ['minutes', 60_000, ['Минута', 'Минуты', 'Минут']],
  ['seconds', 1_000, ['Секунда', 'Секунды', 'Секунд']],
];

function updateCountdown() {
  let remaining = target - Date.now();

  if (remaining <= 0) {
    document.querySelector('#countdown').hidden = true;
    document.querySelector('#countdownFinished').hidden = false;
    return;
  }

  for (const [id, milliseconds, forms] of units) {
    const value = Math.floor(remaining / milliseconds);
    remaining %= milliseconds;
    document.querySelector(`#${id}`).textContent = String(value).padStart(2, '0');
    document.querySelector(`#${id}Label`).textContent = pluralize(value, forms);
  }
}

updateCountdown();
window.setInterval(updateCountdown, 1_000);

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));
} else {
  document.querySelectorAll('.reveal').forEach((section) => section.classList.add('is-visible'));
}
