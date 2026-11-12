# syntax=docker/dockerfile:1
# Vendora POS SPA. Build context: ./client, plus the shared nginx config as the
# "nginx" named context:
#   docker build -t vendora/client:<tag> \
#     --build-context nginx=docker/nginx \
#     --build-arg VITE_API_URL=https://api.example.com/api/v1 \
#     client
#
# VITE_* values are inlined into the JS bundle at build time, so they must be
# passed as build args (changing them requires a rebuild). They are public:
# never pass secrets here.

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_API_URL=http://localhost:5000/api/v1
ARG VITE_LANDING_URL=http://localhost:4000
ARG VITE_SUPPORT_EMAIL=support@vendora.com
ARG VITE_APP_URL=http://localhost:4001
ARG VITE_TENANT_APP_URL=http://{shopId}.localhost:4001
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_LANDING_URL=${VITE_LANDING_URL} \
    VITE_APP_URL=${VITE_APP_URL} \
    VITE_TENANT_APP_URL=${VITE_TENANT_APP_URL} \
    VITE_SUPPORT_EMAIL=${VITE_SUPPORT_EMAIL}

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=nginx spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
