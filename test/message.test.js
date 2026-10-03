import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../public/js/defaults.js';
import { buildMessage, crashHref, fullscreenHref, readParams, renderTemplate, sanitizeName } from '../public/js/message.js';

test('buildMessage à la première personne, avec croissanteur', () => {
  assert.equal(
    buildMessage(DEFAULT_CONFIG, 'Flo'),
    '🥐 J’ai laissé mon PC déverrouillé et Flo m’a croissanté : je ramène les croissants à toute l’équipe !',
  );
});

test('buildMessage sans croissanteur utilise le template anonyme', () => {
  assert.equal(
    buildMessage(DEFAULT_CONFIG, ''),
    '🥐 J’ai laissé mon PC déverrouillé : je ramène les croissants à toute l’équipe !',
  );
});

test('buildMessage ignore "by" si le champ est désactivé', () => {
  const config = { ...DEFAULT_CONFIG, enableByField: false };
  assert.equal(buildMessage(config, 'Flo'), buildMessage(DEFAULT_CONFIG, ''));
});

test('renderTemplate ne réinterprète pas les motifs spéciaux de replace()', () => {
  assert.equal(renderTemplate('{by} / {by} / {autre}', { by: '$&$1$`' }), '$&$1$` / $&$1$` / {autre}');
});

test('sanitizeName nettoie espaces, contrôles et bidi, et tronque', () => {
  assert.equal(sanitizeName('  Fl\u0000o \n '), 'Fl o');
  assert.equal(sanitizeName('a‮b'), 'a b');
  assert.equal(sanitizeName('x'.repeat(100)), 'x'.repeat(40));
  assert.equal(sanitizeName('🥐'.repeat(5), 3), '🥐🥐🥐');
  assert.equal(sanitizeName(undefined), '');
  assert.equal(sanitizeName(42), '');
});

test('sanitizeName conserve le HTML comme texte brut (affiché via textContent)', () => {
  assert.equal(sanitizeName('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
});

test('readParams lit by (et ignore le reste)', () => {
  assert.deepEqual(readParams('?by=Flo&victim=Lucas'), { by: 'Flo' });
  assert.deepEqual(readParams('?by=%20Jean-Ren%C3%A9%20'), { by: 'Jean-René' });
  assert.deepEqual(readParams(''), { by: '' });
});

test('fullscreenHref / crashHref produisent des URLs relatives encodées', () => {
  assert.equal(fullscreenHref('Flo'), 'croissante?by=Flo');
  assert.equal(fullscreenHref(''), 'croissante');
  assert.equal(crashHref('A&B=C'), 'crash?by=A%26B%3DC');
  assert.deepEqual(readParams(crashHref('é <x>&y').split('?')[1]), { by: 'é <x>&y' });
});
