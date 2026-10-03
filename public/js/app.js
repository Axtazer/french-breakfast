import { loadConfig } from './config.js';
import { buildMessage, crashHref, fullscreenHref, readParams, sanitizeName } from './message.js';

const RECENT_KEY = 'croissante.recentNames';
const MAX_RECENT = 6;

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

function rememberName(config, name) {
  if (!config.rememberRecentNames) return;
  const list = [name, ...readRecent(config).filter((n) => n !== name)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Stockage indisponible (navigation privée…) : on ignore.
  }
}

function renderChips(config) {
  const container = $('presets');
  const names = config.enableByField
    ? [...new Set([...readRecent(config), ...config.presetNames])]
        .map((n) => sanitizeName(n, config.maxNameLength))
        .filter(Boolean)
    : [];
  container.replaceChildren();
  for (const name of names) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = name;
    chip.addEventListener('click', () => {
      $('by').value = name;
      document.querySelector('.btn-primary').focus();
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
  $('by').maxLength = config.maxNameLength;
}

async function init() {
  const config = await loadConfig();
  applyBranding(config);
  renderChips(config);

  const form = $('croissant-form');
  const byInput = $('by');
  const result = $('result');
  const message = $('message');
  const feedback = $('copy-feedback');

  if (config.enableByField) byInput.value = readParams(window.location.search, config.maxNameLength).by;
  form.querySelector('.btn-primary').focus();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const by = config.enableByField ? sanitizeName(byInput.value, config.maxNameLength) : '';
    byInput.value = by;

    message.value = buildMessage(config, by);
    $('fullscreen-link').href = fullscreenHref(by);
    $('crash-link').href = crashHref(by);
    feedback.textContent = '';
    feedback.className = 'feedback';
    result.hidden = false;
    $('copy-btn').focus();

    if (by) rememberName(config, by);
    renderChips(config);
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
