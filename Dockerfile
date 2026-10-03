# syntax=docker/dockerfile:1

# Image de base épinglée par digest pour un build reproductible
# (mise à jour automatique proposée par Dependabot, cf. .github/dependabot.yml).
FROM node:22.23.3-alpine3.24@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402

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
