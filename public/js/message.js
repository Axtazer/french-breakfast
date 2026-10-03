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

/**
 * Construit le message à copier/coller. Il est envoyé depuis le compte de la victime,
 * d'où l'absence de son nom : seul le croissanteur (facultatif) est mentionné.
 */
export function buildMessage(config, by) {
  const useBy = Boolean(config.enableByField && by);
  const template = useBy ? config.messageTemplate : config.messageTemplateAnonymous;
  return renderTemplate(template, { by: useBy ? by : '' });
}

/** Lit le paramètre by depuis une query string, sans lui faire confiance. */
export function readParams(search, maxLength = DEFAULT_MAX_NAME_LENGTH) {
  const params = new URLSearchParams(search);
  return { by: sanitizeName(params.get('by') ?? '', maxLength) };
}

function pageHref(page, by) {
  return by ? `${page}?${new URLSearchParams({ by })}` : page;
}

/** URL relative de la vue plein écran (fonctionne derrière n'importe quel préfixe/hostname). */
export function fullscreenHref(by) {
  return pageHref('croissante', by);
}

/** URL relative de l'écran de crash. */
export function crashHref(by) {
  return pageHref('crash', by);
}
