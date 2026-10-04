import { loadConfig } from './config.js';
import { formatCrashTime } from './crash-content.js';
import { blockCopy, fullscreenOnClick, hideIdleCursor, mountCrash } from './crash-view.js';
import { buildMessage, parseNames, pickTemplateIndex, readParams, sanitizeName } from './message.js';
import { appleDeviceName, crashTheme, detectOS, lockHint, resolveOS } from './os.js';

const RECENT_KEY = 'croissante.recentNames';
const MAX_RECENT = 8;

const $ = (id) => document.getElementById(id);

// Stockage local OPTIONNEL (désactivé par défaut) : rien ne quitte le navigateur.
function readRecent(config) {
  if (!config.rememberRecentNames) return [];
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(list) ? list.map((n) => sanitizeName(n, config.maxNameLength)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function rememberNames(config, names) {
  if (!config.rememberRecentNames || names.length === 0) return;
  const list = [...new Set([...names, ...readRecent(config)])].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Stockage indisponible (navigation privée…) : on ignore.
  }
}

/**
 * Copie un texte dans le presse-papiers. API Clipboard en contexte sécurisé (HTTPS/localhost),
 * sinon repli via une zone de texte temporaire (http://intranet…).
 */
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // On tente le repli ci-dessous.
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.className = 'clipboard-proxy';
  document.body.append(area);
  area.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

function applyBranding(config) {
  $('app-name').textContent = config.appName;
  $('tagline').textContent = config.tagline;
  document.title = config.appName;
  $('by-field').hidden = !config.enableByField;
  $('reroll-btn').hidden = config.messageTemplates.length < 2;
  $('by').maxLength = config.maxNameLength;
}

async function init() {
  const config = await loadConfig();
  applyBranding(config);

  const namesInput = $('names');
  const byInput = $('by');
  const feedback = $('copy-feedback');

  const params = readParams(window.location.search, config.maxNameLength);
  namesInput.value = params.names.join(', ');
  if (config.enableByField) byInput.value = params.by;

  const state = { index: pickTemplateIndex(config.messageTemplates.length) };
  const currentNames = () => parseNames(namesInput.value, config.maxNameLength);
  const currentMessage = () => buildMessage(config, state.index, currentNames());

  const setFeedback = (text, kind = '') => {
    feedback.textContent = text;
    feedback.className = `feedback ${kind}`.trim();
  };

  // Le message est affiché en permanence et suit les champs en direct.
  const render = () => {
    $('message-text').textContent = currentMessage();
    setFeedback('');
  };

  /** Collègues proposés en un clic (PRESET_NAMES ou mémorisés) : ajoute/retire le nom. */
  const renderChips = () => {
    const container = $('presets');
    const names = [...new Set([...readRecent(config), ...config.presetNames])]
      .map((n) => sanitizeName(n, config.maxNameLength))
      .filter(Boolean);
    const selected = currentNames();
    container.replaceChildren();
    for (const name of names) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = name;
      chip.setAttribute('aria-pressed', String(selected.includes(name)));
      chip.addEventListener('click', () => {
        const current = currentNames();
        const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
        namesInput.value = next.join(', ');
        renderChips();
        render();
      });
      container.append(chip);
    }
    container.hidden = names.length === 0;
  };

  const copy = async () => {
    const ok = await copyText(currentMessage());
    if (ok) {
      setFeedback('Message copié ✓', 'is-ok');
      rememberNames(config, currentNames());
    } else {
      setFeedback('Copie impossible : sélectionne le texte et fais Ctrl + C.', 'is-error');
    }
  };

  namesInput.addEventListener('input', () => {
    renderChips();
    render();
  });
  $('message').addEventListener('click', copy);
  $('copy-btn').addEventListener('click', copy);
  $('reroll-btn').addEventListener('click', () => {
    state.index = pickTemplateIndex(config.messageTemplates.length, state.index);
    render();
  });

  // CROISSANTER : écran de crash + plein écran dans le même clic (geste utilisateur exigé par le navigateur).
  const overlay = $('crash-overlay');
  let cleanup = () => {};
  const closeCrash = () => {
    cleanup();
    overlay.hidden = true;
    document.body.classList.remove('is-crashing');
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    $('croissanter-btn').focus();
  };

  $('croissanter-btn').hidden = !config.enableCrashScreen;
  $('croissanter-btn').addEventListener('click', () => {
    if (document.fullscreenEnabled) document.documentElement.requestFullscreen().catch(() => {});
    const os = resolveOS(window.location.search, navigator);
    const by = config.enableByField ? sanitizeName(byInput.value, config.maxNameLength) : '';
    const unmount = mountCrash($('crash-root'), crashTheme(os), {
      by,
      message: currentMessage(),
      hint: lockHint(config, os),
      stopCode: config.crashStopCode,
      time: formatCrashTime(),
      device: appleDeviceName(window.location.search, navigator),
    });
    const showCursor = hideIdleCursor(overlay);
    // Sortie du plein écran (Échap) : un clic sur l'écran de crash y revient.
    const stopFullscreenOnClick = fullscreenOnClick($('crash-root'));
    const allowCopy = blockCopy(document);
    window.getSelection()?.removeAllRanges();
    // Barre d'état / d'adresse du téléphone en noir pendant le crash.
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const previousTheme = themeColor?.content;
    themeColor?.setAttribute('content', '#000000');
    cleanup = () => {
      unmount();
      showCursor();
      stopFullscreenOnClick();
      allowCopy();
      if (themeColor && previousTheme) themeColor.setAttribute('content', previousTheme);
    };
    overlay.hidden = false;
    document.body.classList.add('is-crashing');
  });
  $('crash-close').addEventListener('click', closeCrash);

  // Raccourcis clavier : Ctrl/Cmd + C copie le message, Entrée lance le croissantage.
  const isMac = detectOS(navigator).startsWith('mac');
  $('copy-shortcut').textContent = isMac ? '⌘ + C' : 'Ctrl + C';
  document.addEventListener('copy', (event) => {
    if (!overlay.hidden) return;
    const active = document.activeElement;
    const fieldSelection = active instanceof HTMLInputElement && active.selectionStart !== active.selectionEnd;
    if (fieldSelection || window.getSelection()?.toString()) return; // copie normale d'une sélection
    event.preventDefault();
    event.clipboardData.setData('text/plain', currentMessage());
    setFeedback('Message copié ✓', 'is-ok');
    rememberNames(config, currentNames());
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing || !overlay.hidden || $('croissanter-btn').hidden) return;
    if (event.target instanceof Element && event.target.closest('button, a, textarea')) return; // natif
    event.preventDefault();
    // Clic simulé pendant le geste clavier : le plein écran reste autorisé par le navigateur.
    $('croissanter-btn').click();
  });

  renderChips();
  render();
  $('copy-btn').focus();
}

init();
