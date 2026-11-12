# syntax=docker/dockerfile:1
# Vendora API (NestJS 11). Build context: ./server
#   docker build -t vendora/server:<tag> server

ARG NODE_IMAGE=node:20-alpine

# ---- deps: full dependency tree (dev deps are needed by `nest build`) ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# bcrypt is a native module; build tools cover the case where no prebuilt
# musl binary is available.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile TypeScript to dist/ ----
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: production dependencies + compiled output only ----
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    PORT=5000
WORKDIR /app

COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && npm cache clean --force \
    && apk del .build-deps

COPY --from=build /app/dist ./dist

# Run as the unprivileged "node" user (uid 1000) shipped with the official
# image. App files stay root-owned, so the process cannot modify its own code.
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/v1/health/liveness" || exit 1

CMD ["node", "dist/main"]
