// Textes des écrans de crash (logique pure, testée sous Node). Toujours insérés via textContent.

/**
 * @param {{ victim: string, by: string, message: string, hint: string, stopCode: string }} ctx
 */
export function windowsCrash(ctx) {
  return {
    victimLine: `${ctx.victim} doit maintenant ramener des croissants à toute l’équipe. Nous collectons simplement quelques informations sur la viennoiserie, puis nous redémarrerons.`,
    message: ctx.message,
    stopCode: ctx.stopCode,
    by: ctx.by ? `Croissanté par : ${ctx.by}` : '',
    hint: `verrouillage.sys — ${ctx.hint}`,
    done: '🥐 Redémarrage impossible tant que les croissants ne sont pas arrivés.',
  };
}

export function macCrash(ctx) {
  return {
    fr: `Vous devez apporter des croissants. ${ctx.victim} a laissé son poste déverrouillé.`,
    en: `You need to bring croissants. ${ctx.victim} left this computer unlocked.`,
    de: `Sie müssen Croissants mitbringen. ${ctx.victim} hat den Rechner nicht gesperrt.`,
    ja: `クロワッサンを持ってくる必要があります。${ctx.victim} はロックせずに席を離れました。`,
    message: ctx.message,
    hint: ctx.hint,
  };
}

export function linuxCrash(ctx) {
  const user = JSON.stringify(ctx.victim);
  const lines = [
    '[    0.000000] Linux version 6.6.6-croissant (boulanger@fournil) (gcc 14.2.0) #1 SMP PREEMPT_DYNAMIC',
    '[    0.004217] Command line: BOOT_IMAGE=/vmlinuz-croissant root=/dev/fournil ro quiet splash',
    `[ 4242.000001] session: user ${user} left the session unlocked`,
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

/** Faux QR code déterministe (purement décoratif) : matrice size × size de booléens. */
export function fakeQrMatrix(seed, size = 25) {
  let h = 2166136261;
  for (const ch of String(seed)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  const next = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) % 100;
  };
  const inFinder = (r, c, r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
  const finderCell = (r, c) => {
    const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
    return ring !== 2;
  };
  const matrix = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const corners = [
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ];
      const corner = corners.find(([r0, c0]) => inFinder(r, c, r0, c0));
      row.push(corner ? finderCell(r - corner[0], c - corner[1]) : next() < 48);
    }
    matrix.push(row);
  }
  return matrix;
}
