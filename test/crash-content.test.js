import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fakeQrMatrix, linuxCrash, macCrash, windowsCrash } from '../public/js/crash-content.js';

const ctx = {
  by: 'Flo',
  message: '🥐 J’ai laissé mon PC déverrouillé et Flo m’a croissanté.',
  hint: 'Pense à Win + L la prochaine fois.',
  stopCode: 'CROISSANTS_NOT_DELIVERED',
};

test('écran Windows : contient croissanteur, message et code d’arrêt', () => {
  const text = windowsCrash(ctx);
  assert.match(text.lead, /^Vous devez maintenant ramener des croissants/);
  assert.equal(text.message, ctx.message);
  assert.equal(text.by, 'Croissanté par : Flo');
  assert.equal(text.stopCode, 'CROISSANTS_NOT_DELIVERED');
  assert.match(text.hint, /Win \+ L/);
  assert.equal(windowsCrash({ ...ctx, by: '' }).by, '');
});

test('écran macOS : texte multilingue', () => {
  const text = macCrash(ctx);
  for (const key of ['fr', 'en', 'de', 'ja']) assert.ok(text[key].length > 0, key);
  assert.match(text.fr, /croissants/);
  assert.equal(text.message, ctx.message);
});

test('écran Linux : log de kernel panic avec le message', () => {
  const lines = linuxCrash(ctx);
  assert.ok(lines.some((l) => l.includes('current user left the session unlocked')));
  assert.ok(lines.some((l) => l.includes('croissanted by "Flo"')));
  assert.ok(lines.some((l) => l.includes(`Kernel panic - not syncing: ${ctx.message}`)));
  assert.match(lines.at(-1), /end Kernel panic - not syncing: CROISSANTS_NOT_DELIVERED/);
  assert.ok(!linuxCrash({ ...ctx, by: '' }).some((l) => l.includes('croissanted by')));
});

test('fakeQrMatrix est déterministe et a ses 3 repères', () => {
  const a = fakeQrMatrix('croissant|Flo');
  assert.deepEqual(a, fakeQrMatrix('croissant|Flo'));
  assert.notDeepEqual(a, fakeQrMatrix('croissant|'));
  assert.equal(a.length, 25);
  assert.ok(a.every((row) => row.length === 25));
  for (const [r, c] of [
    [0, 0],
    [0, 18],
    [18, 0],
  ]) {
    assert.equal(a[r][c], true);
    assert.equal(a[r + 1][c + 1], false);
    assert.equal(a[r + 3][c + 3], true);
  }
});
