import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { loadConfig } from '../src/config.js';
import { createApp } from '../src/server.js';

let server;
let base;

before(async () => {
  server = createApp({ config: loadConfig({ APP_NAME: 'Test 🥐' }) });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('GET /health renvoie {"status":"ok"}', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('GET / sert la page d’accueil avec les headers de sécurité', async () => {
  const res = await fetch(`${base}/?by=Zorglub42`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.match(res.headers.get('content-security-policy'), /default-src 'none'/);
  assert.match(res.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
  const html = await res.text();
  assert.match(html, /CROISSANTER/);
  // Les paramètres ne sont jamais injectés côté serveur.
  assert.doesNotMatch(html, /Zorglub42/);
});

test('GET /croissante sert la vue plein écran', async () => {
  const res = await fetch(`${base}/croissante?by=%3Cscript%3E`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /stage-subject/);
  assert.doesNotMatch(html, /<script>/);
});

test('GET /crash sert l’écran de crash', async () => {
  const res = await fetch(`${base}/crash?by=Flo&os=mac`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /crash-windows/);
});

test('GET /config.json expose la configuration publique', async () => {
  const res = await fetch(`${base}/config.json`);
  assert.equal(res.status, 200);
  const config = await res.json();
  assert.equal(config.appName, 'Test 🥐');
  assert.ok(Array.isArray(config.messageTemplates) && config.messageTemplates.length > 0);
});

test('les assets statiques sont servis avec le bon type et un ETag', async () => {
  const res = await fetch(`${base}/js/app.js`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/javascript/);
  const etag = res.headers.get('etag');
  assert.ok(etag);
  const cached = await fetch(`${base}/js/app.js`, { headers: { 'If-None-Match': etag } });
  assert.equal(cached.status, 304);
});

test('404 sur chemin inconnu et tentative de path traversal', async () => {
  assert.equal((await fetch(`${base}/nope`)).status, 404);
  for (const path of ['/../package.json', '/%2e%2e/package.json', '/..%2fsrc/server.js', '/src/server.js']) {
    const status = await new Promise((resolve, reject) => {
      request(`${base}${path}`, (res) => {
        res.resume();
        resolve(res.statusCode);
      })
        .on('error', reject)
        .end();
    });
    assert.equal(status, 404, path);
  }
});

test('405 sur les méthodes non GET/HEAD', async () => {
  const res = await fetch(`${base}/`, { method: 'POST', body: 'x' });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
});

test('HEAD /health ne renvoie pas de corps', async () => {
  const res = await fetch(`${base}/health`, { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), '');
});
