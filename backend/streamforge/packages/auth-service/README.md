# StreamForge — Auth Service

Production-grade authentication & billing microservice built with **Fastify**, **Prisma**, **PostgreSQL**, and **Redis**.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Auth Service :3001                  │
│                                                     │
│  POST /api/v1/auth/register                         │
│  POST /api/v1/auth/login                            │
│  POST /api/v1/auth/refresh                          │
│  POST /api/v1/auth/logout                           │
│  POST /api/v1/auth/verify-email                     │
│  POST /api/v1/auth/forgot-password                  │
│  POST /api/v1/auth/reset-password                   │
│  POST /api/v1/auth/change-password                  │
│                                                     │
│  GET  /api/v1/users/me                              │
│  PATCH /api/v1/users/me                             │
│  GET  /api/v1/users/:username                       │
│  DELETE /api/v1/users/me                            │
│                                                     │
│  GET  /api/v1/subscriptions/plans                   │
│  GET  /api/v1/subscriptions/me                      │
│  POST /api/v1/subscriptions/checkout                │
│  POST /api/v1/subscriptions/portal                  │
│  POST /api/v1/subscriptions/webhook                 │
│                                                     │
│  POST /api/internal/verify-token    (service-to-svc)│
│  GET  /api/internal/users/:id       (service-to-svc)│
└─────────────────────────────────────────────────────┘
```

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | Argon2id (64MB memory, 3 iterations) |
| Access tokens | JWT (15 min) — Bearer header |
| Refresh tokens | JWT (30 days) — HttpOnly cookie |
| Token revocation | Redis-backed token registry |
| Brute force protection | Redis login attempt counter (5 max, 15 min lockout) |
| Rate limiting | Per-IP via Redis + `@fastify/rate-limit` |
| Email enumeration prevention | Constant-time checks + ambiguous messages |
| Cookie security | HttpOnly, SameSite=strict, Secure in prod |
| CORS | Configured to allowed origins only |
| Helmet | Security headers on all responses |

---

## Quick Start (Development)

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop

### 1. Clone & install
```bash
cd backend
pnpm install
```

### 2. Start infrastructure
```bash
docker-compose up -d postgres redis
```

### 3. Configure environment
```bash
cp packages/auth-service/.env.example packages/auth-service/.env
# Edit .env with your values
```

### 4. Run migrations & seed
```bash
cd packages/auth-service
pnpm db:migrate    # Run Prisma migrations
pnpm db:seed       # Seed dev users
```

### 5. Start dev server
```bash
pnpm dev           # From backend/ root (Turborepo)
# or
cd packages/auth-service && pnpm dev
```

### 6. Open Swagger docs
```
http://localhost:3001/docs
```

---

## Test Accounts (after seeding)

| Email | Password | Plan |
|---|---|---|
| `free@streamforge.app` | `Password123` | FREE |
| `pro@streamforge.app` | `Password123` | PRO |
| `creator@streamforge.app` | `Password123` | CREATOR |
| `enterprise@streamforge.app` | `Password123` | ENTERPRISE |

---

## API Examples

### Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "me@example.com",
    "username": "mycoolname",
    "password": "SecurePass1"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"identifier": "me@example.com", "password": "SecurePass1"}'
```

### Get Profile (authenticated)
```bash
curl http://localhost:3001/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

### Refresh Token
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -b cookies.txt    # Uses HttpOnly cookie
```

---

## Running Tests
```bash
pnpm test                 # Run once
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_ACCESS_SECRET` | Access token signing secret (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min 32 chars) | ✅ |
| `COOKIE_SECRET` | Cookie signing secret (min 32 chars) | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_...`) | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | ✅ |
| `SMTP_HOST` | Email server host | ✅ |

See `.env.example` for the full list.

---

## Production Deployment

```bash
# Build Docker image
docker build -f packages/auth-service/Dockerfile -t sf-auth:latest .

# Run migrations (CI/CD)
docker run --env-file .env sf-auth:latest \
  node -e "const { execSync } = require('child_process'); execSync('npx prisma migrate deploy', { stdio: 'inherit' })"

# Start service
docker run -p 3001:3001 --env-file .env sf-auth:latest
```

---

## Service-to-Service Communication

Other services (Stream, Media, AI) authenticate by:
1. Including `X-Internal-Secret: <INTERNAL_SERVICE_SECRET>` header
2. Calling `POST /api/internal/verify-token` with the user's JWT
3. Using `GET /api/internal/users/:id` for full user data

```typescript
// Example: Stream Service verifying a user token
const res = await fetch('http://auth-service:3001/api/internal/verify-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Secret': process.env.INTERNAL_SERVICE_SECRET,
  },
  body: JSON.stringify({ token: userJwt }),
})
const { valid, userId, plan, limits } = (await res.json()).data
```
