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

export function macCrash(ctx) {
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
  );
  return lines;
}

/** Heure du croissantage au format français : "15h42". */
export function formatCrashTime(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}h${mm}`;
}

/** Cible du QR code de l'écran Windows (image statique générée par `npm run qr`). */
export const CRASH_QR_URL = 'https://www.google.com/maps/search/?api=1&query=boulangerie';
