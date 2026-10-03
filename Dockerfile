# syntax=docker/dockerfile:1

# Image de base épinglée par digest pour un build reproductible
# (mise à jour automatique proposée par Dependabot, cf. .github/dependabot.yml).
FROM node:26.10.0-alpine3.24@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80

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
