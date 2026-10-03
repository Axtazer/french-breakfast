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
      PRESET_NAMES: ' Alex, Camille ,,Sam ',
      REMEMBER_RECENT_NAMES: 'true',
      MAX_NAME_LENGTH: '20',
      MESSAGE_TEMPLATES: "Salut ! Je ramène les croissants, promis.| |Hello ! C'est pour moi.",
    },
    quiet,
  );
  assert.equal(config.appName, 'Chocolatine');
  assert.equal(config.enableByField, false);
  assert.deepEqual(config.presetNames, ['Alex', 'Camille', 'Sam']);
  assert.equal(config.rememberRecentNames, true);
  assert.equal(config.maxNameLength, 20);
  assert.deepEqual(config.messageTemplates, ['Salut ! Je ramène les croissants, promis.', "Hello ! C'est pour moi."]);
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

test('LOCK_SHORTCUTS (JSON) surcharge les raccourcis en gardant les autres', () => {
  const config = loadConfig({ LOCK_SHORTCUTS: '{"mac":"Cmd + Ctrl + Q","linux":42,"amiga":"x"}' }, quiet);
  assert.equal(config.lockShortcuts.mac, 'Cmd + Ctrl + Q');
  assert.equal(config.lockShortcuts.windows, 'Win + L');
  assert.equal(config.lockShortcuts.linux, 'Super + L');
  assert.equal('amiga' in config.lockShortcuts, false);
  assert.deepEqual(loadConfig({ LOCK_SHORTCUTS: 'pas du json' }, quiet).lockShortcuts, DEFAULT_CONFIG.lockShortcuts);
});

test('ENABLE_CRASH_SCREEN et CRASH_STOP_CODE', () => {
  const config = loadConfig({ ENABLE_CRASH_SCREEN: 'false', CRASH_STOP_CODE: 'PAIN_AU_CHOCOLAT' }, quiet);
  assert.equal(config.enableCrashScreen, false);
  assert.equal(config.crashStopCode, 'PAIN_AU_CHOCOLAT');
});

test('MESSAGE_TEMPLATES vide est ignoré', () => {
  assert.deepEqual(loadConfig({ MESSAGE_TEMPLATES: ' | ' }, quiet).messageTemplates, DEFAULT_CONFIG.messageTemplates);
});
