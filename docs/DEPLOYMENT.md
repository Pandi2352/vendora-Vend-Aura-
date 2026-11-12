# Deployment & CI

Vendora ships as three container images plus MongoDB:

| Service | Image | Port | What it is |
| :--- | :--- | :---: | :--- |
| `server` | `vendora/server` (node:20-alpine) | 5000 | NestJS API, prefix `/api/v1` |
| `client` | `vendora/client` (nginx:alpine) | 4001 → 80 | POS SPA (static) |
| `landing` | `vendora/landing` (nginx:alpine) | 4000 → 80 | Marketing site + `/admin` console SPA (static) |
| `mongo` | `mongo:7` | internal only | Single-node replica set `rs0` |

Relevant files:

- `docker-compose.yml`: the whole stack on one host
- `.env.docker.example`: every variable compose reads (copy to `.env`)
- `server/Dockerfile`, `client/Dockerfile`, `landing/Dockerfile` (+ a `.dockerignore` in each project)
- `docker/nginx/spa.conf`: nginx config shared by both SPA images
- `.github/workflows/ci.yml`: CI pipeline

---

## 1. Run the stack locally with Docker Compose

Requires Docker with Compose v2.17+ (the SPA builds use `additional_contexts`).

```bash
cp .env.docker.example .env
# Fill in at least JWT_SECRET and JWT_REFRESH_SECRET (two different values, >= 32 chars):
#   openssl rand -hex 32
# Set PLATFORM_ADMIN_USERNAME / PLATFORM_ADMIN_PASSWORD to use the /admin console.

docker compose up -d --build
docker compose ps            # mongo should report "healthy" before server starts
docker compose logs -f server
```

Then open:

- Landing: http://localhost:4000 (super admin: http://localhost:4000/admin)
- POS: http://localhost:4001
- API: http://localhost:5000/api/v1/health
- Swagger: http://localhost:5000/docs, only when `SWAGGER_ENABLED=true` or `NODE_ENV` is not `production`

Notes:

- The root `.env` is only for Compose. It is git-ignored; never commit it.
- Compose refuses to start (`required variable JWT_SECRET is missing a value`) until the JWT secrets are set.
- The mongo healthcheck runs `rs.initiate()` on first boot. It does nothing if the set already exists, and it only reports healthy once the node is the writable primary. The server waits for that.
- MongoDB is not published to the host. The replica set advertises itself as `mongo:27017`, which only resolves inside the Compose network. To inspect data, use `docker compose exec mongo mongosh vendora`.
- With `SMTP_USER`/`SMTP_PASS` empty, OTPs and welcome credentials are written to the server log (`docker compose logs server`) instead of being emailed.
- `docker compose down` keeps the data volumes. `docker compose down -v` deletes the database.

### Building images without Compose

The SPA Dockerfiles take the shared nginx config as a named build context:

```bash
docker build -t vendora/server:1.4.0 server
docker build -t vendora/client:1.4.0 --build-context nginx=docker/nginx \
  --build-arg VITE_API_URL=https://api.example.com/api/v1 \
  --build-arg VITE_LANDING_URL=https://example.com \
  --build-arg VITE_APP_URL=https://app.example.com \
  --build-arg 'VITE_TENANT_APP_URL=https://{shopId}.example.com' \
  --build-arg VITE_SUPPORT_EMAIL=support@example.com client
docker build -t vendora/landing:1.4.0 --build-context nginx=docker/nginx \
  --build-arg VITE_API_URL=https://api.example.com/api/v1 \
  --build-arg VITE_POS_URL=https://app.example.com \
  --build-arg 'VITE_TENANT_APP_URL=https://{shopId}.example.com' landing
```

---

## 2. Environment variables

### Server (runtime, `server/.env` in dev, container env in Docker)

At startup, `server/src/common/config/env.validation.ts` checks the following and refuses to boot if any check fails:

| Variable | Required | Notes |
| :--- | :---: | :--- |
| `MONGO_URI` | yes | Must point at a **replica set** in production, e.g. `mongodb://mongo:27017/vendora?replicaSet=rs0` or an Atlas SRV URI |
| `JWT_SECRET` | yes | Access-token secret. Must differ from `JWT_REFRESH_SECRET`. Needs at least 32 chars when `NODE_ENV=production` |
| `JWT_REFRESH_SECRET` | yes | Refresh-token secret. Same rules as above |
| `PORT` | no (5000) | Must be numeric |
| `NODE_ENV` | no | `production` turns on the strict secret check, CSP and the Swagger lock (see below). The server image defaults to `production` |

Optional, read by individual modules:

| Variable | Default | Used for |
| :--- | :--- | :--- |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | `15m` / `7d` | Token lifetimes |
| `PLATFORM_ADMIN_USERNAME` / `PLATFORM_ADMIN_PASSWORD` | unset | Super admin console login. Login is rejected while unset |
| `CORS_ORIGINS` | unset (= allow any origin) | Comma-separated fixed browser origins (landing + POS store finder). Store subdomains from `TENANT_APP_URL` are added automatically. **Always set this in production** |
| `TENANT_APP_URL` | `http://{shopId}.localhost:4001` | Each store's own address; `{shopId}` becomes the Shop ID (production `https://{shopId}.vendora.com`). Used in welcome and password-reset emails, in CORS, and to refuse sign-ins sent from another store's address |
| `SWAGGER_ENABLED` | – | `true` exposes `/docs` even in production |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (or `MAIL_FROM`) | port 587 | Outgoing mail. With no user/pass, mail is only logged. Port 465 uses implicit TLS |

### Client (build time, `client/.env` in dev, `--build-arg` in Docker)

| Variable | Example |
| :--- | :--- |
| `VITE_API_URL` | `https://api.example.com/api/v1` |
| `VITE_LANDING_URL` | `https://example.com` |
| `VITE_APP_URL` | `https://app.example.com` ("find your store" page) |
| `VITE_TENANT_APP_URL` | `https://{shopId}.example.com` (must match the server's `TENANT_APP_URL`) |
| `VITE_SUPPORT_EMAIL` | `support@example.com` |

### Landing (build time)

| Variable | Example |
| :--- | :--- |
| `VITE_API_URL` | `https://api.example.com/api/v1` |
| `VITE_POS_URL` | `https://app.example.com` ("find your store" page) |
| `VITE_TENANT_APP_URL` | `https://{shopId}.example.com` |

`VITE_*` values are compiled into the JavaScript bundle. They are public, so never put secrets in them. Changing one requires rebuilding the image. In Compose they come from `PUBLIC_API_URL`, `PUBLIC_LANDING_URL`, `PUBLIC_POS_URL`, `PUBLIC_TENANT_APP_URL` and `PUBLIC_SUPPORT_EMAIL`.

---

## 3. Production notes

- **Replica set is mandatory.** Billing, returns, GRNs and invoice numbering run in MongoDB transactions. On a standalone `mongod`, the server logs a warning and runs them without a transaction, so a failure part-way through can leave partial writes. Use a replica set: the bundled single-node `rs0`, a self-managed 3-node set, or Atlas.
- **`NODE_ENV=production`** (the server image default):
  - The server refuses to start if `JWT_SECRET` or `JWT_REFRESH_SECRET` is shorter than 32 characters. The two must always differ.
  - Swagger (`/docs`) is not mounted unless `SWAGGER_ENABLED=true`.
  - Helmet's Content-Security-Policy is enabled. It is relaxed only outside production, for the Swagger UI.
- **CORS:** set `CORS_ORIGINS` to the exact landing and POS origins. If it is empty, the API reflects any origin.
- **Store addresses (one subdomain per store):** every store is served at `https://<shopId>.vendora.com`. For that you need:
  - a wildcard DNS record `*.vendora.com` pointing at the proxy that serves the POS container (plus `app.vendora.com` for the store finder);
  - a wildcard TLS certificate for `*.vendora.com` (Let's Encrypt issues these with a DNS-01 challenge);
  - `TENANT_APP_URL=https://{shopId}.vendora.com` on the server and the same value as `VITE_TENANT_APP_URL` in both frontends.
  The POS container serves every store from one build (nginx `server_name _`); the page reads the Shop ID from its address. Reserved names such as `www`, `app`, `api` and `admin` can never be Shop IDs.
- **Local development:** browsers resolve any `*.localhost` name to this machine, so `http://kmart.localhost:4001` works with the normal `npm run dev`, with no hosts-file changes. `http://localhost:4001` is the store finder.
- **TLS / reverse proxy:** the containers speak plain HTTP. Put a TLS-terminating proxy or load balancer in front, route the API host to `server:5000` and the two web hosts to the SPA containers, and update the `VITE_*` build args and `CORS_ORIGINS` to the HTTPS URLs.
- **SPA hosting (`docker/nginx/spa.conf`):**
  - Unknown paths fall back to `/index.html` (`try_files $uri $uri/ /index.html`), so deep links such as `/admin` work on reload.
  - Content-hashed `/assets/*` files are cached for 1 year (`immutable`). `index.html` is `no-cache`, so a deploy takes effect on the next load.
  - Responses are gzipped and carry `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: SAMEORIGIN`.
  - `/healthz` is the container healthcheck.
- **Source maps are not shipped.** Neither `vite.config.ts` sets `build.sourcemap`, and Vite's default is `false`, so `dist/` contains no `.map` files. nginx also returns 404 for `*.map` as a backstop. If you enable source maps for error tracking, upload them to the tracker and keep them out of the image.
- **Health probes (server):**
  - `GET /api/v1/health/liveness`: process is up. The image `HEALTHCHECK` uses this.
  - `GET /api/v1/health/readiness`: includes the database check. Use it for load-balancer readiness.
- **Process:** the server image runs as the unprivileged `node` user, contains only production dependencies, and shuts down gracefully on `SIGTERM`, closing Mongo connections cleanly.
- **Backups:** back up the `mongo-data` volume, or use `mongodump`, before every release that changes schemas.

---

## 4. Releases and rollback

Tag every release image with an immutable version (git tag or commit SHA). Never redeploy over a moving tag.

```bash
# Release
export VENDORA_REGISTRY=registry.example.com/vendora VENDORA_TAG=1.4.0
docker compose build
docker compose push server client landing
docker compose up -d

# Rollback: point back at the previous tag and recreate the containers
VENDORA_TAG=1.3.2 docker compose pull server client landing
VENDORA_TAG=1.3.2 docker compose up -d server client landing
```

`VENDORA_REGISTRY` and `VENDORA_TAG` can also be set in `.env`. Rolling back the images does not roll back the database. If a release ran a data migration, restore from the pre-release backup or ship a forward fix.

---

## 5. CI pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request. A newer run for the same branch or PR cancels the older one (`concurrency` with `cancel-in-progress`). Three independent jobs run in parallel on Node 20. Each job restores the npm cache keyed on its own `package-lock.json` and installs with `npm ci`:

| Job | Steps |
| :--- | :--- |
| `server` | lint (if a `lint` script exists) → `npx tsc --noEmit -p tsconfig.json` → `npm run build` |
| `client` | lint (if present) → `npm run typecheck` → `npm test` (Vitest) → `npm run build` → upload `client-dist` artifact |
| `landing` | lint (if present) → `npm run build` → `npm test` (Vitest) → upload `landing-dist` artifact |

The lint steps use `npm run lint --if-present`, so they turn on automatically once a project gets a `lint` script. The `dist` artifacts are kept for 7 days. CI does not build or push Docker images yet. Add a release workflow (for example `docker/build-push-action` on tags) when a registry is available.
