# Politique de sécurité

## Versions supportées

Seule la dernière version publiée (`latest` sur GHCR) reçoit des correctifs.

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique**. Utilisez le signalement privé de GitHub :
[Security → Report a vulnerability](https://github.com/Axtazer/french-breakfast/security/advisories/new).

Indiquez la version concernée, les étapes de reproduction et l'impact estimé. Une réponse est donnée dès que possible.

## Périmètre

L'application ne stocke aucune donnée et n'a besoin d'aucun secret. Sont notamment dans le périmètre :
XSS (paramètres d'URL, configuration), contournement de la CSP, path traversal sur le serveur statique,
problèmes de l'image Docker ou du workflow de publication.
