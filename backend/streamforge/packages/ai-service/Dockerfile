# ============================================================
#  StreamForge AI Service — Dockerfile
#  Multi-stage: deps → builder → runner
# ============================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ai-service/package.json ./packages/ai-service/
COPY packages/shared/package.json     ./packages/shared/

RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules                      ./node_modules
COPY --from=deps /app/packages/ai-service/node_modules  ./packages/ai-service/node_modules
COPY --from=deps /app/packages/shared/node_modules      ./packages/shared/node_modules
COPY . .

RUN cd packages/ai-service && pnpm exec prisma generate
RUN cd packages/shared     && pnpm build
RUN cd packages/ai-service && pnpm build

# Stage 3: Production runner
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 fastify

# Certs directory for Google service account
RUN mkdir -p /app/certs && chown -R fastify:nodejs /app/certs

COPY --from=builder --chown=fastify:nodejs /app/packages/ai-service/dist        ./dist
COPY --from=builder --chown=fastify:nodejs /app/packages/ai-service/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/packages/ai-service/prisma       ./prisma
COPY --from=builder --chown=fastify:nodejs /app/node_modules/.prisma             ./node_modules/.prisma

USER fastify
EXPOSE 3004

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3004/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
