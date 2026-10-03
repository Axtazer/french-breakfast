# Contribuer à Croissanté 🥐

Merci ! Le projet reste volontairement minuscule : pas de framework, pas de dépendance runtime, pas de ressource externe.

## Prérequis

- Node.js ≥ 22 (`.nvmrc` fourni : `nvm use`)
- Docker (facultatif, pour tester l'image)

```bash
npm install
npm run dev     # http://localhost:8080
npm run check   # lint + tests, à lancer avant chaque push
```

## Workflow

1. Créer une branche depuis `main` : `feat/…`, `fix/…`, `docs/…`, `ci/…`, `chore/…`.
2. Ouvrir une Pull Request vers `main` (le template liste les vérifications).
3. La CI doit être verte : **Lint & tests** et **Docker build & smoke test**.
4. Merge en **squash** uniquement : le titre de la PR devient le message du commit sur `main`.
   → Écrire le titre au format [Conventional Commits](https://www.conventionalcommits.org/fr/) :
   `feat: ajoute un écran de crash ChromeOS`, `fix: corrige la copie sous Firefox`, `docs: …`.

`main` est protégée : pas de push direct, pas de force-push, historique linéaire, conversations résolues avant merge
(voir [docs/REPOSITORY_SETUP.md](docs/REPOSITORY_SETUP.md)).

## Règles du code

- **Sécurité** : jamais de `innerHTML` (ESLint l'interdit) ; toute donnée utilisateur passe par `textContent`/`value`.
- **Aucune ressource externe** : pas de CDN, de Google Fonts, d'analytics. La CSP l'empêche de toute façon.
- **Aucun secret** dans le dépôt : tout ce qui est dans la configuration est public (`/config.json`).
- La logique pure (messages, détection d'OS, textes des écrans de crash) vit dans des modules sans DOM
  (`public/js/message.js`, `os.js`, `crash-content.js`) et doit être couverte par des tests dans `test/`.
- Style : `.editorconfig` (2 espaces, LF, UTF-8).

## Publier une version

Semantic Versioning, depuis `main` à jour :

```bash
npm version 1.2.0 --no-git-tag-version   # met à jour package.json, à merger via PR
git tag v1.2.0
git push origin v1.2.0
```

Le tag déclenche la publication de l'image (`1.2.0`, `1.2`, `1`, `latest`) et la création d'une GitHub Release
avec notes générées. Les tags `v*` sont protégés : ils ne peuvent être ni déplacés ni supprimés.
