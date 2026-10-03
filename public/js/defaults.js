// Configuration par défaut, partagée entre le serveur (src/config.js) et le navigateur.
// Tout ce qui est ici est public : ne JAMAIS y mettre de secret.
// Le message est envoyé depuis le poste (et donc le compte) de la victime : il doit avoir l'air tapé par elle,
// à la première personne, sans emoji ni mention du croissanteur (qui grillerait la blague).
// Placeholders : {names} dans includeTemplate, {by} dans fullscreenByline, {shortcut} dans fullscreenSubtitle.
export const DEFAULT_CONFIG = Object.freeze({
  appName: 'Croissanté',
  tagline: 'Un PC déverrouillé, des croissants pour toute l’équipe.',
  enableByField: true,
  // Un message est tiré au hasard (bouton 🎲 pour en changer). Il doit sonner comme un vrai message de la victime.
  messageTemplates: [
    "Salut tout le monde ! C'est moi qui ramène les croissants au prochain cours du matin.",
    "Bonjour à tous ! Pour bien commencer la journée, je m'occupe des croissants au prochain cours du matin.",
    "Hello ! Petit-déjeuner offert : je ramène les croissants au prochain cours du matin.",
    "Salut à tous ! Au prochain cours du matin, les croissants sont pour moi.",
    "Bonjour tout le monde ! J'ai envie de vous faire plaisir : croissants pour tout le monde au prochain cours du matin.",
  ],
  // Phrase ajoutée à la fin du message si des collègues sont mentionnés.
  includeTemplate: 'Et oui, même pour {names} !',
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
