import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../public/js/defaults.js';
import { crashTheme, detectOS, lockHint, parseOSParam, resolveOS } from '../public/js/os.js';

const UA = {
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
  chromeos: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
};

test('detectOS reconnaît les principaux user-agents', () => {
  for (const [os, userAgent] of Object.entries(UA)) {
    assert.equal(detectOS({ userAgent }), os, os);
  }
  assert.equal(detectOS({}), 'unknown');
  assert.equal(detectOS({ userAgent: 'curl/8.0' }), 'unknown');
});

test('detectOS privilégie userAgentData.platform', () => {
  assert.equal(detectOS({ userAgentData: { platform: 'macOS' }, userAgent: UA.windows }), 'mac');
  assert.equal(detectOS({ userAgentData: { platform: 'Windows' }, userAgent: '' }), 'windows');
});

test('parseOSParam applique une liste blanche', () => {
  assert.equal(parseOSParam('mac'), 'mac');
  assert.equal(parseOSParam(' MacOS '), 'mac');
  assert.equal(parseOSParam('win'), 'windows');
  assert.equal(parseOSParam('<script>'), null);
  assert.equal(parseOSParam(null), null);
});

test('resolveOS : ?os= force la détection', () => {
  assert.equal(resolveOS('?os=linux', { userAgent: UA.windows }), 'linux');
  assert.equal(resolveOS('?os=nope', { userAgent: UA.windows }), 'windows');
});

test('lockHint affiche le bon raccourci, ou le texte de repli', () => {
  assert.equal(lockHint(DEFAULT_CONFIG, 'windows'), 'Pense à Win + L la prochaine fois.');
  assert.equal(lockHint(DEFAULT_CONFIG, 'mac'), 'Pense à Ctrl + Cmd + Q la prochaine fois.');
  assert.equal(lockHint(DEFAULT_CONFIG, 'linux'), 'Pense à Super + L la prochaine fois.');
  assert.equal(lockHint(DEFAULT_CONFIG, 'ios'), 'Pense à verrouiller ton poste la prochaine fois.');
  assert.equal(lockHint(DEFAULT_CONFIG, 'unknown'), 'Pense à verrouiller ton poste la prochaine fois.');
});

test('crashTheme associe chaque OS à un écran', () => {
  assert.equal(crashTheme('windows'), 'windows');
  assert.equal(crashTheme('unknown'), 'windows');
  assert.equal(crashTheme('mac'), 'mac');
  assert.equal(crashTheme('ios'), 'mac');
  assert.equal(crashTheme('linux'), 'linux');
  assert.equal(crashTheme('chromeos'), 'linux');
  assert.equal(crashTheme('android'), 'linux');
});
