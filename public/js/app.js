import { loadConfig } from './config.js';
import {
  buildMessage,
  crashHref,
  fullscreenHref,
  parseNames,
  pickTemplateIndex,
  readParams,
  sanitizeName,
} from './message.js';

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

/** Collègues proposés en raccourci : un clic ajoute/retire le nom du champ "Mentionner". */
function renderChips(config) {
  const container = $('presets');
  const input = $('names');
  const names = [...new Set([...readRecent(config), ...config.presetNames])]
    .map((n) => sanitizeName(n, config.maxNameLength))
    .filter(Boolean);
  const selected = parseNames(input.value, config.maxNameLength);

  container.replaceChildren();
  for (const name of names) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = name;
    chip.setAttribute('aria-pressed', String(selected.includes(name)));
    chip.addEventListener('click', () => {
      const current = parseNames(input.value, config.maxNameLength);
      const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
      input.value = next.join(', ');
      renderChips(config);
    });
    container.append(chip);
  }
  container.hidden = names.length === 0;
}

async function copyText(textarea) {
  const text = textarea.value;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // On tente le repli ci-dessous.
    }
  }
  // Repli pour les contextes non HTTPS (ex. http://intranet) : API dépréciée mais encore supportée.
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  }
}

function applyBranding(config) {
  $('app-name').textContent = config.appName;
  $('tagline').textContent = config.tagline;
  document.title = `${config.appName} 🥐`;
  $('by-field').hidden = !config.enableByField;
  $('crash-link').hidden = !config.enableCrashScreen;
  $('reroll-btn').hidden = config.messageTemplates.length < 2;
  $('by').maxLength = config.maxNameLength;
}

async function init() {
  const config = await loadConfig();
  applyBranding(config);

  const form = $('croissant-form');
  const namesInput = $('names');
  const byInput = $('by');
  const message = $('message');
  const feedback = $('copy-feedback');

  const params = readParams(window.location.search, config.maxNameLength);
  namesInput.value = params.names.join(', ');
  if (config.enableByField) byInput.value = params.by;
  renderChips(config);
  form.querySelector('.btn-primary').focus();

  const state = { index: -1, names: [], by: '' };

  // La zone de message s'adapte à la longueur du texte.
  const autosize = () => {
    message.style.height = 'auto';
    message.style.height = `${message.scrollHeight + 2}px`;
  };
  message.addEventListener('input', autosize);

  const render = () => {
    message.value = buildMessage(config, state.index, state.names);
    autosize();
    $('fullscreen-link').href = fullscreenHref(state.by);
    $('crash-link').href = crashHref(state);
    feedback.textContent = '';
    feedback.className = 'feedback';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.names = parseNames(namesInput.value, config.maxNameLength);
    state.by = config.enableByField ? sanitizeName(byInput.value, config.maxNameLength) : '';
    state.index = pickTemplateIndex(config.messageTemplates.length, state.index);
    namesInput.value = state.names.join(', ');
    byInput.value = state.by;

    $('result').hidden = false;
    render();
    $('copy-btn').focus();

    rememberNames(config, state.names);
    renderChips(config);
  });

  namesInput.addEventListener('input', () => renderChips(config));

  $('reroll-btn').addEventListener('click', () => {
    state.index = pickTemplateIndex(config.messageTemplates.length, state.index);
    render();
  });

  $('copy-btn').addEventListener('click', async () => {
    const ok = await copyText(message);
    feedback.textContent = ok
      ? 'Message copié ✓'
      : 'Copie impossible : sélectionne le texte et fais Ctrl + C.';
    feedback.className = `feedback ${ok ? 'is-ok' : 'is-error'}`;
    if (!ok) message.select();
  });
}

init();
