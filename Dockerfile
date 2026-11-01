# syntax=docker/dockerfile:1

# Image de base épinglée par digest pour un build reproductible
# (mise à jour automatique proposée par Dependabot, cf. .github/dependabot.yml).
FROM node:26.13.0-alpine3.24@sha256:c6ad9e9c1d80f6eb607c26b4b0a132ff7a2344fad1c78ea3baa2a7d4c8de6d94

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

WORKDIR /app

# Aucune dépendance runtime : pas de npm install, uniquement le code nécessaire.
# Les fichiers appartiennent à root et sont en lecture seule pour l'utilisateur d'exécution.
COPY package.json ./
COPY src ./src
COPY public ./public

# Utilisateur non-root "node" (UID numérique pour runAsNonRoot côté Kubernetes).
USER 1000:1000

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "src/healthcheck.js"]

CMD ["node", "src/server.js"]
