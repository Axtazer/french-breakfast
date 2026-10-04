// Textes des écrans de crash (logique pure, testée sous Node). Toujours insérés via textContent.

/**
 * L'écran s'affiche sur le poste de la victime : il s'adresse directement à elle, sans la nommer.
 * @param {{ by: string, message: string, hint: string, stopCode: string, time: string }} ctx
 */
export function windowsCrash(ctx) {
  return {
    lead: 'Vous devez maintenant ramener des croissants à toute l’équipe. Nous collectons simplement quelques informations sur la viennoiserie, puis nous redémarrerons.',
    message: ctx.message,
    stopCode: ctx.stopCode,
    by: ctx.by ? `Croissanté par : ${ctx.by}` : '',
    time: `Heure du croissantage : ${ctx.time}`,
    hint: `verrouillage.sys — ${ctx.hint}`,
    done: '🥐 Redémarrage impossible tant que les croissants ne sont pas arrivés.',
  };
}

/**
 * macOS récent : pas d'écran de panic, le Mac "redémarre" puis affiche la fenêtre système
 * « Votre ordinateur a redémarré en raison d'un problème ».
 */
export function macCrash(ctx) {
  const report = [
    `panic(cpu 0 caller 0xfffffe0042420000): "croissant supply exhausted" @croissantd.c:42`,
    `Heure du croissantage : ${ctx.time}`,
  ];
  if (ctx.by) report.push(`Croissanté par : ${ctx.by}`);
  report.push(
    `Code d’arrêt : ${ctx.stopCode}`,
    'Processus fautif : session déverrouillée',
    `Message : ${ctx.message}`,
    `Conseil : ${ctx.hint}`,
  );
  return {
    title: 'Votre ordinateur a redémarré en raison d’un problème.',
    body: 'Cliquez sur Signaler pour afficher plus de détails et envoyer un rapport à la boulangerie la plus proche.',
    ignore: 'Ignorer',
    report: 'Signaler…',
    ignoreRefused: 'Impossible d’ignorer ce problème : des croissants sont attendus.',
    reportTitle: 'Rapport de problème',
    reportLines: report,
  };
}

/** Ancien macOS (OS X 10.7 et avant) : kernel panic multilingue sur voile gris. */
export function macClassicCrash(ctx) {
  return {
    fr: 'Vous devez apporter des croissants. Ce poste a été laissé déverrouillé.',
    en: 'You need to bring croissants. This computer was left unlocked.',
    de: 'Sie müssen Croissants mitbringen. Dieser Rechner wurde nicht gesperrt.',
    ja: 'クロワッサンを持ってくる必要があります。このコンピュータはロックされていませんでした。',
    message: ctx.message,
    time: `Croissanté à ${ctx.time}`,
    hint: ctx.hint,
  };
}

export function linuxCrash(ctx) {
  const lines = [
    '[    0.000000] Linux version 6.6.6-croissant (boulanger@fournil) (gcc 14.2.0) #1 SMP PREEMPT_DYNAMIC',
    '[    0.004217] Command line: BOOT_IMAGE=/vmlinuz-croissant root=/dev/fournil ro quiet splash',
    `[ 4242.000001] session: current user left the session unlocked (croissanted at ${ctx.time})`,
    '[ 4242.000023] croissant: checking croissant supply... 0 found',
  ];
  if (ctx.by) lines.push(`[ 4242.000031] croissant: session croissanted by ${JSON.stringify(ctx.by)}`);
  lines.push(
    '[ 4242.000058] CPU: 0 PID: 1 Comm: croissantd Tainted: G    B   O  6.6.6-croissant #1',
    '[ 4242.000061] Call Trace:',
    '[ 4242.000062]  <TASK>',
    '[ 4242.000065]  ? leave_desk+0x2a/0x40',
    '[ 4242.000069]  ? forget_lock_screen+0x15/0x20',
    '[ 4242.000072]  ? croissant_debt_init+0x99/0x99',
    '[ 4242.000074]  </TASK>',
    `[ 4242.000080] Kernel panic - not syncing: ${ctx.message}`,
    `[ 4242.000081] Hint: ${ctx.hint}`,
    `[ 4242.000090] ---[ end Kernel panic - not syncing: ${ctx.stopCode} ]---`,
    '[ 4242.000102] drm_panic: scan the QR code to find the nearest bakery',
  );
  return lines;
}

/** Linux de bureau (GNOME) : l'écran « Oh non ! Un problème est survenu… ». */
export function gnomeCrash(ctx) {
  const details = [`Heure du croissantage : ${ctx.time}`];
  if (ctx.by) details.push(`Croissanté par : ${ctx.by}`);
  details.push(`Code d’arrêt : ${ctx.stopCode}`);
  return {
    title: 'Oh non ! Un problème est survenu et le système ne peut pas se rétablir.',
    body: 'Veuillez ramener des croissants, puis vous déconnecter et réessayer.',
    message: ctx.message,
    details,
    hint: ctx.hint,
    qrCaption: 'Besoin d’aide ? Scannez ce code pour trouver une boulangerie à proximité.',
    button: 'Fermer la session',
    refused: 'Impossible de fermer la session : des croissants sont attendus.',
  };
}

/** ChromeOS : l'écran de récupération « ChromeOS est manquant ou endommagé » (avec son QR code). */
export function chromeosCrash(ctx) {
  const details = [`Heure du croissantage : ${ctx.time}`];
  if (ctx.by) details.push(`Croissanté par : ${ctx.by}`);
  details.push(`Code d’erreur : ${ctx.stopCode}`);
  return {
    brand: 'croissantOS',
    title: 'croissantOS est manquant ou endommagé.',
    body: 'Veuillez ramener des croissants à toute l’équipe, puis lancer la récupération.',
    message: ctx.message,
    details,
    hint: ctx.hint,
    qrCaption: 'Pour en savoir plus, scannez ce code avec votre téléphone.',
    primary: 'Lancer la récupération',
    secondary: 'Options avancées',
    refused: 'Récupération impossible : aucun croissant détecté.',
  };
}

/** iPhone / iPad : écran de verrouillage « iPhone indisponible », avec notifications. */
export function iosCrash(ctx) {
  const device = ctx.device === 'iPad' ? 'iPad' : 'iPhone';
  const details = [`Heure du croissantage : ${ctx.time}`];
  if (ctx.by) details.push(`Croissanté par : ${ctx.by}`);
  details.push(`Code : ${ctx.stopCode}`);
  return {
    title: `${device} indisponible`,
    notificationApp: 'CROISSANTÉ',
    notificationTitle: 'Croissants attendus 🥐',
    message: ctx.message,
    details,
    qrApp: 'BOULANGERIES',
    qrBody: 'Scannez ce code pour trouver une boulangerie à proximité.',
    emergency: 'Urgence',
    forgot: 'Code oublié ?',
    refused: `${device} indisponible : ramenez d’abord des croissants.`,
  };
}

/** Android : fenêtre « L'interface système ne répond pas » sur l'écran d'accueil. */
export function androidCrash(ctx) {
  const details = [`Heure du croissantage : ${ctx.time}`];
  if (ctx.by) details.push(`Croissanté par : ${ctx.by}`);
  details.push(`Code : ${ctx.stopCode}`);
  return {
    title: 'L’interface système ne répond pas',
    message: ctx.message,
    details,
    qrCaption: 'Scannez ce code pour trouver une boulangerie à proximité.',
    close: 'Fermer l’application',
    wait: 'Attendre',
    refusedClose: 'Impossible de fermer : des croissants sont attendus.',
    refusedWait: 'Toujours en attente des croissants…',
  };
}

/** Compte à rebours de l'écran iOS : "Réessayez dans 15 minutes" / "dans 1 minute". */
export function formatRetry(secondsLeft) {
  const minutes = Math.max(1, Math.ceil(secondsLeft / 60));
  return `Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
}

const LONG_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const LONG_MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** Date longue des écrans de téléphone : "samedi 4 octobre". */
export function formatLongDate(date = new Date()) {
  return `${LONG_DAYS[date.getDay()]} ${date.getDate()} ${LONG_MONTHS[date.getMonth()]}`;
}

/** Heure façon téléphone : "08:47". */
export function formatClock(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Heure du croissantage au format français : "15h42". */
export function formatCrashTime(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}h${mm}`;
}

const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Date de la barre de menus macOS : "sam. 3 oct. 16:12". */
export function formatMenuBarDate(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${hh}:${mm}`;
}

/** Cible du QR code de l'écran Windows (image statique générée par `npm run qr`). */
export const CRASH_QR_URL = 'https://www.google.com/maps/search/?api=1&query=boulangerie';
