import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../public/js/defaults.js';
import {
  buildMessage,
  fullscreenHref,
  readParams,
  renderTemplate,
  sanitizeName,
} from '../public/js/message.js';

test('buildMessage avec victime et croissanteur', () => {
  assert.equal(
    buildMessage(DEFAULT_CONFIG, 'Lucas', 'Flo'),
    '🥐 Lucas a été croissanté par Flo. Poste laissé déverrouillé : les croissants sont attendus !',
  );
});

test('buildMessage sans croissanteur utilise le template anonyme', () => {
  assert.equal(
    buildMessage(DEFAULT_CONFIG, 'Lucas', ''),
    '🥐 Lucas a été croissanté. Poste laissé déverrouillé : les croissants sont attendus !',
  );
});

test('buildMessage ignore "by" si le champ est désactivé', () => {
  const config = { ...DEFAULT_CONFIG, enableByField: false };
  assert.doesNotMatch(buildMessage(config, 'Lucas', 'Flo'), /Flo/);
});

test('renderTemplate ne réinterprète pas les motifs spéciaux de replace()', () => {
  assert.equal(renderTemplate('{victim} / {by} / {autre}', { victim: '$&$1', by: '$`' }), '$&$1 / $` / {autre}');
});

test('sanitizeName nettoie espaces, contrôles et bidi, et tronque', () => {
  assert.equal(sanitizeName('  Lu\u0000cas \n '), 'Lu cas');
  assert.equal(sanitizeName('a‮b'), 'a b');
  assert.equal(sanitizeName('x'.repeat(100)), 'x'.repeat(40));
  assert.equal(sanitizeName('🥐'.repeat(5), 3), '🥐🥐🥐');
  assert.equal(sanitizeName(undefined), '');
  assert.equal(sanitizeName(42), '');
});

test('sanitizeName conserve le HTML comme texte brut (affiché via textContent)', () => {
  assert.equal(sanitizeName('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
});

test('readParams lit victim et by', () => {
  assert.deepEqual(readParams('?victim=Lucas&by=Flo'), { victim: 'Lucas', by: 'Flo' });
  assert.deepEqual(readParams('?victim=%20Jean-Ren%C3%A9%20'), { victim: 'Jean-René', by: '' });
  assert.deepEqual(readParams(''), { victim: '', by: '' });
});

test('fullscreenHref produit une URL relative encodée', () => {
  assert.equal(fullscreenHref('Lucas', 'Flo'), 'croissante?victim=Lucas&by=Flo');
  assert.equal(fullscreenHref('A&B=C', ''), 'croissante?victim=A%26B%3DC');
  assert.deepEqual(readParams(fullscreenHref('A&B=C', 'é <x>').split('?')[1]), { victim: 'A&B=C', by: 'é <x>' });
});
