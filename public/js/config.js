import { DEFAULT_CONFIG } from './defaults.js';

/** Charge /config.json (relatif) ; repli sur les valeurs par défaut en cas d'échec. */
export async function loadConfig() {
  try {
    const res = await fetch('config.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ...DEFAULT_CONFIG, ...(await res.json()) };
  } catch (err) {
    console.warn('config.json indisponible, configuration par défaut utilisée.', err);
    return { ...DEFAULT_CONFIG };
  }
}
