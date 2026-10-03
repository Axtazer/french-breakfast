import { loadConfig } from './config.js';
import { formatCrashTime } from './crash-content.js';
import { blockCopy, fullscreenOnClick, hideIdleCursor, mountCrash } from './crash-view.js';
import { buildMessage, fullscreenHref, readParams } from './message.js';
import { crashTheme, lockHint, resolveOS } from './os.js';

// Accès direct à /crash (lien partagé, favori…). Depuis l'accueil, le bouton CROISSANTER
// affiche le même écran sans changer de page, pour pouvoir passer en plein écran dans le même clic.
async function init() {
  const config = await loadConfig();
  const { by: rawBy, names, index } = readParams(window.location.search, config.maxNameLength);
  const by = config.enableByField ? rawBy : '';

  if (!config.enableCrashScreen) {
    window.location.replace(fullscreenHref(by));
    return;
  }

  const os = resolveOS(window.location.search, navigator);
  const root = document.getElementById('crash-root');
  mountCrash(root, crashTheme(os), {
    by,
    message: buildMessage(config, index, names),
    hint: lockHint(config, os),
    stopCode: config.crashStopCode,
    time: formatCrashTime(),
  });
  hideIdleCursor(document.body);
  blockCopy(document);

  // Ici, pas de geste utilisateur au chargement : le vrai plein écran attend un clic (règle des navigateurs).
  fullscreenOnClick(root);
  const fsButton = document.getElementById('crash-fs');
  if (document.fullscreenEnabled) {
    fsButton.hidden = false;
    fsButton.addEventListener('click', () => document.documentElement.requestFullscreen().catch(() => {}));
  }
}

init();
