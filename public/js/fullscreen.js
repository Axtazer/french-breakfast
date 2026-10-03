import { loadConfig } from './config.js';
import { readParams, renderTemplate } from './message.js';
import { lockHint, resolveOS } from './os.js';

const $ = (id) => document.getElementById(id);

async function init() {
  const config = await loadConfig();
  const { by } = readParams(window.location.search, config.maxNameLength);
  const shownBy = config.enableByField ? by : '';

  // Toujours textContent : les paramètres d'URL ne sont jamais interprétés comme du HTML.
  $('stage-subject').textContent = config.fullscreenSubject;
  $('stage-title').textContent = config.fullscreenTitle;
  $('stage-subtitle').textContent = lockHint(config, resolveOS(window.location.search, navigator));
  if (shownBy && config.fullscreenByline) {
    $('stage-by').textContent = renderTemplate(config.fullscreenByline, { by: shownBy });
    $('stage-by').hidden = false;
  }
  document.title = `${config.fullscreenSubject} ${config.fullscreenTitle.toLowerCase()}`;

  // Vrai plein écran uniquement sur action explicite de l'utilisateur.
  const fsButton = $('fs-btn');
  if (document.fullscreenEnabled) {
    fsButton.hidden = false;
    fsButton.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch {
        // Refusé par le navigateur : la vue reste en 100vw × 100vh.
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fsButton.textContent = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran';
    });
  }
}

init();
