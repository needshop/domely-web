# syntax=docker/dockerfile:1

# Front Domely : build de production (Vite) servi par nginx, sans root.
#
#   docker build -t domely-front --build-arg VITE_API_URL=https://api.example.com/api .
#   docker run --rm -p 8080:8080 domely-front
#
# VITE_API_URL est intégrée au code au moment du build (variable Vite) : une image par
# environnement (recette, production…).

# — Build —
FROM node:24-alpine AS build
WORKDIR /app

# Dépendances d'abord : cette couche reste en cache tant que les package*.json ne changent pas
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=${VITE_API_URL}
# Typecheck puis build de production (dist/)
RUN npm run build

# — Service —
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
