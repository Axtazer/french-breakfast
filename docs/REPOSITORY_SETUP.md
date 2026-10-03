# Configuration du dépôt GitHub

Ce qui ne peut pas vivre dans des fichiers du dépôt se règle une fois dans les paramètres GitHub.
Tout est gratuit pour un dépôt public. Compter 5 minutes.

## 1. Règles de merge (rulesets)

Les règles sont versionnées dans [`.github/rulesets/`](../.github/rulesets) et s'importent telles quelles :

**Settings → Rules → Rulesets → New ruleset → Import a ruleset**, puis choisir le fichier JSON.

| Fichier | Effet |
| --- | --- |
| `main-branch.json` | Sur la branche par défaut : pas de suppression ni de force-push, historique linéaire, Pull Request obligatoire, **squash merge uniquement**, conversations résolues avant merge, CI verte et branche à jour (`Lint & tests`, `Docker build & smoke test`). |
| `release-tags.json` | Les tags `v*` ne peuvent être ni supprimés ni déplacés (une version publiée reste immuable). |

Aucune approbation n'est exigée (`required_approving_review_count: 0`) : avec un seul mainteneur, GitHub
n'autorise pas à approuver sa propre PR. Passer à `1` dès qu'il y a un second mainteneur.
Aucun contournement (`bypass_actors`) n'est défini : même l'administrateur passe par une PR. En cas d'urgence,
le ruleset peut être temporairement désactivé (`enforcement: disabled`).

## 2. Options de Pull Request

**Settings → General → Pull Requests** :

- ☐ Allow merge commits
- ☑ Allow squash merging → *Default commit message* : **Pull request title and description**
- ☐ Allow rebase merging
- ☑ Always suggest updating pull request branches
- ☑ Allow auto-merge
- ☑ Automatically delete head branches

## 3. GitHub Actions

**Settings → Actions → General** :

- *Workflow permissions* : **Read repository contents and packages permissions** (les workflows déclarent
  eux-mêmes les droits supplémentaires dont ils ont besoin : `packages: write`, `contents: write`).
- ☐ Allow GitHub Actions to create and approve pull requests
- *Fork pull request workflows* : laisser **Require approval for first-time contributors**.

## 4. Sécurité

**Settings → Advanced Security** (ou *Code security*) :

- ☑ Private vulnerability reporting (utilisé par [SECURITY.md](../SECURITY.md))
- ☑ Dependabot alerts et ☑ Dependabot security updates (les mises à jour régulières sont dans `.github/dependabot.yml`)
- ☑ Secret scanning et ☑ Push protection
- ☑ CodeQL analysis → *Default setup* (JavaScript et GitHub Actions)

## 5. Package GHCR

Après la première publication (premier push sur `main`) :

**Profil → Packages → french-breakfast → Package settings** :

- *Danger Zone → Change visibility* : **Public** (sinon `docker pull` demande une authentification) ;
- *Manage Actions access* : vérifier que le dépôt `french-breakfast` a le rôle **Write**.

## 6. Labels

Les notes de release ([`.github/release.yml`](../.github/release.yml)) sont classées selon les labels des PR.
`bug`, `enhancement` et `dependencies` existent déjà ou sont créés automatiquement ; ajouter
**Issues → Labels → New label** : `breaking-change`.

## 7. Première release

Une fois `main` à jour et la CI verte :

```bash
git tag v1.0.0
git push origin v1.0.0
```

→ image `ghcr.io/axtazer/french-breakfast:1.0.0` (+ `1.0`, `1`, `latest`) et GitHub Release avec notes générées.
