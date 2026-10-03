import { readFileSync } from 'node:fs';
import { DEFAULT_CONFIG } from '../public/js/defaults.js';

export { DEFAULT_CONFIG };

const STRING_KEYS = [
  'appName',
  'tagline',
  'messageTemplate',
  'messageTemplateAnonymous',
  'fullscreenTitle',
  'fullscreenByline',
  'fullscreenSubtitle',
];

/** Variables d'environnement -> clé de configuration. */
const ENV_MAP = {
  APP_NAME: 'appName',
  APP_TAGLINE: 'tagline',
  ENABLE_BY_FIELD: 'enableByField',
  MESSAGE_TEMPLATE: 'messageTemplate',
  MESSAGE_TEMPLATE_ANONYMOUS: 'messageTemplateAnonymous',
  FULLSCREEN_TITLE: 'fullscreenTitle',
  FULLSCREEN_BYLINE: 'fullscreenByline',
  FULLSCREEN_SUBTITLE: 'fullscreenSubtitle',
  PRESET_NAMES: 'presetNames',
  REMEMBER_RECENT_NAMES: 'rememberRecentNames',
  MAX_NAME_LENGTH: 'maxNameLength',
};

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off', ''].includes(v)) return false;
  return undefined;
}

function parseList(value) {
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

/** Valide/normalise une valeur ; renvoie undefined si elle est invalide. */
function normalize(key, value) {
  if (STRING_KEYS.includes(key)) {
    return typeof value === 'string' ? value.slice(0, 500) : undefined;
  }
  switch (key) {
    case 'enableByField':
    case 'rememberRecentNames':
      return parseBoolean(value);
    case 'presetNames':
      return parseList(value);
    case 'maxNameLength': {
      const n = Number.parseInt(value, 10);
      return Number.isInteger(n) && n >= 1 && n <= 200 ? n : undefined;
    }
    default:
      return undefined;
  }
}

function applyOverrides(base, overrides, source, warn) {
  const result = { ...base };
  for (const [key, raw] of Object.entries(overrides)) {
    if (!(key in DEFAULT_CONFIG)) {
      warn(`[config] clé inconnue ignorée (${source}) : ${key}`);
      continue;
    }
    const value = normalize(key, raw);
    if (value === undefined) {
      warn(`[config] valeur invalide ignorée (${source}) : ${key}`);
      continue;
    }
    result[key] = value;
  }
  return result;
}

/**
 * Construit la configuration : défauts < fichier JSON (CONFIG_FILE) < variables d'environnement.
 */
export function loadConfig(env = process.env, { warn = console.warn } = {}) {
  let config = { ...DEFAULT_CONFIG };

  if (env.CONFIG_FILE) {
    const fileContent = JSON.parse(readFileSync(env.CONFIG_FILE, 'utf8'));
    if (fileContent === null || typeof fileContent !== 'object' || Array.isArray(fileContent)) {
      throw new Error(`CONFIG_FILE doit contenir un objet JSON : ${env.CONFIG_FILE}`);
    }
    config = applyOverrides(config, fileContent, 'CONFIG_FILE', warn);
  }

  const envOverrides = {};
  for (const [envName, key] of Object.entries(ENV_MAP)) {
    if (env[envName] !== undefined) envOverrides[key] = env[envName];
  }
  config = applyOverrides(config, envOverrides, 'env', warn);

  return Object.freeze(config);
}
