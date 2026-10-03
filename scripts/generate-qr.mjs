// Génère le QR code statique de l'écran de crash Windows (public/img/qr-boulangerie.svg).
// Usage : npm run qr   (à relancer uniquement si l'URL ou les couleurs changent)
import { writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { CRASH_QR_URL } from '../public/js/crash-content.js';

const TARGET_URL = CRASH_QR_URL;
const OUTPUT = new URL('../public/img/qr-boulangerie.svg', import.meta.url);

const svg = await QRCode.toString(TARGET_URL, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  // Modules orange sur fond blanc, assortis à l'écran de crash.
  color: { dark: '#dc4c00', light: '#ffffff' },
});

writeFileSync(OUTPUT, `${svg.trim()}\n`);
console.log(`QR code écrit dans ${OUTPUT.pathname} -> ${TARGET_URL}`);
