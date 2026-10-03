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
    "Salut tout le monde ! La prochaine fois qu'on se voit au p'tit matin, c'est moi qui ramène les croissants.",
    "Bonjour à tous ! Au p'tit matin de nos retrouvailles, je débarque avec les croissants.",
    "Hello ! Petit-déj offert : la prochaine fois qu'on se croise le matin, les croissants sont pour moi.",
    "Salut à tous ! Prochain p'tit matin ensemble = croissants pour tout le monde, c'est moi qui régale.",
    "Bonjour tout le monde ! J'ai envie de vous faire plaisir : au p'tit matin où on se revoit, croissants pour tous.",
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
