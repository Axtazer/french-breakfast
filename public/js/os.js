// Détection de l'OS, 100 % locale (rien n'est envoyé au serveur). Logique pure, testée sous Node.

export const KNOWN_OS = Object.freeze([
  'windows',
  'mac',
  'mac-classic',
  'linux',
  'linux-console',
  'chromeos',
  'ios',
  'android',
]);

/**
 * Devine l'OS à partir de l'objet navigator.
 * Approximatif par nature (user-agent falsifiable, iPadOS se présente comme macOS) : sans enjeu ici.
 */
export function detectOS(nav = {}) {
  // userAgentData.platform (Chromium) est plus fiable que le user-agent : prioritaire s'il est renseigné.
  const hint = String(nav.userAgentData?.platform ?? '').toLowerCase();
  const ua = String(nav.userAgent ?? '').toLowerCase();
  const os = (hint && matchOS(hint)) || matchOS(ua) || 'unknown';
  // iPadOS se présente comme un Mac : un "Mac" avec écran tactile est un iPad.
  if (os === 'mac' && nav.maxTouchPoints > 1) return 'ios';
  // La plateforme seule ne donne pas la version de macOS : on la cherche dans le user-agent.
  return os === 'mac' && isClassicMac(ua) ? 'mac-classic' : os;
}

function matchOS(source) {
  if (/cros|chrome os|chromeos/.test(source)) return 'chromeos';
  if (/android/.test(source)) return 'android';
  if (/iphone|ipad|ipod|\bios\b/.test(source)) return 'ios';
  if (/windows|win32|win64/.test(source)) return 'windows';
  if (/mac ?os|macintosh|mac os x/.test(source)) return isClassicMac(source) ? 'mac-classic' : 'mac';
  if (/linux|x11|ubuntu|fedora/.test(source)) return 'linux';
  return null;
}

/**
 * Ancien macOS (OS X 10.7 Lion et avant), seul cas détectable : depuis 2020, Safari et Firefox
 * annoncent tous "Mac OS X 10_15_7" quelle que soit la vraie version, donc tout le reste est "récent".
 */
function isClassicMac(source) {
  const match = /mac os x (\d+)[._](\d+)/.exec(source);
  return Boolean(match) && Number(match[1]) === 10 && Number(match[2]) <= 7;
}

/** Valide une valeur ?os= fournie dans l'URL (liste blanche). */
export function parseOSParam(value) {
  const v = String(value ?? '').trim().toLowerCase();
  const aliases = {
    win: 'windows',
    macos: 'mac',
    osx: 'mac',
    macclassic: 'mac-classic',
    gnome: 'linux',
    console: 'linux-console',
    iphone: 'ios',
    ipad: 'ios',
    cros: 'chromeos',
  };
  const os = aliases[v] ?? v;
  return KNOWN_OS.includes(os) ? os : null;
}

/** OS effectif : paramètre ?os= s'il est valide, sinon détection. */
export function resolveOS(search, nav) {
  return parseOSParam(new URLSearchParams(search).get('os')) ?? detectOS(nav);
}

/** Texte secondaire avec le raccourci de verrouillage adapté à l'OS. */
export function lockHint(config, os) {
  const shortcut = config.lockShortcuts?.[os === 'linux-console' ? 'linux' : os];
  if (!shortcut) return config.fullscreenSubtitleFallback;
  return config.fullscreenSubtitle.replace(/\{shortcut\}/g, () => shortcut);
}

/** "iPad" ou "iPhone", pour les textes de l'écran iOS (?os=ipad / ?os=iphone forcent le choix). */
export function appleDeviceName(search = '', nav = {}) {
  const forced = String(new URLSearchParams(search).get('os') ?? '').toLowerCase();
  if (forced === 'ipad') return 'iPad';
  if (forced === 'iphone') return 'iPhone';
  const ua = String(nav.userAgent ?? '').toLowerCase();
  const isIpad = /ipad/.test(ua) || (/macintosh/.test(ua) && nav.maxTouchPoints > 1);
  return isIpad ? 'iPad' : 'iPhone';
}

/** Thème d'écran de crash à utiliser pour un OS. */
export function crashTheme(os) {
  if (os === 'mac') return 'mac';
  if (os === 'ios') return 'ios';
  if (os === 'android') return 'android';
  if (os === 'mac-classic') return 'mac-classic';
  if (os === 'chromeos') return 'chromeos';
  // Linux de bureau : écran GNOME ; console (kernel panic + QR texte) sur demande.
  if (os === 'linux') return 'gnome';
  if (os === 'linux-console') return 'linux';
  return 'windows';
}
