# Mealth API Gateway

Central entry point for all Mealth client applications. Routes incoming requests to the appropriate backend microservice.

## Architecture

```
Client (Web / Mobile)
        │
        ▼
┌──────────────────────┐
│    API Gateway       │  :4000
│                      │
│  ┌────────────────┐  │
│  │ Helmet (security) │
│  │ CORS             │
│  │ Request Logger   │
│  │ Rate Limiter     │
│  └────────────────┘  │
│                      │
│  /health ──► local   │
│  /v1/*   ──► proxy   │──────►  mealth-express-backend  :3000
│                      │
└──────────────────────┘
```

## Connected Microservices

| Service | Internal URL | Route Prefix | Description |
|---------|-------------|--------------|-------------|
| **mealth-express-backend** | `http://localhost:3000` | `/v1/*` | Core API — auth, appointments, profiles, prescriptions, billing, notifications, session notes, medical reports, doctor slots, leaves |

## What the Gateway Handles

- **Routing** — forwards `/v1/*` traffic to `mealth-express-backend`
- **Security headers** — via Helmet
- **CORS** — centralized origin allowlist
- **Rate limiting** — 200 req / 10 min per IP (configurable)
- **Request tracing** — assigns `X-Request-Id` to every request, forwarded to upstream services
- **Request logging** — method, path, status, duration for every request
- **Error handling** — returns `502 Bad Gateway` / `504 Gateway Timeout` when upstream is unavailable

## What the Gateway Does NOT Handle

- **Authentication** — JWT validation stays in `mealth-express-backend` (Auth0 JWKS). The gateway passes `Authorization` headers through.
- **Business logic** — all logic lives in the downstream services.
- **Body parsing for proxied routes** — raw requests (including multipart file uploads) are forwarded as-is.

## Quick Start

```bash
# Install dependencies
npm install

# Create your .env from the example
cp .env.example .env
# Edit .env with your values (at minimum set BACKEND_URL)

# Start in development (with hot reload)
npm run dev

# Build for production
npm run build
npm start
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKEND_URL` | Yes | — | URL of mealth-express-backend |
| `GATEWAY_PORT` | No | `4000` | Port the gateway listens on |
| `NODE_ENV` | No | `development` | Environment |
| `LOG_LEVEL` | No | `info` | Logging level (`debug` / `info` / `warn` / `error`) |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | `600000` | Rate limit window in ms |
| `RATE_LIMIT_MAX` | No | `200` | Max requests per window |
| `PROXY_TIMEOUT` | No | `30000` | Upstream request timeout in ms |

## Health Check

```
GET /health
```

Returns gateway status and connectivity to all upstream services:

```json
{
  "status": "healthy",
  "gateway": { "status": "healthy" },
  "services": {
    "mealth-express-backend": {
      "status": "healthy",
      "latency": "12ms"
    }
  }
}
```

## Adding a New Microservice

1. Add the service URL to `src/config/env.ts`
2. Create a new proxy in `src/proxy/`
3. Register the route prefix in `src/routes/index.ts`
