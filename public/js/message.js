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

/** Remplace {victim} et {by} dans un template (pas d'autre interprétation). */
export function renderTemplate(template, values) {
  return String(template).replace(/\{(victim|by)\}/g, (_, key) => values[key] ?? '');
}

/** Construit le message à copier/coller. */
export function buildMessage(config, victim, by) {
  const useBy = Boolean(config.enableByField && by);
  const template = useBy ? config.messageTemplate : config.messageTemplateAnonymous;
  return renderTemplate(template, { victim, by: useBy ? by : '' });
}

/** Lit victim / by depuis une query string, sans leur faire confiance. */
export function readParams(search, maxLength = DEFAULT_MAX_NAME_LENGTH) {
  const params = new URLSearchParams(search);
  return {
    victim: sanitizeName(params.get('victim') ?? '', maxLength),
    by: sanitizeName(params.get('by') ?? '', maxLength),
  };
}

/** URL relative de la vue plein écran (fonctionne derrière n'importe quel préfixe/hostname). */
export function fullscreenHref(victim, by) {
  const params = new URLSearchParams({ victim });
  if (by) params.set('by', by);
  return `croissante?${params}`;
}
