import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../public/js/defaults.js';
import {
  buildMessage,
  crashHref,
  fullscreenHref,
  joinNames,
  parseNames,
  pickTemplateIndex,
  readParams,
  renderTemplate,
  sanitizeName,
} from '../public/js/message.js';

test('les messages par défaut ressemblent à un vrai message de la victime', () => {
  for (const template of DEFAULT_CONFIG.messageTemplates) {
    assert.match(template, /^(Salut|Bonjour|Hello)/);
    assert.match(template, /croissants/);
    assert.doesNotMatch(template, /croissanté|\{by\}/);
  }
});

test('buildMessage sélectionne le template par index (modulo)', () => {
  const config = { ...DEFAULT_CONFIG, messageTemplates: ['A.', 'B.'] };
  assert.equal(buildMessage(config, 0), 'A.');
  assert.equal(buildMessage(config, 1), 'B.');
  assert.equal(buildMessage(config, 3), 'B.');
  assert.equal(buildMessage(config, -1), 'B.');
});

test('buildMessage ajoute la phrase de mention des collègues', () => {
  assert.equal(
    buildMessage(DEFAULT_CONFIG, 0, ['Camille', 'Sam', 'Léo']),
    "Salut tout le monde ! La prochaine fois qu'on se voit au p'tit matin, c'est moi qui ramène les croissants. Et oui, même pour Camille, Sam et Léo !",
  );
  assert.equal(buildMessage({ ...DEFAULT_CONFIG, includeTemplate: '' }, 0, ['Camille']), DEFAULT_CONFIG.messageTemplates[0]);
});

test('parseNames découpe virgules, point-virgules et "et"', () => {
  assert.deepEqual(parseNames('camille, sam et léo'), ['camille', 'sam', 'léo']);
  assert.deepEqual(parseNames('A;B & C, , A'), ['A', 'B', 'C']);
  assert.deepEqual(parseNames('Étienne'), ['Étienne']);
  assert.deepEqual(parseNames(''), []);
  assert.deepEqual(parseNames(null), []);
  assert.equal(parseNames(Array.from({ length: 20 }, (_, i) => `n${i}`).join(',')).length, 10);
});

test('joinNames formate en français', () => {
  assert.equal(joinNames([]), '');
  assert.equal(joinNames(['A']), 'A');
  assert.equal(joinNames(['A', 'B']), 'A et B');
  assert.equal(joinNames(['A', 'B', 'C']), 'A, B et C');
});

test('pickTemplateIndex évite de répéter le message précédent', () => {
  assert.equal(pickTemplateIndex(1, 0), 0);
  assert.equal(pickTemplateIndex(5, -1, () => 0.5), 2);
  assert.equal(pickTemplateIndex(5, 2, () => 0.5), 3);
  assert.equal(pickTemplateIndex(5, 4, () => 0.99), 0);
});

test('renderTemplate ne réinterprète pas les motifs spéciaux de replace()', () => {
  assert.equal(renderTemplate('par {by} / {autre}', { by: '$&$1$`' }), 'par $&$1$` / {autre}');
});

test('sanitizeName nettoie espaces, contrôles et bidi, et tronque', () => {
  assert.equal(sanitizeName('  Fl\u0000o \n '), 'Fl o');
  assert.equal(sanitizeName('a‮b'), 'a b');
  assert.equal(sanitizeName('x'.repeat(100)), 'x'.repeat(40));
  assert.equal(sanitizeName('🥐'.repeat(5), 3), '🥐🥐🥐');
  assert.equal(sanitizeName(undefined), '');
  assert.equal(sanitizeName('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
});

test('readParams lit by, with et m sans leur faire confiance', () => {
  assert.deepEqual(readParams('?by=Alex&with=Camille,Sam&m=3'), { by: 'Alex', names: ['Camille', 'Sam'], index: 3 });
  assert.deepEqual(readParams('?m=-1'), { by: '', names: [], index: 0 });
  assert.deepEqual(readParams('?m=abc'), { by: '', names: [], index: 0 });
  assert.deepEqual(readParams('?m=999'), { by: '', names: [], index: 0 });
});

test('les liens sont relatifs et réversibles', () => {
  assert.equal(fullscreenHref('Alex'), 'croissante?by=Alex');
  assert.equal(fullscreenHref(''), 'croissante');
  assert.equal(crashHref(), 'crash');
  const href = crashHref({ by: 'A&B', names: ['Camille', 'é <x>'], index: 2 });
  assert.equal(href, 'crash?by=A%26B&with=Camille%2C%C3%A9+%3Cx%3E&m=2');
  assert.deepEqual(readParams(href.split('?')[1]), { by: 'A&B', names: ['Camille', 'é <x>'], index: 2 });
});
