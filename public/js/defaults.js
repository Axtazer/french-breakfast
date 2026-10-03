// Configuration par défaut, partagée entre le serveur (src/config.js) et le navigateur.
// Tout ce qui est ici est public : ne JAMAIS y mettre de secret.
// Placeholders disponibles dans les templates : {victim} et {by} ({shortcut} pour fullscreenSubtitle).
export const DEFAULT_CONFIG = Object.freeze({
  appName: 'Croissanté',
  tagline: 'Un PC déverrouillé, des croissants pour toute l’équipe.',
  enableByField: true,
  messageTemplate:
    '🥐 {victim} a été croissanté par {by}. Poste laissé déverrouillé : les croissants sont attendus !',
  messageTemplateAnonymous:
    '🥐 {victim} a été croissanté. Poste laissé déverrouillé : les croissants sont attendus !',
  fullscreenTitle: 'A ÉTÉ CROISSANTÉ',
  fullscreenByline: 'par {by}',
  fullscreenSubtitle: 'Pense à {shortcut} la prochaine fois.',
  fullscreenSubtitleFallback: 'Pense à verrouiller ton poste la prochaine fois.',
  lockShortcuts: {
    windows: 'Win + L',
    mac: 'Ctrl + Cmd + Q',
    linux: 'Super + L',
    chromeos: 'Recherche + L',
  },
  enableCrashScreen: true,
  crashStopCode: 'CROISSANTS_NOT_DELIVERED',
  presetNames: [],
  rememberRecentNames: false,
  maxNameLength: 40,
});
