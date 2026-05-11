# StreamForge Live — Social Streaming Ecosystem Blueprint

## Overview

StreamForge Live is the next evolution of the StreamForge ecosystem.

Unlike traditional social media platforms where users primarily upload posts, images, or videos, StreamForge Live is designed as a **stream-first social platform** where live interaction is the primary content model.

The system introduces:

- Real-time creator-audience interaction
- Creator monetization through virtual gifts
- Follow systems and social graph infrastructure
- Live chat and engagement systems
- Real-time notifications and presence tracking
- Creator discovery and recommendation systems
- Viewer participation mechanics
- Future creator economy infrastructure

This document defines the complete architecture blueprint, service boundaries, folder scaffolding, database concepts, realtime systems, event architecture, and mobile integration strategy for the StreamForge Live phase.

---

# Vision

## Core Philosophy

Most social platforms:

- prioritize static content
- treat live streaming as a secondary feature

StreamForge Live:

- prioritizes live interaction
- treats creators as live experiences
- builds community around real-time participation

The platform identity becomes:

> “A creator ecosystem where live interaction is the primary form of content.”

---

# Architectural Direction

## Current Architecture

Current StreamForge services:

- auth-service
- stream-service
- media-service
- ai-service

## New Services Introduced

The StreamForge Live expansion introduces new bounded domains:

```txt
packages/
  auth-service/
  stream-service/
  media-service/
  ai-service/

  social-service/          ← NEW
  realtime-service/        ← NEW
  monetization-service/    ← FUTURE
  notification-service/    ← FUTURE
```

---

# IMPORTANT DESIGN RULES

## DO NOT overload stream-service

The stream-service should ONLY handle:

- RTMP ingest
- stream lifecycle
- HLS generation
- multicast routing
- stream orchestration
- scene management
- stream metadata
- viewer metrics

It MUST NOT contain:

- follows
- comments
- social feeds
- reactions
- gifting logic
- wallets
- chat persistence

These belong to separate domains.

---

# Domain Separation Strategy

## Stream Domain

Purpose:
Video infrastructure.

Responsibilities:

- stream ingest
- HLS playback
- RTMP distribution
- transcoding
- scene switching
- stream lifecycle

---

## Social Domain

Purpose:
Creator and audience relationships.

Responsibilities:

- follows
- reactions
- comments
- social graph
- creator discovery
- creator profiles
- trending
- watch history
- stream bookmarks

---

## Realtime Domain

Purpose:
High-concurrency realtime systems.

Responsibilities:

- websocket infrastructure
- live chat
- presence
- live reactions
- stream room events
- typing indicators
- notifications

---

## Economy Domain (Future)

Purpose:
Creator monetization.

Responsibilities:

- coins
- gifts
- wallet balances
- transaction ledgers
- payouts
- withdrawal systems
- fraud detection

---

# New Backend Services

---

# 1. social-service

## Purpose

The social-service becomes the heart of the streaming social network.

It manages creator relationships, discovery, engagement, and audience interaction metadata.

---

## Recommended Folder Structure

```txt
social-service/
├── .env
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── plugins/
│   ├── middleware/
│   ├── routes/
│   ├── modules/
│   │   ├── profiles/
│   │   ├── follows/
│   │   ├── comments/
│   │   ├── reactions/
│   │   ├── discovery/
│   │   ├── feeds/
│   │   ├── moderation/
│   │   ├── bookmarks/
│   │   ├── analytics/
│   │   └── watch-history/
│   ├── services/
│   ├── repositories/
│   ├── events/
│   ├── validators/
│   ├── utils/
│   └── types/
└── __tests__/
```

---

## Features

### Creator Profiles

- creator bios
- profile customization
- social metrics
- verification badges
- featured streams

### Follow System

- follow/unfollow creators
- follower counts
- following lists
- suggested creators

### Reactions

- likes
- hearts
- emojis
- reaction aggregation

### Discovery

- trending streams
- recommended creators
- categories
- hashtags
- tags

### Watch History

- recently watched streams
- viewing analytics
- engagement metrics

### Moderation

- block users
- report streams
- comment moderation
- anti-spam controls

---

# 2. realtime-service

## Purpose

Handles all realtime websocket-based systems.

This service must scale independently.

---

## Recommended Folder Structure

```txt
realtime-service/
├── .env
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── websocket/
│   ├── gateways/
│   ├── channels/
│   ├── rooms/
│   ├── presence/
│   ├── pubsub/
│   ├── adapters/
│   ├── middleware/
│   ├── events/
│   ├── handlers/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   └── types/
└── __tests__/
```

---

## Realtime Responsibilities

### Live Chat

- stream chat rooms
- moderation
- rate limiting
- emoji reactions

### Presence System

- online status
- viewer joins/leaves
- active streamers
- live presence

### Notifications

- stream started
- followed creator live
- gifted notifications
- mentions

### Realtime Reactions

- hearts
- floating reactions
- rapid engagement bursts

---

# 3. monetization-service (Future)

## Purpose

Handles creator economy infrastructure.

This service should remain isolated from social logic.

---

## Recommended Folder Structure

```txt
monetization-service/
├── .env
├── Dockerfile
├── package.json
├── tsconfig.json
├── prisma/
├── src/
│   ├── modules/
│   │   ├── wallet/
│   │   ├── gifts/
│   │   ├── payouts/
│   │   ├── ledgers/
│   │   ├── fraud/
│   │   ├── purchases/
│   │   ├── commissions/
│   │   └── withdrawals/
│   ├── services/
│   ├── repositories/
│   ├── events/
│   └── validators/
```

---

## Virtual Economy Flow

```txt
User buys coins
↓
Coins converted into gifts
↓
Gift sent to streamer
↓
Streamer receives earnings balance
↓
Platform commission applied
↓
Creator withdraws funds
```

---

# Mobile App Expansion

---

# Current Mobile Features

```txt
features/
  auth/
  editor/
  library/
  profile/
  studio/
```

---

# New Recommended Features

```txt
features/
  auth/
  editor/
  library/
  profile/
  studio/

  social/            ← NEW
  livestream/        ← NEW
  community/         ← FUTURE
  wallet/            ← FUTURE
```

---

# social/

## Responsibilities

- creator feed
- following lists
- creator discovery
- trending streams
- comments
- reactions
- notifications

---

## Suggested Structure

```txt
social/
├── components/
├── screens/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
└── navigation/
```

---

# livestream/

## Responsibilities

- live viewing experience
- live chat UI
- reactions overlay
- gifting animations
- stream playback
- stream room participation

---

## Suggested Structure

```txt
livestream/
├── components/
├── screens/
├── hooks/
├── websocket/
├── overlays/
├── animations/
├── services/
├── store/
└── types/
```

---

# Shared Package Updates

## api-contract

Add:

```txt
src/
  social.api.ts
  realtime.api.ts
  monetization.api.ts
```

---

# Recommended New Shared Packages

```txt
packages/
├── api-contract/
├── realtime-sdk/         ← NEW
├── social-sdk/           ← NEW
├── shared-events/        ← NEW
├── shared-types/         ← NEW
└── shared-ui/            ← FUTURE
```

---

# Event-Driven Architecture

## Event Bus Philosophy

Services should communicate through events instead of tight coupling.

---

## Example Events

```txt
stream.started
stream.ended
stream.viewer_joined
stream.viewer_left

comment.created
reaction.sent
follow.created

gift.sent
wallet.updated

notification.created
creator.went_live
```

---

# Redis Strategy

## Existing Redis Infrastructure

Redis is already used.

Expand Redis usage for:

- websocket pub/sub
- stream room broadcasting
- caching
- rate limiting
- presence tracking
- event propagation

---

# Recommended Realtime Stack

## Core Technologies

- WebSockets
- Redis Pub/Sub
- BullMQ
- Fastify WebSocket
- Redis Cluster (future)

---

# Database Design Strategy

## Current State

Single PostgreSQL database.

This is acceptable for now.

---

## Recommended Logical Separation

```txt
auth.*
stream.*
media.*
social.*
realtime.*
economy.*
```

---

# Important Scaling Advice

## DO NOT split databases early.

Instead:

- logically separate schemas
- isolate repositories
- isolate migrations by domain

Physical DB separation can happen later.

---

# Infrastructure Updates

---

# New Infra Services

```txt
infra/services/
├── api-gateway/
├── ffmpeg-worker/
├── ingest-service/
├── media-orchestrator/
├── stream-router-service/

├── websocket-gateway/      ← NEW
├── event-bus-service/      ← FUTURE
└── notification-worker/    ← FUTURE
```

---

# websocket-gateway

## Responsibilities

- websocket connection management
- auth handshake
- room subscriptions
- scaling coordination
- Redis adapter integration

---

# Security Considerations

## Required Protections

### Chat Protection

- rate limiting
- anti-spam
- banned words
- moderation queue

### Economy Protection

- anti-fraud
- suspicious gift detection
- transaction logging
- withdrawal reviews

### Stream Protection

- stream abuse detection
- DMCA workflows
- moderation escalation

---

# Suggested Database Models

## Social Models

```txt
Follow
Reaction
Comment
Bookmark
WatchHistory
CreatorProfile
Notification
BlockedUser
Report
```

---

## Realtime Models

```txt
PresenceSession
ChatRoom
ChatMessage
StreamPresence
ViewerSession
```

---

## Economy Models

```txt
Wallet
WalletTransaction
Gift
GiftCatalog
Payout
WithdrawalRequest
LedgerEntry
Commission
```

---

# API Layer Additions

## social-service Routes

```txt
POST   /follow/:creatorId
DELETE /follow/:creatorId

POST   /comments
GET    /comments/:streamId

POST   /reactions
GET    /feed

GET    /trending
GET    /recommended
```

---

## realtime-service Events

```txt
chat:send
chat:receive

reaction:send
reaction:receive

presence:update

stream:join
stream:leave
```

---

# Product Phases

---

# Phase 1 — Social Layer

## Goals

- creator profiles
- follows
- reactions
- comments
- trending streams

---

# Phase 2 — Realtime Layer

## Goals

- websocket infrastructure
- live chat
- live reactions
- stream presence
- notifications

---

# Phase 3 — Creator Economy

## Goals

- virtual gifts
- coins
- creator earnings
- wallet balances
- payouts

---

# Phase 4 — Discovery Intelligence

## Goals

- recommendation engine
- AI moderation
- creator ranking
- engagement scoring
- personalized feeds

---

# Long-Term Vision

The StreamForge ecosystem evolves into:

## Creator Operating System

A unified ecosystem where creators can:

- stream
- edit
- monetize
- engage audiences
- manage communities
- analyze performance
- receive support
- distribute content

all within one platform.

---

# Final Architectural Principles

## Maintain Domain Boundaries

Keep these domains isolated:

| Domain   | Responsibility          |
| -------- | ----------------------- |
| Stream   | Video infrastructure    |
| Social   | Community relationships |
| Realtime | Live interactions       |
| Economy  | Monetization            |
| AI       | Intelligence            |
| Media    | Storage and processing  |

---

## Avoid Tight Coupling

Use:

- event-driven communication
- shared contracts
- isolated repositories
- domain ownership

Avoid:

- cross-service database writes
- deeply shared business logic
- duplicated realtime state

---

# Implementation Status

## What has been completed

- Created the new backend service scaffolds for `social-service`, `realtime-service`, and `monetization-service` under `backend/streamforge/packages`.
- Added service boilerplate: `package.json`, `tsconfig.json`, `README.md`, `Dockerfile`, `.env.example`, `prisma/schema.prisma`, `src/app.ts`, `src/server.ts`, and basic route/module/service/controller structures.
- Implemented `social-service` in-memory domain logic with shared profile, follow, comments, reactions, and feed state.
- Added network routes for `profiles`, `follow`, `comments`, `reactions`, and `feed` in `social-service`.
- Added basic `realtime-service` websocket broadcast support for `chat:send` / `chat:receive`.
- Updated mobile social feature to fetch and render a live feed through `useSocialFeed()`.
- Updated livestream chat UI to use a dedicated `useLiveChat()` hook for message state.
- Added initial mobile scaffolds for `community/` and `wallet/` with placeholder screens and store hooks.
- Kept existing services and packages untouched; the new work remains isolated to the new blueprint files and folders.

## What needs to be done in the next phase

### 1. Backend implementation

- Continue `social-service` completion:
  - convert current in-memory social state into persisted Prisma-backed storage for profiles, follows, comments, reactions, trending, and watch history.
  - add moderation, discovery filters, and feed personalization.
- Continue `realtime-service` completion:
  - extend websocket support beyond echo/broadcast and wire chat room lifecycle, stream presence, live reactions, and typing indicators.
  - add Redis pub/sub or socket adapter support, rate limiting, moderation guards, auth handshake logic, and live notification dispatch.
- Finish `monetization-service`:
  - implement wallet balance management, gift creation and receipt, payout requests, and transaction ledger tracking.
  - add external payment integration and fraud detection hooks.
- Add the `notification-service` scaffold and/or notification worker for push/email/real-time notifications.
- Implement shared event contracts and event bus flow for cross-service communication.

### 2. API contracts and shared packages

- Add `social.api.ts`, `realtime.api.ts`, and `monetization.api.ts` to `packages/api-contract/src`.
- Create new shared packages for `realtime-sdk`, `social-sdk`, `shared-events`, and `shared-types`.
- Define versioned API contracts and event schemas so new services can integrate cleanly.

### 3. Mobile integration

- Wire new `social` and `livestream` feature modules into the mobile app navigation.
- Build actual feed UI, creator discovery screens, comment/reaction interactions, and notification displays.
- Connect the livestream screen to websocket chat and live reaction flows.
- Implement wallet and community screens with real backend data and user flows.

### 4. Infrastructure and deployment

- Add `websocket-gateway` to infrastructure service definitions.
- Update Docker Compose and deployment manifests to include the new services.
- Ensure Redis is configured for pub/sub, rate limiting, and event propagation.
- Add monitoring, health checks, and local dev support for the new services.

### 5. Priority next-phase execution

- Establish the MVP scope: social feed, follow system, live chat, and gifting core.
- Build end-to-end flows with the new service boundaries enforced.
- Validate domain separation before adding complex discovery or economy features.
- Add tests for service boundaries, event flows, and mobile integration.
- Maintain the architectural rule: stream-service handles video only; social/realtime/economy handle engagement.

---

# Final Recommendation

The best strategic direction is:

```txt
Streaming Platform
        ↓
Social Streaming Network
        ↓
Creator Economy Platform
        ↓
Creator Infrastructure Ecosystem
```

This blueprint positions StreamForge for:

- scalable realtime systems
- creator monetization
- community engagement
- future recommendation systems
- advanced creator tooling
- platform-level expansion

without requiring destructive architectural rewrites later.
