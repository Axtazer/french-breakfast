// Rendu DOM des écrans de crash, partagé par /crash et par l'accueil (bouton CROISSANTER).
// Tout le texte passe par textContent : aucune donnée n'est interprétée comme du HTML.
import { formatMenuBarDate, linuxCrash, macClassicCrash, macCrash, windowsCrash } from './crash-content.js';
import { QR_TEXT } from './qr-boulangerie-text.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Petit utilitaire : el('p', { className: 'x' }, 'texte', autreNoeud). */
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'attrs') for (const [a, v] of Object.entries(value)) node.setAttribute(a, v);
    else node[key] = value;
  }
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== ''));
  return node;
}

function windowsScreen(ctx, timers) {
  const text = windowsCrash(ctx);
  const percent = el('span', {}, '0');
  const progress = el('p', { className: 'bsod-progress' }, percent, '% effectué');

  // Vrai QR code (image statique, cf. scripts/generate-qr.mjs) : boulangeries à proximité.
  const qr = el('img', {
    className: 'bsod-qr',
    src: 'img/qr-boulangerie.svg',
    alt: 'QR code : trouver une boulangerie à proximité',
    draggable: false,
  });

  const screen = el(
    'div',
    { className: 'bsod' },
    el(
      'div',
      { className: 'bsod-inner' },
      el('p', { className: 'bsod-face', attrs: { 'aria-hidden': 'true' } }, ':('),
      el(
        'h1',
        { className: 'bsod-lead' },
        'Votre PC a rencontré un problème : il a été laissé déverrouillé.',
        el('span', {}, text.lead),
      ),
      progress,
      el(
        'div',
        { className: 'bsod-details' },
        qr,
        el(
          'div',
          { className: 'bsod-info' },
          el('p', { className: 'bsod-message' }, text.message),
          el('p', {}, 'Si vous appelez un support technique, donnez-lui ces informations :'),
          el('p', {}, `Code d’arrêt : ${text.stopCode}`),
          el('p', {}, text.time),
          text.by ? el('p', {}, text.by) : null,
          el('p', {}, `Ce qui a échoué : ${text.hint}`),
        ),
      ),
    ),
  );

  // Progression "0 % effectué" -> 100 %, puis chute finale.
  const finish = () => {
    percent.textContent = '100';
    progress.append(el('br'), text.done);
  };
  if (reduceMotion()) {
    finish();
  } else {
    let value = 0;
    const timer = setInterval(() => {
      value = Math.min(100, value + Math.ceil(Math.random() * 9));
      percent.textContent = String(value);
      if (value === 100) {
        clearInterval(timer);
        finish();
      }
    }, 450);
    timers.push(timer);
  }
  return screen;
}

/**
 * macOS récent : faux redémarrage (écran noir, logo, barre de progression), puis bureau
 * avec la fenêtre système « Votre ordinateur a redémarré en raison d'un problème ».
 */
function macScreen(ctx, timers) {
  const text = macCrash(ctx);

  // 1. Démarrage : logo (notre croissant en silhouette blanche) + barre de progression.
  const bar = el('div', { className: 'macos-boot-bar' }, el('span'));
  const boot = el(
    'div',
    { className: 'macos-boot' },
    el('img', { className: 'macos-boot-logo', src: 'img/croissant.svg', alt: '', draggable: false }),
    bar,
  );

  // 2. Bureau : barre de menus + fenêtre de rapport.
  const report = el(
    'div',
    { className: 'macos-report', hidden: true },
    el('p', { className: 'macos-report-title' }, text.reportTitle),
    el('pre', {}, text.reportLines.join('\n')),
  );
  const refused = el('p', { className: 'macos-refused', attrs: { role: 'alert' } });
  const dialog = el(
    'div',
    { className: 'macos-dialog', attrs: { role: 'alertdialog', 'aria-labelledby': 'macos-dialog-title' } },
    el('img', { className: 'macos-dialog-icon', src: 'img/croissant.svg', alt: '', draggable: false }),
    el('h1', { className: 'macos-dialog-title', id: 'macos-dialog-title' }, text.title),
    el('p', { className: 'macos-dialog-body' }, text.body),
    report,
    refused,
    el(
      'div',
      { className: 'macos-dialog-buttons' },
      el('button', { type: 'button', className: 'macos-btn', onclick: () => {
        refused.textContent = text.ignoreRefused;
        dialog.classList.remove('is-shaking');
        void dialog.offsetWidth; // relance l'animation
        dialog.classList.add('is-shaking');
      } }, text.ignore),
      el('button', { type: 'button', className: 'macos-btn macos-btn-primary', onclick: () => {
        report.hidden = false;
      } }, text.report),
    ),
  );
  const clock = el('span', {}, formatMenuBarDate());
  const desktop = el(
    'div',
    { className: 'macos-desktop', hidden: true },
    el(
      'div',
      { className: 'macos-menubar', attrs: { 'aria-hidden': 'true' } },
      el('img', { className: 'macos-menubar-logo', src: 'img/croissant.svg', alt: '', draggable: false }),
      el('strong', {}, 'Finder'),
      ...['Fichier', 'Édition', 'Présentation', 'Aller', 'Fenêtre', 'Aide'].map((m) => el('span', {}, m)),
      el('span', { className: 'macos-menubar-spacer' }),
      clock,
    ),
    dialog,
  );

  const showDesktop = () => {
    boot.hidden = true;
    desktop.hidden = false;
  };
  if (reduceMotion()) {
    showDesktop();
  } else {
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 4 + Math.random() * 10);
      bar.firstChild.style.width = `${progress}%`;
      if (progress === 100) {
        clearInterval(timer);
        timers.push(setTimeout(showDesktop, 600));
      }
    }, 200);
    timers.push(timer);
  }
  const clockTimer = setInterval(() => {
    clock.textContent = formatMenuBarDate();
  }, 15000);
  timers.push(clockTimer);

  return el('div', { className: 'macos' }, boot, desktop);
}

/** Ancien macOS : kernel panic multilingue (OS X 10.2 à 10.7). */
function macClassicScreen(ctx) {
  const text = macClassicCrash(ctx);
  return el(
    'div',
    { className: 'macpanic' },
    el(
      'div',
      { className: 'macpanic-box' },
      el('div', { className: 'macpanic-icon', attrs: { 'aria-hidden': 'true' } }, '⏻'),
      el('h1', { className: 'macpanic-text' }, text.fr),
      el('p', { className: 'macpanic-text', lang: 'en' }, text.en),
      el('p', { className: 'macpanic-text', lang: 'de' }, text.de),
      el('p', { className: 'macpanic-text', lang: 'ja' }, text.ja),
      el('p', { className: 'macpanic-message' }, text.message),
      el('p', { className: 'macpanic-hint' }, `${text.time} · ${text.hint}`),
    ),
  );
}

function linuxScreen(ctx, timers) {
  const lines = linuxCrash(ctx);
  const log = el('pre', { className: 'kpanic-log' });
  // QR code en texte (demi-blocs Unicode), comme l'écran de panic du noyau ou `qrencode -t UTF8`.
  const qr = el('pre', {
    className: 'kpanic-qr',
    attrs: { role: 'img', 'aria-label': 'QR code : trouver une boulangerie à proximité' },
  });
  const cursor = el('span', { className: 'kpanic-cursor' }, '_');
  const finish = () => {
    qr.textContent = QR_TEXT;
    log.after(qr);
    qr.after(el('pre', { className: 'kpanic-log' }, cursor));
  };

  if (reduceMotion()) {
    log.append(`${lines.join('\n')}\n`);
    finish();
  } else {
    let i = 0;
    const timer = setInterval(() => {
      log.append(`${lines[i]}\n`);
      i += 1;
      if (i === lines.length) {
        clearInterval(timer);
        finish();
      }
    }, 160);
    timers.push(timer);
  }
  return el('div', { className: 'kpanic' }, el('h1', { className: 'visually-hidden' }, 'Kernel panic'), log);
}

// Comme un vrai écran de crash : rien à sélectionner, copier ou ouvrir au clic droit.
const blockEvent = (event) => event.preventDefault();
const BLOCKED_EVENTS = ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'];

/**
 * Affiche l'écran de crash du thème donné dans `root` (vidé au préalable).
 * Renvoie une fonction de nettoyage (arrête les animations, vide le conteneur).
 */
export function mountCrash(root, theme, ctx) {
  const timers = [];
  const build =
    { windows: windowsScreen, mac: macScreen, 'mac-classic': macClassicScreen, linux: linuxScreen }[theme] ??
    windowsScreen;
  root.replaceChildren(build(ctx, timers));
  root.dataset.theme = theme;
  return () => {
    for (const timer of timers) {
      clearInterval(timer);
      clearTimeout(timer);
    }
    root.replaceChildren();
  };
}

/** Bloque sélection, copie et clic droit sur toute la page tant que l'écran de crash est affiché. */
export function blockCopy(target = document) {
  for (const type of BLOCKED_EVENTS) target.addEventListener(type, blockEvent);
  return () => {
    for (const type of BLOCKED_EVENTS) target.removeEventListener(type, blockEvent);
  };
}

/**
 * Un clic sur l'écran de crash (hors boutons) passe en plein écran.
 * Toujours sur un geste de l'utilisateur, comme l'exigent les navigateurs.
 */
export function fullscreenOnClick(target) {
  const onClick = (event) => {
    if (event.target.closest('a, button') || document.fullscreenElement || !document.fullscreenEnabled) return;
    document.documentElement.requestFullscreen().catch(() => {});
  };
  target.addEventListener('click', onClick);
  return () => target.removeEventListener('click', onClick);
}

/** Masque le curseur après quelques secondes d'inactivité, pour l'illusion. */
export function hideIdleCursor(target) {
  let idle;
  const wake = () => {
    target.classList.remove('is-idle');
    clearTimeout(idle);
    idle = setTimeout(() => target.classList.add('is-idle'), 2500);
  };
  const events = ['mousemove', 'keydown', 'pointerdown'];
  for (const type of events) document.addEventListener(type, wake);
  wake();
  return () => {
    clearTimeout(idle);
    target.classList.remove('is-idle');
    for (const type of events) document.removeEventListener(type, wake);
  };
}
