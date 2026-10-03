import { loadConfig } from './config.js';
import { fakeQrMatrix, linuxCrash, macCrash, windowsCrash } from './crash-content.js';
import { buildMessage, fullscreenHref, readParams } from './message.js';
import { crashTheme, lockHint, resolveOS } from './os.js';

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderWindows(ctx) {
  const text = windowsCrash(ctx);
  $('bsod-victim-line').textContent = text.victimLine;
  $('bsod-message').textContent = text.message;
  $('bsod-stopcode').textContent = text.stopCode;
  $('bsod-hint').textContent = text.hint;
  if (text.by) {
    $('bsod-by').textContent = text.by;
    $('bsod-by').hidden = false;
  }

  const qr = $('bsod-qr');
  for (const row of fakeQrMatrix(`${ctx.victim}|${ctx.by}`)) {
    for (const on of row) {
      const cell = document.createElement('span');
      if (on) cell.className = 'on';
      qr.append(cell);
    }
  }

  // Progression "0 % effectué" -> 100 %, puis chute finale.
  const percent = $('bsod-percent');
  let value = reduceMotion ? 100 : 0;
  const finish = () => {
    percent.textContent = '100';
    percent.parentElement.append(document.createElement('br'), text.done);
  };
  if (value === 100) return finish();
  const timer = setInterval(() => {
    value = Math.min(100, value + Math.ceil(Math.random() * 9));
    percent.textContent = String(value);
    if (value === 100) {
      clearInterval(timer);
      finish();
    }
  }, 450);
}

function renderMac(ctx) {
  const text = macCrash(ctx);
  for (const key of ['fr', 'en', 'de', 'ja']) $(`mac-${key}`).textContent = text[key];
  $('mac-message').textContent = text.message;
  $('mac-hint').textContent = text.hint;
}

function renderLinux(ctx) {
  const log = $('kpanic-log');
  const lines = linuxCrash(ctx);
  const cursor = document.createElement('span');
  cursor.className = 'kpanic-cursor';
  cursor.textContent = '_';

  if (reduceMotion) {
    log.textContent = `${lines.join('\n')}\n`;
    log.append(cursor);
    return;
  }
  let i = 0;
  const timer = setInterval(() => {
    log.append(`${lines[i]}\n`);
    i += 1;
    if (i === lines.length) {
      clearInterval(timer);
      log.append(cursor);
    }
  }, 160);
}

function setupInteractions() {
  // Vrai plein écran uniquement sur un clic de l'utilisateur (geste explicite).
  document.body.addEventListener('click', (event) => {
    if (event.target.closest('a, button') || document.fullscreenElement || !document.fullscreenEnabled) return;
    document.documentElement.requestFullscreen().catch(() => {});
  });

  // Curseur masqué après quelques secondes d'inactivité, pour l'illusion.
  let idle;
  const wake = () => {
    document.body.classList.remove('is-idle');
    clearTimeout(idle);
    idle = setTimeout(() => document.body.classList.add('is-idle'), 2500);
  };
  for (const type of ['mousemove', 'keydown', 'pointerdown']) document.addEventListener(type, wake);
  wake();
}

async function init() {
  const config = await loadConfig();
  const { victim: rawVictim, by: rawBy } = readParams(window.location.search, config.maxNameLength);
  const by = config.enableByField ? rawBy : '';

  if (!config.enableCrashScreen) {
    window.location.replace(fullscreenHref(rawVictim, by));
    return;
  }

  const victim = rawVictim || 'Quelqu’un';
  const os = resolveOS(window.location.search, navigator);
  const theme = crashTheme(os);
  const ctx = {
    victim,
    by,
    message: buildMessage(config, victim, by),
    hint: lockHint(config, os),
    stopCode: config.crashStopCode,
  };

  $('crash-to-stage').href = fullscreenHref(rawVictim, by);
  document.body.dataset.theme = theme;
  $(`crash-${theme}`).hidden = false;
  ({ windows: renderWindows, mac: renderMac, linux: renderLinux })[theme](ctx);
  setupInteractions();
}

init();
