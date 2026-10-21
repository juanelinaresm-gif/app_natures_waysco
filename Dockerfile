# syntax=docker/dockerfile:1
# Imagen de producción para Railway (basada en https://docs.railway.com/guides/react).
# Etapa 1 compila con Node; etapa 2 sirve solo dist/ con Caddy.

# --- Etapa 1: build ---------------------------------------------------------
# Misma versión de Node con la que se generó package-lock.json.
FROM node:24.12.0-alpine3.23 AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# El contexto lo limita .dockerignore: código, configuración y solo los medios que usa la página.
COPY . ./

# Las pruebas fallan si falta algún medio declarado (imágenes, póster o video), y luego se compila.
# No se usa Chrome ni ImageMagick: los derivados ya están generados en public/.
RUN npm test && npm run build

# --- Etapa 2: servidor ------------------------------------------------------
FROM caddy:2.11.7-alpine

COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

COPY --from=build /app/dist /srv

# Railway define PORT; 3000 es el valor local por defecto (ver Caddyfile).
EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
