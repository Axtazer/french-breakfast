import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CONFIG, loadConfig } from '../src/config.js';

const quiet = { warn: () => {} };

test('sans surcharge, la config vaut les défauts', () => {
  assert.deepEqual(loadConfig({}, quiet), DEFAULT_CONFIG);
});

test('les variables d’environnement surchargent la config', () => {
  const config = loadConfig(
    {
      APP_NAME: 'Chocolatine',
      ENABLE_BY_FIELD: 'false',
      PRESET_NAMES: ' Lucas, Flo ,,Sam ',
      REMEMBER_RECENT_NAMES: 'true',
      MAX_NAME_LENGTH: '20',
      MESSAGE_TEMPLATE: '{victim} <- {by}',
    },
    quiet,
  );
  assert.equal(config.appName, 'Chocolatine');
  assert.equal(config.enableByField, false);
  assert.deepEqual(config.presetNames, ['Lucas', 'Flo', 'Sam']);
  assert.equal(config.rememberRecentNames, true);
  assert.equal(config.maxNameLength, 20);
  assert.equal(config.messageTemplate, '{victim} <- {by}');
});

test('les valeurs invalides sont ignorées', () => {
  const warnings = [];
  const config = loadConfig({ ENABLE_BY_FIELD: 'peut-être', MAX_NAME_LENGTH: '-3' }, { warn: (m) => warnings.push(m) });
  assert.equal(config.enableByField, true);
  assert.equal(config.maxNameLength, 40);
  assert.equal(warnings.length, 2);
});

test('CONFIG_FILE est chargé, puis surchargé par l’environnement', () => {
  const dir = mkdtempSync(join(tmpdir(), 'croissante-'));
  const file = join(dir, 'config.json');
  writeFileSync(file, JSON.stringify({ appName: 'Fichier', presetNames: ['Ana'], inconnu: 1 }));
  const config = loadConfig({ CONFIG_FILE: file, APP_NAME: 'Env' }, quiet);
  assert.equal(config.appName, 'Env');
  assert.deepEqual(config.presetNames, ['Ana']);
  assert.equal('inconnu' in config, false);
});
