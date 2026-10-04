import { test } from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import {
  CRASH_QR_URL,
  androidCrash,
  formatClock,
  formatLongDate,
  formatRetry,
  iosCrash,
  chromeosCrash,
  gnomeCrash,
  formatCrashTime,
  formatMenuBarDate,
  linuxCrash,
  macClassicCrash,
  macCrash,
  windowsCrash,
} from '../public/js/crash-content.js';
import { QR_TEXT } from '../public/js/qr-boulangerie-text.js';

const ctx = {
  by: 'Alex',
  message: '🥐 J’ai laissé mon PC déverrouillé et Alex m’a croissanté.',
  hint: 'Pense à Win + L la prochaine fois.',
  stopCode: 'CROISSANTS_NOT_DELIVERED',
  time: '08h47',
};

test('écran Windows : contient croissanteur, message et code d’arrêt', () => {
  const text = windowsCrash(ctx);
  assert.match(text.lead, /^Vous devez maintenant ramener des croissants/);
  assert.equal(text.message, ctx.message);
  assert.equal(text.by, 'Croissanté par : Alex');
  assert.equal(text.stopCode, 'CROISSANTS_NOT_DELIVERED');
  assert.equal(text.time, 'Heure du croissantage : 08h47');
  assert.match(text.hint, /Win \+ L/);
  assert.equal(windowsCrash({ ...ctx, by: '' }).by, '');
});

test('écran macOS récent : fenêtre « redémarré en raison d’un problème » et rapport détaillé', () => {
  const text = macCrash(ctx);
  assert.equal(text.title, 'Votre ordinateur a redémarré en raison d’un problème.');
  assert.equal(text.ignore, 'Ignorer');
  assert.equal(text.report, 'Signaler…');
  const report = text.reportLines.join('\n');
  assert.match(report, /^panic\(cpu 0/);
  assert.match(report, /Heure du croissantage : 08h47/);
  assert.match(report, /Croissanté par : Alex/);
  assert.match(report, /CROISSANTS_NOT_DELIVERED/);
  assert.ok(report.includes(ctx.message));
  assert.ok(!macCrash({ ...ctx, by: '' }).reportLines.some((l) => l.startsWith('Croissanté par')));
});

test('ancien écran macOS : texte multilingue', () => {
  const text = macClassicCrash(ctx);
  for (const key of ['fr', 'en', 'de', 'ja']) assert.ok(text[key].length > 0, key);
  assert.equal(text.time, 'Croissanté à 08h47');
  assert.equal(text.message, ctx.message);
});

test('écran GNOME : « Oh non ! », message, détails et aide QR', () => {
  const text = gnomeCrash(ctx);
  assert.match(text.title, /^Oh non ! Un problème est survenu/);
  assert.equal(text.message, ctx.message);
  assert.deepEqual(text.details, ['Heure du croissantage : 08h47', 'Croissanté par : Alex', 'Code d’arrêt : CROISSANTS_NOT_DELIVERED']);
  assert.match(text.qrCaption, /boulangerie/);
  assert.equal(gnomeCrash({ ...ctx, by: '' }).details.length, 2);
});

test('écran ChromeOS : récupération, QR code et boutons', () => {
  const text = chromeosCrash(ctx);
  assert.equal(text.title, 'croissantOS est manquant ou endommagé.');
  assert.equal(text.message, ctx.message);
  assert.ok(text.details.includes('Croissanté par : Alex'));
  assert.match(text.qrCaption, /scannez ce code/);
  assert.equal(text.primary, 'Lancer la récupération');
});

test('formatMenuBarDate : date de la barre de menus macOS', () => {
  assert.equal(formatMenuBarDate(new Date(2026, 9, 3, 8, 5)), 'sam. 3 oct. 08:05');
  assert.equal(formatMenuBarDate(new Date(2026, 0, 12, 23, 59)), 'lun. 12 janv. 23:59');
});

test('écran Linux : log de kernel panic avec le message', () => {
  const lines = linuxCrash(ctx);
  assert.ok(lines.some((l) => l.includes('current user left the session unlocked (croissanted at 08h47)')));
  assert.ok(lines.some((l) => l.includes('croissanted by "Alex"')));
  assert.ok(lines.some((l) => l.includes(`Kernel panic - not syncing: ${ctx.message}`)));
  assert.match(lines.at(-2), /end Kernel panic - not syncing: CROISSANTS_NOT_DELIVERED/);
  assert.match(lines.at(-1), /drm_panic: scan the QR code/);
  assert.ok(!linuxCrash({ ...ctx, by: '' }).some((l) => l.includes('croissanted by')));
});

test('formatCrashTime : heure française sur deux chiffres', () => {
  assert.equal(formatCrashTime(new Date(2026, 9, 3, 8, 5)), '08h05');
  assert.equal(formatCrashTime(new Date(2026, 9, 3, 23, 59)), '23h59');
});

test('le QR code pointe vers les boulangeries sur Google Maps', () => {
  assert.equal(CRASH_QR_URL, 'https://www.google.com/maps/search/?api=1&query=boulangerie');
});

test('le QR code texte (écran Linux) encode exactement l’URL des boulangeries', () => {
  // Reconstitue la matrice depuis les demi-blocs : bloc = module clair, vide = module sombre.
  const TOP = { '█': true, '▀': true, '▄': false, ' ': false };
  const BOTTOM = { '█': true, '▀': false, '▄': true, ' ': false };
  const rows = [];
  for (const line of QR_TEXT.split('\n')) {
    const chars = Array.from(line);
    rows.push(chars.map((c) => !TOP[c]), chars.map((c) => !BOTTOM[c]));
  }
  const { size, data } = QRCode.create(CRASH_QR_URL, { errorCorrectionLevel: 'M' }).modules;
  const quiet = 2;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      assert.equal(rows[r + quiet][c + quiet], Boolean(data[r * size + c]), `module ${r},${c}`);
    }
  }
});

test('écran iOS : « iPhone indisponible » / « iPad indisponible »', () => {
  const text = iosCrash({ ...ctx, device: 'iPhone' });
  assert.equal(text.title, 'iPhone indisponible');
  assert.equal(iosCrash({ ...ctx, device: 'iPad' }).title, 'iPad indisponible');
  assert.equal(iosCrash({ ...ctx, device: 'autre' }).title, 'iPhone indisponible');
  assert.equal(text.message, ctx.message);
  assert.ok(text.details.includes('Croissanté par : Alex'));
  assert.match(text.qrBody, /boulangerie/);
});

test('écran Android : « L’interface système ne répond pas »', () => {
  const text = androidCrash(ctx);
  assert.equal(text.title, 'L’interface système ne répond pas');
  assert.equal(text.close, 'Fermer l’application');
  assert.equal(text.wait, 'Attendre');
  assert.equal(text.message, ctx.message);
  assert.equal(androidCrash({ ...ctx, by: '' }).details.length, 2);
});

test('formatRetry, formatLongDate et formatClock', () => {
  assert.equal(formatRetry(15 * 60), 'Réessayez dans 15 minutes');
  assert.equal(formatRetry(14 * 60 + 1), 'Réessayez dans 15 minutes');
  assert.equal(formatRetry(30), 'Réessayez dans 1 minute');
  assert.equal(formatRetry(0), 'Réessayez dans 1 minute');
  assert.equal(formatLongDate(new Date(2026, 9, 4, 8, 5)), 'dimanche 4 octobre');
  assert.equal(formatClock(new Date(2026, 9, 4, 8, 5)), '08:05');
});
