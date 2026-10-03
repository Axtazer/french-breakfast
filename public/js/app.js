import { loadConfig } from './config.js';
import { buildMessage, fullscreenHref, readParams, sanitizeName } from './message.js';

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
  const names = [...new Set([...readRecent(config), ...config.presetNames])]
    .map((n) => sanitizeName(n, config.maxNameLength))
    .filter(Boolean);
  container.replaceChildren();
  for (const name of names) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = name;
    chip.addEventListener('click', () => {
      $('victim').value = name;
      $('victim-error').hidden = true;
      (config.enableByField ? $('by') : document.querySelector('.btn-primary')).focus();
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
  for (const input of [$('victim'), $('by')]) input.maxLength = config.maxNameLength;
}

async function init() {
  const config = await loadConfig();
  applyBranding(config);
  renderChips(config);

  const form = $('croissant-form');
  const victimInput = $('victim');
  const byInput = $('by');
  const result = $('result');
  const message = $('message');
  const feedback = $('copy-feedback');

  const params = readParams(window.location.search, config.maxNameLength);
  victimInput.value = params.victim;
  if (config.enableByField) byInput.value = params.by;
  (params.victim ? form.querySelector('.btn-primary') : victimInput).focus();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const victim = sanitizeName(victimInput.value, config.maxNameLength);
    const by = config.enableByField ? sanitizeName(byInput.value, config.maxNameLength) : '';
    victimInput.value = victim;
    byInput.value = by;

    if (!victim) {
      $('victim-error').hidden = false;
      victimInput.setAttribute('aria-invalid', 'true');
      victimInput.focus();
      return;
    }
    $('victim-error').hidden = true;
    victimInput.removeAttribute('aria-invalid');

    message.value = buildMessage(config, victim, by);
    $('fullscreen-link').href = fullscreenHref(victim, by);
    feedback.textContent = '';
    feedback.className = 'feedback';
    result.hidden = false;
    $('copy-btn').focus();

    rememberName(config, victim);
    renderChips(config);
  });

  victimInput.addEventListener('input', () => {
    if (victimInput.value.trim()) $('victim-error').hidden = true;
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
