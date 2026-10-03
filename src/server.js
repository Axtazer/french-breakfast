import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.js';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

/** Routes "jolies" -> fichier HTML. */
const PAGE_ROUTES = {
  '/': 'index.html',
  '/croissante': 'croissante.html',
  '/crash': 'crash.html',
};

export const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
});

function makeAsset(body, type) {
  const etag = `"${createHash('sha256').update(body).digest('base64url').slice(0, 27)}"`;
  return { body, type, etag };
}

/**
 * Charge tous les fichiers de public/ en mémoire au démarrage.
 * Seuls ces fichiers peuvent être servis : aucune lecture disque pilotée par l'URL,
 * donc pas de path traversal possible.
 */
function loadAssets(dir = PUBLIC_DIR) {
  const assets = new Map();
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const fullPath = join(entry.parentPath ?? entry.path, entry.name);
    const type = MIME_TYPES[extname(entry.name)];
    if (!type) continue;
    const urlPath = `/${relative(dir, fullPath).split(sep).join('/')}`;
    assets.set(urlPath, makeAsset(readFileSync(fullPath), type));
  }
  return assets;
}

function send(req, res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers, 'Content-Length': Buffer.byteLength(body) });
  res.end(req.method === 'HEAD' ? undefined : body);
}

export function createApp({ config = loadConfig() } = {}) {
  const assets = loadAssets();
  for (const [route, file] of Object.entries(PAGE_ROUTES)) {
    const asset = assets.get(`/${file}`);
    if (!asset) throw new Error(`Fichier manquant dans public/ : ${file}`);
    assets.set(route, asset);
  }
  assets.set('/config.json', makeAsset(Buffer.from(JSON.stringify(config)), MIME_TYPES['.json']));
  const healthBody = JSON.stringify({ status: 'ok' });

  return createServer((req, res) => {
    let pathname;
    try {
      pathname = new URL(req.url, 'http://localhost').pathname;
    } catch {
      return send(req, res, 400, 'Bad Request', { 'Content-Type': MIME_TYPES['.txt'] });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(req, res, 405, 'Method Not Allowed', {
        'Content-Type': MIME_TYPES['.txt'],
        Allow: 'GET, HEAD',
      });
    }

    if (pathname === '/health') {
      return send(req, res, 200, healthBody, {
        'Content-Type': MIME_TYPES['.json'],
        'Cache-Control': 'no-store',
      });
    }

    const asset = assets.get(pathname);
    if (!asset) {
      return send(req, res, 404, 'Not Found', { 'Content-Type': MIME_TYPES['.txt'] });
    }

    const headers = { 'Content-Type': asset.type, 'Cache-Control': 'no-cache', ETag: asset.etag };
    if (req.headers['if-none-match'] === asset.etag) {
      res.writeHead(304, { ...SECURITY_HEADERS, ...headers });
      return res.end();
    }
    return send(req, res, 200, asset.body, headers);
  });
}

function main() {
  const port = Number.parseInt(process.env.PORT ?? '8080', 10);
  const host = process.env.HOST ?? '0.0.0.0';
  const server = createApp();

  server.listen(port, host, () => {
    console.log(`🥐 Croissanté écoute sur http://${host}:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} reçu, arrêt…`);
    server.close(() => process.exit(0));
    server.closeIdleConnections();
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
