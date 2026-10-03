// Génère les QR codes statiques des écrans de crash :
//  - public/img/qr-boulangerie.svg  : image (écran Windows) ;
//  - public/js/qr-boulangerie-text.js : version texte en demi-blocs Unicode, façon `qrencode -t UTF8`
//    (écran Linux, comme le QR code de l'écran de panic du noyau).
// Usage : npm run qr   (à relancer uniquement si l'URL ou les couleurs changent)
import { writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { CRASH_QR_URL } from '../public/js/crash-content.js';

const TARGET_URL = CRASH_QR_URL;
const SVG_OUTPUT = new URL('../public/img/qr-boulangerie.svg', import.meta.url);
const TEXT_OUTPUT = new URL('../public/js/qr-boulangerie-text.js', import.meta.url);
const QUIET_ZONE = 2;

const svg = await QRCode.toString(TARGET_URL, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: QUIET_ZONE,
  // Modules orange sur fond blanc, assortis à l'écran de crash.
  color: { dark: '#dc4c00', light: '#ffffff' },
});
writeFileSync(SVG_OUTPUT, `${svg.trim()}\n`);

// Version texte, prévue pour du texte clair sur fond noir (console) : les modules "clairs" sont dessinés
// avec des blocs, les modules "sombres" restent vides. Deux lignes de modules par ligne de texte.
const { size, data } = QRCode.create(TARGET_URL, { errorCorrectionLevel: 'M' }).modules;
const isDark = (row, col) =>
  row >= 0 && col >= 0 && row < size && col < size ? Boolean(data[row * size + col]) : false;
const lines = [];
for (let row = -QUIET_ZONE; row < size + QUIET_ZONE; row += 2) {
  let line = '';
  for (let col = -QUIET_ZONE; col < size + QUIET_ZONE; col += 1) {
    const topLight = !isDark(row, col);
    const bottomLight = row + 1 < size + QUIET_ZONE ? !isDark(row + 1, col) : false;
    line += topLight && bottomLight ? '█' : topLight ? '▀' : bottomLight ? '▄' : ' ';
  }
  lines.push(line);
}
writeFileSync(
  TEXT_OUTPUT,
  `// Fichier généré par scripts/generate-qr.mjs (npm run qr) : ne pas modifier à la main.\n` +
    `// QR code de ${TARGET_URL}, en demi-blocs Unicode (texte clair sur fond sombre).\n` +
    `export const QR_TEXT = ${JSON.stringify(lines.join('\n'))};\n`,
);

console.log(`QR codes générés -> ${TARGET_URL}`);
