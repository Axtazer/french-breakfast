// Configuration par défaut, partagée entre le serveur (src/config.js) et le navigateur.
// Tout ce qui est ici est public : ne JAMAIS y mettre de secret.
// Le message est envoyé depuis le poste (et donc le compte) de la victime : il est écrit à la première personne.
// Placeholders : {by} (croissanteur) dans les templates, {shortcut} dans fullscreenSubtitle.
export const DEFAULT_CONFIG = Object.freeze({
  appName: 'Croissanté',
  tagline: 'Un PC déverrouillé, des croissants pour toute l’équipe.',
  enableByField: true,
  messageTemplate:
    '🥐 J’ai laissé mon PC déverrouillé et {by} m’a croissanté : je ramène les croissants à toute l’équipe !',
  messageTemplateAnonymous:
    '🥐 J’ai laissé mon PC déverrouillé : je ramène les croissants à toute l’équipe !',
  fullscreenSubject: 'Ce PC',
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
