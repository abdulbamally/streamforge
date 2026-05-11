# ============================================================
#  StreamForge Auth Service — Dockerfile
#  Multi-stage build: deps → builder → runner
# ============================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/auth-service/package.json ./packages/auth-service/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/auth-service/node_modules ./packages/auth-service/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY . .

# Generate Prisma client
RUN cd packages/auth-service && pnpm exec prisma generate

# Build shared package first
RUN cd packages/shared && pnpm build

# Build auth service
RUN cd packages/auth-service && pnpm build

# Stage 3: Production runner
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /app/packages/auth-service/dist       ./dist
COPY --from=builder --chown=fastify:nodejs /app/packages/auth-service/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/packages/auth-service/prisma      ./prisma
COPY --from=builder --chown=fastify:nodejs /app/node_modules/.prisma              ./node_modules/.prisma

USER fastify

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# dumb-init handles PID 1 signal forwarding
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
