// Détection de l'OS, 100 % locale (rien n'est envoyé au serveur). Logique pure, testée sous Node.

export const KNOWN_OS = Object.freeze(['windows', 'mac', 'linux', 'chromeos', 'ios', 'android']);

/**
 * Devine l'OS à partir de l'objet navigator.
 * Approximatif par nature (user-agent falsifiable, iPadOS se présente comme macOS) : sans enjeu ici.
 */
export function detectOS(nav = {}) {
  // userAgentData.platform (Chromium) est plus fiable que le user-agent : prioritaire s'il est renseigné.
  const hint = String(nav.userAgentData?.platform ?? '').toLowerCase();
  return (hint && matchOS(hint)) || matchOS(String(nav.userAgent ?? '').toLowerCase()) || 'unknown';
}

function matchOS(source) {
  if (/cros|chrome os|chromeos/.test(source)) return 'chromeos';
  if (/android/.test(source)) return 'android';
  if (/iphone|ipad|ipod|\bios\b/.test(source)) return 'ios';
  if (/windows|win32|win64/.test(source)) return 'windows';
  if (/mac ?os|macintosh|mac os x/.test(source)) return 'mac';
  if (/linux|x11|ubuntu|fedora/.test(source)) return 'linux';
  return null;
}

/** Valide une valeur ?os= fournie dans l'URL (liste blanche). */
export function parseOSParam(value) {
  const v = String(value ?? '').trim().toLowerCase();
  const aliases = { win: 'windows', macos: 'mac', osx: 'mac', cros: 'chromeos' };
  const os = aliases[v] ?? v;
  return KNOWN_OS.includes(os) ? os : null;
}

/** OS effectif : paramètre ?os= s'il est valide, sinon détection. */
export function resolveOS(search, nav) {
  return parseOSParam(new URLSearchParams(search).get('os')) ?? detectOS(nav);
}

/** Texte secondaire avec le raccourci de verrouillage adapté à l'OS. */
export function lockHint(config, os) {
  const shortcut = config.lockShortcuts?.[os];
  if (!shortcut) return config.fullscreenSubtitleFallback;
  return config.fullscreenSubtitle.replace(/\{shortcut\}/g, () => shortcut);
}

/** Thème d'écran de crash à utiliser pour un OS. */
export function crashTheme(os) {
  if (os === 'mac' || os === 'ios') return 'mac';
  if (os === 'linux' || os === 'chromeos' || os === 'android') return 'linux';
  return 'windows';
}
