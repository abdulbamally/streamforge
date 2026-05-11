# State of the Project — StreamForge

## Project Overview

**StreamForge** is a production-grade, monetizable mobile video streaming and editing application for content creators. The application enables users to:

- Stream live video to multiple platforms simultaneously (YouTube, Twitch, Facebook, TikTok, Instagram, Custom RTMP)
- Overlay images, videos, and Picture-in-Picture (PiP) cameras on live streams
- Switch between scenes and sources during live streams
- Record live streams automatically to cloud storage
- Edit videos offline with a full timeline editor (trim, cut, split, extract audio, color correction, effects)
- Export videos to multiple formats (MP4, MOV, WEBM, MKV, GIF, MP3)
- Leverage AI features: object detection, OCR (live text extraction), real-time translation, scene description
- Manage a media library of uploaded assets
- Subscribe to monetization tiers (FREE, PRO, CREATOR, ENTERPRISE)

---

## Project Architecture

**Architecture Model:** Monorepo (Backend) + Separate Mobile Repository

The project is structured as:

- **Backend:** pnpm monorepo with Turborepo orchestration
- **Mobile:** React Native CLI (bare, not Expo)
- **API Contract:** Shared TypeScript API client
- **Infrastructure:** Docker-based containerized deployment with staging and production environments

### Why Not Expo?

The application requires native modules incompatible with Expo managed workflow:

- `ffmpeg-kit-react-native` — FFmpeg on device for video editing
- `react-native-vision-camera` — frame processors for AI features
- Custom RTMP streaming client
- React Native Skia for GPU-accelerated overlays

### Backend Microservices

Four focused, independently deployable services:

- **Auth Service** (Port 3001) — Identity, sessions, billing
- **Stream Service** (Port 3002) — RTMP ingest, multicast, WebSocket, scenes
- **Media Service** (Port 3003) — Uploads, transcoding, export queue
- **AI Service** (Port 3004) — Vision, OCR, translation, scene description

---

## Complete Project Directory Structure

```
streamforge/
├── .git/                                    # Git version control
├── .gitignore                               # Git ignore rules
├── DEVELOPMENT_PROGRESS.MD                  # Development phase documentation
├── RESTRUCTURE_PROGRESS.md                  # Restructure tracking
├── STREAMFORGE_MEGA_PROMPT.md               # Complete project specification
├── State of the Project.md                  # This file
│
├── apps/                                    # Mobile applications
│   ├── streamapp/                           # Expo/EAS mobile app (legacy/alternate)
│   │   ├── app.json                         # Expo app configuration
│   │   ├── babel.config.js                  # Babel configuration
│   │   ├── expo-env.d.ts                    # Expo environment types
│   │   ├── metro.config.js                  # Metro bundler configuration
│   │   ├── nativewind-env.d.ts              # NativeWind environment types
│   │   ├── package.json                     # Dependencies
│   │   ├── tsconfig.json                    # TypeScript configuration
│   │   ├── tailwind.config.js               # Tailwind CSS configuration
│   │   ├── Project Time-line.md             # Project timeline
│   │   ├── README.md                        # Documentation
│   │   ├── assets/
│   │   │   ├── expo.icon/
│   │   │   │   ├── icon.json
│   │   │   │   └── Assets/
│   │   │   └── images/
│   │   │       └── tabIcons/
│   │   └── src/
│   │       ├── app/                         # App routing and layout
│   │       │   ├── _layout.tsx              # Root layout
│   │       │   ├── globals.css              # Global styles
│   │       │   ├── index.tsx                # Home route
│   │       │   ├── (auth)/                  # Auth module (protected routes)
│   │       │   ├── (tabs)/                  # Tab-based navigation module
│   │       │   ├── record/                  # Recording feature
│   │       │   └── stream/                  # Streaming feature
│   │       ├── assets/
│   │       │   └── images/
│   │       ├── components/
│   │       │   ├── layout/                  # Layout components
│   │       │   └── ui/                      # UI components
│   │       ├── constants/
│   │       │   ├── colors.ts                # Color constants
│   │       │   └── theme.ts                 # Theme configuration
│   │       ├── hooks/
│   │       │   └── useAuth.ts               # Auth hook
│   │       ├── services/
│   │       │   ├── api.ts                   # API service
│   │       │   └── auth.ts                  # Auth service
│   │       ├── store/
│   │       │   ├── authStore.ts             # Auth state management
│   │       │   ├── mediaStore.ts            # Media state management
│   │       │   └── streamStore.ts           # Stream state management
│   │       └── utils/
│   │
│   └── streamforge-mobile/                  # React Native CLI bare app (primary)
│       ├── .DS_Store
│       ├── App.tsx                          # Root application component
│       ├── index.js                         # Entry point
│       ├── app.json                         # RN app configuration
│       ├── babel.config.js                  # Babel configuration
│       ├── jest.config.js                   # Jest testing configuration
│       ├── metro.config.js                  # Metro bundler configuration
│       ├── Gemfile                          # Ruby dependencies (CocoaPods)
│       ├── package.json                     # Dependencies
│       ├── tsconfig.json                    # TypeScript configuration
│       ├── README.md                        # Documentation
│       ├── android/
│       │   ├── build.gradle                 # Android build config
│       │   ├── gradle.properties            # Gradle properties
│       │   ├── gradlew                      # Gradle wrapper (Unix)
│       │   ├── gradlew.bat                  # Gradle wrapper (Windows)
│       │   ├── settings.gradle              # Gradle settings
│       │   ├── app/                         # Android app module
│       │   ├── build/                       # Build artifacts
│       │   └── gradle/                      # Gradle configuration
│       ├── ios/
│       │   ├── Podfile                      # CocoaPods dependencies
│       │   ├── StreamforgeNativeTemplate/   # iOS app source
│       │   ├── StreamforgeNativeTemplate.xcodeproj/  # Xcode project
│       │   └── StreamforgeNativeTemplateTests/      # iOS tests
│       └── src/
│           ├── app/
│           │   ├── navigation/              # Navigation configuration
│           │   └── providers/               # App providers (Context, Redux, etc.)
│           ├── core/                        # Core application logic
│           ├── features/                    # Feature modules
│           │   ├── auth/                    # Authentication feature
│           │   ├── editor/                  # Video editor feature
│           │   ├── library/                 # Media library feature
│           │   │   └── screens/
│           │   │       ├── LibraryHomeScreen.tsx     # Library home with upload
│           │   │       ├── AssetDetailScreen.tsx     # Asset detail view
│           │   │       └── index.ts
│           │   ├── profile/                 # User profile feature
│           │   │   └── screens/
│           │   │       ├── ProfileHomeScreen.tsx     # Profile home
│           │   │       ├── EditProfileScreen.tsx     # Edit profile
│           │   │       ├── SubscriptionScreen.tsx    # Subscription management
│           │   │       ├── SettingsScreen.tsx        # Settings
│           │   │       └── index.ts
│           │   ├── studio/                  # Studio/streaming feature
│           │   └── screens.tsx              # Feature screen exports
│           └── shared/                      # Shared components & utilities
│
├── backend/                                 # Node.js backend monorepo
│   └── streamforge/
│       ├── docker-compose.yml               # Docker compose for all services
│       ├── package.json                     # Root workspace package.json
│       ├── pnpm-lock.yaml                   # pnpm dependency lock
│       ├── pnpm-workspace.yaml              # pnpm workspace configuration
│       ├── turbo.json                       # Turborepo configuration
│       └── packages/
│           ├── shared/                      # Shared types, utils, Prisma schema
│           │   ├── src/
│           │   │   └── (shared utilities and types)
│           │   ├── package.json
│           │   └── tsconfig.json
│           │
│           ├── auth-service/                # Authentication & Billing Service (Port 3001)
│           │   ├── .env                     # Environment configuration
│           │   ├── Dockerfile               # Container definition
│           │   ├── package.json             # Service dependencies
│           │   ├── tsconfig.json            # TypeScript config
│           │   ├── README.md                # Service documentation
│           │   ├── __tests__/               # Test files
│           │   ├── dist/                    # Compiled output
│           │   ├── node_modules/            # Dependencies
│           │   ├── prisma/
│           │   │   ├── schema.prisma        # Shared database schema
│           │   │   └── migrations/          # Database migrations
│           │   └── src/
│           │       └── (auth service source code)
│           │
│           ├── stream-service/              # RTMP Streaming Service (Port 3002)
│           │   ├── .env                     # Environment configuration
│           │   ├── Dockerfile               # Container definition
│           │   ├── package.json             # Service dependencies
│           │   ├── tsconfig.json            # TypeScript config
│           │   ├── dist/                    # Compiled output
│           │   ├── node_modules/            # Dependencies
│           │   └── src/
│           │       └── (stream service source code)
│           │
│           ├── media-service/               # Media Upload & Export Service (Port 3003)
│           │   ├── .env                     # Environment configuration
│           │   ├── Dockerfile               # Container definition
│           │   ├── package.json             # Service dependencies
│           │   ├── tsconfig.json            # TypeScript config
│           │   ├── dist/                    # Compiled output
│           │   ├── node_modules/            # Dependencies
│           │   └── src/
│           │       └── (media service source code)
│           │
│           └── ai-service/                  # AI Features Service (Port 3004)
│               ├── .env                     # Environment configuration
│               ├── Dockerfile               # Container definition
│               ├── package.json             # Service dependencies
│               ├── tsconfig.json            # TypeScript config
│               ├── dist/                    # Compiled output
│               ├── node_modules/            # Dependencies
│               └── src/
│                   └── (AI service source code)
│
├── infra/                                   # Infrastructure & DevOps
│   └── streamforge-infra/
│       ├── .env                             # Environment variables
│       ├── .github/                         # GitHub configuration
│       ├── Makefile                         # Build and deployment commands
│       ├── docker-compose.yml               # Main Docker Compose
│       ├── PROGRESS.md                      # Infrastructure progress tracking
│       ├── readme.md                        # Infrastructure documentation
│       ├── deployment/
│       │   ├── local/                       # Local development deployment
│       │   ├── production/                  # Production deployment
│       │   └── staging/                     # Staging deployment
│       ├── docker/
│       │   ├── docker-compose.base.yml      # Base Docker Compose config
│       │   ├── docker-compose.dev.yml       # Development Docker Compose
│       │   ├── docker-compose.prod.yml      # Production Docker Compose
│       │   └── docker-compose.staging.yml   # Staging Docker Compose
│       ├── environments/                    # Environment configuration files
│       ├── github-actions/
│       │   └── deploy.yml                   # GitHub Actions deployment pipeline
│       ├── infrastructure/
│       │   ├── docker/                      # Docker infrastructure config
│       │   ├── monitoring/                  # Monitoring setup
│       │   └── nginx/                       # Nginx configuration
│       ├── monitoring/                      # Monitoring and observability
│       ├── nginx/
│       │   └── nginx.prod.conf              # Production Nginx config
│       ├── scripts/
│       │   ├── deploy.sh                    # Deployment script
│       │   └── setup-ec2.sh                 # EC2 setup script
│       ├── services/                        # Infrastructure services
│       │   ├── api-gateway/                 # API Gateway service
│       │   ├── ffmpeg-worker/               # FFmpeg worker for transcoding
│       │   ├── ingest-service/              # Stream ingest service
│       │   ├── media-orchestrator/          # Media orchestration service
│       │   └── stream-router-service/       # Stream routing service
│       └── shared/
│           ├── auth/                        # Shared auth utilities
│           ├── config/                      # Shared configuration
│           ├── contracts/                   # API contracts
│           ├── logging/                     # Logging utilities
│           └── utils/                       # Shared utilities
│
└── packages/                                # Shared packages
    └── api-contract/                        # Typed API Client Package
        ├── package.json                     # Package configuration
        ├── tsconfig.json                    # TypeScript configuration
        └── src/
            ├── ai.api.ts                    # AI API client
            ├── auth.api.ts                  # Auth API client
            ├── client.ts                    # Base API client
            ├── index.ts                     # Package exports
            ├── media.api.ts                 # Media API client
            ├── stream.api.ts                # Stream API client
            └── types.ts                     # Shared API types
```

---

## Technology Stack

### Backend

| Layer          | Technology                                 | Purpose                                      |
| -------------- | ------------------------------------------ | -------------------------------------------- |
| Runtime        | Node.js 20 LTS                             | Stable, performant runtime                   |
| Framework      | Fastify 4                                  | High-performance API framework               |
| ORM            | Prisma 5                                   | Type-safe database access                    |
| Database       | PostgreSQL 16                              | ACID-compliant relational database           |
| Cache/Sessions | Redis 7                                    | In-memory data store for caching and pub/sub |
| File Storage   | Cloudflare R2                              | S3-compatible object storage                 |
| Job Queue      | BullMQ                                     | Reliable job processing on Redis             |
| RTMP Server    | node-media-server                          | RTMP ingest and HLS serving                  |
| FFmpeg         | fluent-ffmpeg                              | Multicast to N platforms, transcoding        |
| Monorepo Tool  | pnpm + Turborepo                           | Fast, efficient monorepo management          |
| Authentication | JWT (15min access, 30d refresh) + Argon2id | Secure session management                    |
| Payments       | Stripe                                     | Subscription and billing management          |
| Email          | Nodemailer                                 | Transactional email delivery                 |
| Validation     | Zod                                        | Runtime type safety                          |
| Testing        | Vitest                                     | Fast test runner                             |
| Containers     | Docker + docker-compose                    | Containerization and orchestration           |

### Mobile (React Native)

| Layer            | Technology                   | Purpose                            |
| ---------------- | ---------------------------- | ---------------------------------- |
| Framework        | React Native (Bare)          | Cross-platform mobile development  |
| Navigation       | React Navigation             | Navigation and routing             |
| State Management | Zustand + MMKV               | Lightweight state and persistence  |
| Styling          | NativeWind / Tailwind CSS    | Utility-first styling              |
| Video Capture    | react-native-vision-camera   | Camera access and frame processing |
| Video Editing    | ffmpeg-kit-react-native      | On-device video processing         |
| RTMP Streaming   | Custom RTMP client           | Direct RTMP streaming              |
| GPU Rendering    | React Native Skia            | Hardware-accelerated graphics      |
| HTTP Client      | Axios                        | API communication                  |
| File Picker      | react-native-document-picker | File selection UI                  |
| Type Safety      | TypeScript                   | Static type checking               |
| UI Components    | React Native                 | Native UI elements                 |

### Infrastructure

| Component        | Technology               | Purpose                          |
| ---------------- | ------------------------ | -------------------------------- |
| Containerization | Docker                   | Service containerization         |
| Orchestration    | Docker Compose           | Multi-container orchestration    |
| Reverse Proxy    | Nginx                    | Load balancing and routing       |
| CI/CD            | GitHub Actions           | Automated testing and deployment |
| IaC              | Bash Scripts + Makefiles | Infrastructure automation        |

---

## Database Schema Overview

All four backend services share a single PostgreSQL database with the Prisma schema located in `backend/streamforge/packages/auth-service/prisma/schema.prisma`.

### Key Models

- **User** — Email, username, passwordHash (Argon2id), emailVerified, subscription plan
- **OAuthAccount** — Google, Apple OAuth integrations
- **Token** — Email verification and password reset tokens
- **Subscription** — Stripe customer, plan, status, billing period
- **Invoice** — Stripe invoice records
- **Stream** — Title, streamKey, status (IDLE/LIVE/ENDED/ERROR), viewerCount
- **Destination** — Platform (YouTube, Twitch, etc.), RTMP URL, stream key per user
- **StreamDestination** — Many-to-many relationship between stream and destinations
- **Scene** — Named scene with order and active status
- **Source** — Source type (CAMERA/SCREEN/IMAGE/VIDEO/TEXT/BROWSER/AUDIO) with config JSON
- **Recording** — R2 URL, duration, size of recorded stream
- **StreamAnalytic** — Time series data (bitrate, fps, viewerCount)
- **MediaAsset** — Uploaded files with metadata
- **Project** — Video editing project with resolution, fps, aspect ratio
- **Clip** — Timeline clip with startTime, endTime, effects JSON, colorGrade JSON
- **Export** — Format, resolution, fps, status (PENDING/PROCESSING/DONE/FAILED), progress
- **AuditLog** — User actions for observability

### Plan Limits

```
FREE:       1 destination,   720p,   5GB storage,   3 projects,   watermark,      no AI
PRO:        5 destinations,  1080p,  100GB storage, 20 projects,  no watermark,   AI enabled
CREATOR:    10 destinations, 4K,     1TB storage,   unlimited,    no watermark,   AI enabled
ENTERPRISE: unlimited,       4K,     unlimited,     unlimited,    custom branding, AI enabled
```

---

## Key Features by Phase

### ✅ Completed Phases

1. **Project Setup** — Backend monorepo, mobile bare RN, infrastructure
2. **API Contract** — Typed TypeScript API client package
3. **Auth Service** — User registration, login, email verification, OAuth
4. **Stream Service** — RTMP ingest, HLS serving, WebSocket live updates
5. **Media Service** — Upload, transcoding, export pipeline
6. **AI Service** — Object detection, OCR, translation, scene description
7. **Mobile Auth Screens** — Login, registration, password reset flows
8. **Mobile Studio Screens** — Stream setup, destination selection, source management
9. **Mobile Library Screens** — Asset upload, preview, deletion with media type detection
10. **Mobile Profile Screens** — Profile editing, subscription management, settings, logout

### 🔄 In Progress / Upcoming

- Settings persistence (device toggles + server-backed settings)
- Upload robustness (client-side file validation, progress UI, retry/cancel)
- Advanced editor UI polish
- Offline video editing workflows
- Advanced AI feature integration
- Production deployment and scaling

---

## Development Workflow

### Local Development

1. **Backend:** Run `pnpm install` and `docker-compose up` in `backend/streamforge` to start all services
2. **Mobile:** Run `npm install` and `npm start` (or `npm run android`/`npm run ios`) in `apps/streamforge-mobile`
3. **API Contract:** Changes to `packages/api-contract/src` are automatically consumed by services

### Testing

- **Backend:** Unit tests in each service's `__tests__` folder
- **Mobile:** Jest and type checking via `npm run type-check`

### Deployment

- **Staging:** Push to branch triggers GitHub Actions → Docker build → Deploy to staging environment
- **Production:** Merge to main → Docker build → Deploy to production with Nginx routing

---

## Key Decisions & Rationale

1. **Monorepo (pnpm + Turborepo)** — Simplified shared schema management and code sharing between services
2. **JWT + Argon2id** — Stateless auth with secure password hashing
3. **Redis for caching and sessions** — Fast access and pub/sub for real-time features
4. **Cloudflare R2** — Free egress and S3-compatible API
5. **BullMQ for job queue** — Redis-backed reliability for media processing
6. **React Native bare (not Expo)** — Required native modules (ffmpeg-kit-react-native, vision-camera)
7. **Four microservices** — Balanced fragmentation; each service has clear responsibility
8. **Stripe for payments** — Proven, reliable billing with webhook support

---

## File and Folder Naming Conventions

- **Services:** Kebab-case (`auth-service`, `media-service`)
- **Source files:** camelCase for files (`userController.ts`, `authService.ts`)
- **Components:** PascalCase for React components (`UserProfile.tsx`, `StreamCard.tsx`)
- **Directories:** Kebab-case or lowercase (`src/ui`, `src/services`, `src/features`)

---

## Current State Summary

**Overall Status:** Early production phase with core features implemented

- ✅ Architecture established and proven
- ✅ All four backend services running and deployable
- ✅ Mobile app structure complete with main features UI
- ✅ Authentication and authorization working
- ✅ Media upload and library management functional
- ✅ Docker containerization and deployment pipeline configured
- 🔄 Deep feature integration: settings persistence, upload robustness, advanced editor workflows
- ⏳ Production readiness: load testing, monitoring, security audit

---

## Project Statistics

- **Total Directories:** 100+
- **Service Count:** 4 backend microservices + 1 API Gateway + 4 infra services
- **Code Languages:** TypeScript (primary), JavaScript, Bash, YAML
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Docker + docker-compose with GitHub Actions CI/CD
- **Mobile Platforms:** iOS (Xcode) and Android (Gradle)

---

**Last Updated:** May 11, 2026

**Maintained By:** Development Team
