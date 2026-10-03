// Logique pure, sans DOM : utilisée par le navigateur ET par les tests Node.

export const DEFAULT_MAX_NAME_LENGTH = 40;

// Caractères de contrôle + overrides bidi (évite le "spoofing" visuel du texte).
const UNSAFE_CHARS = /[\p{Cc}‪-‮⁦-⁩]/gu;

/**
 * Nettoie un nom saisi ou reçu en paramètre d'URL.
 * Le résultat reste du texte brut : il doit toujours être inséré via textContent.
 */
export function sanitizeName(value, maxLength = DEFAULT_MAX_NAME_LENGTH) {
  if (typeof value !== 'string') return '';
  const cleaned = value.normalize('NFC').replace(UNSAFE_CHARS, ' ').replace(/\s+/g, ' ').trim();
  return Array.from(cleaned).slice(0, maxLength).join('').trim();
}

/** Remplace {by} dans un template (pas d'autre interprétation). */
export function renderTemplate(template, values) {
  return String(template).replace(/\{by\}/g, () => values.by ?? '');
}

const MAX_NAMES = 10;

/** Découpe "damien, margaux et sébastien" en noms nettoyés (dédoublonnés, 10 max). */
export function parseNames(value, maxLength = DEFAULT_MAX_NAME_LENGTH) {
  if (typeof value !== 'string') return [];
  const names = value
    .split(/,|;|\n|\s+et\s+|\s*&\s*/i)
    .map((name) => sanitizeName(name, maxLength))
    .filter(Boolean);
  return [...new Set(names)].slice(0, MAX_NAMES);
}

/** ["a", "b", "c"] -> "a, b et c". */
export function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} et ${names.at(-1)}`;
}

/** Choisit un index de template au hasard, différent du précédent quand c'est possible. */
export function pickTemplateIndex(count, previous = -1, random = Math.random) {
  if (count <= 1) return 0;
  let index = Math.floor(random() * count);
  if (index === previous) index = (index + 1) % count;
  return index;
}

/**
 * Construit le message à copier/coller. Il est envoyé depuis le compte de la victime :
 * il doit avoir l'air écrit par elle, donc sans son nom ni celui du croissanteur.
 */
export function buildMessage(config, index = 0, names = []) {
  const templates = config.messageTemplates;
  const base = templates[((index % templates.length) + templates.length) % templates.length] ?? '';
  if (names.length === 0 || !config.includeTemplate) return base;
  const include = String(config.includeTemplate).replace(/\{names\}/g, () => joinNames(names));
  return `${base} ${include}`;
}

/** Lit les paramètres d'URL (by, with, m) sans leur faire confiance. */
export function readParams(search, maxLength = DEFAULT_MAX_NAME_LENGTH) {
  const params = new URLSearchParams(search);
  const m = Number.parseInt(params.get('m') ?? '', 10);
  return {
    by: sanitizeName(params.get('by') ?? '', maxLength),
    names: parseNames(params.get('with') ?? '', maxLength),
    index: Number.isInteger(m) && m >= 0 && m < 100 ? m : 0,
  };
}

function pageHref(page, query) {
  const params = new URLSearchParams();
  if (query.by) params.set('by', query.by);
  if (query.names?.length) params.set('with', query.names.join(','));
  if (query.index) params.set('m', String(query.index));
  const qs = params.toString();
  return qs ? `${page}?${qs}` : page;
}

/** URL relative de la vue plein écran (fonctionne derrière n'importe quel préfixe/hostname). */
export function fullscreenHref(by) {
  return pageHref('croissante', { by });
}

/** URL relative de l'écran de crash (qui reprend le message choisi). */
export function crashHref({ by = '', names = [], index = 0 } = {}) {
  return pageHref('crash', { by, names, index });
}
