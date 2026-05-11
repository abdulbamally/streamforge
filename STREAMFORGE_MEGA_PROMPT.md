# StreamForge — Complete Project Mega Prompt

## Project Overview

Build a production-grade, monetisable mobile video streaming and editing application called **StreamForge** for content creators. The app allows users to:

- Stream live video to multiple platforms simultaneously (YouTube, Twitch, Facebook, TikTok, Instagram, Custom RTMP)
- Overlay images, videos, and a second camera (PiP) on the live stream feed
- Switch between scenes and sources during a live stream
- Record live streams automatically to cloud storage
- Edit videos offline with a full timeline editor (trim, cut, split, extract audio, color correction, effects)
- Export videos to multiple formats (MP4, MOV, WEBM, MKV, GIF, MP3)
- Use AI features: object detection, OCR (live text extraction), real-time translation, scene description
- Manage a media library of uploaded assets
- Subscribe to monetisation tiers (FREE, PRO, CREATOR, ENTERPRISE)

---

## Architecture Decision

### Monorepo Structure (Backend) + Separate Repo (Mobile)

```
streamforge/                          ← root workspace
├── streamforge-backend/              ← pnpm monorepo (Turborepo)
│   └── packages/
│       ├── auth-service/             ← Port 3001
│       ├── stream-service/           ← Port 3002
│       ├── media-service/            ← Port 3003
│       ├── ai-service/               ← Port 3004
│       └── shared/                   ← shared types/utils
├── api-contract/                     ← typed API client (standalone)
└── streamforge-mobile/               ← React Native CLI (bare, not Expo)
```

### Why NOT Expo
The app requires native modules incompatible with Expo managed workflow:
- `ffmpeg-kit-react-native` — FFmpeg on device for video editing
- `react-native-vision-camera` — frame processors for AI features
- Custom RTMP streaming client
- React Native Skia for GPU-accelerated overlays

### Why Minimal Microservices (not monolith, not over-engineered)
Four focused services, each independently deployable:
- **Auth Service** — identity, sessions, billing
- **Stream Service** — RTMP ingest, multicast, WebSocket, scenes
- **Media Service** — uploads, transcoding, export queue
- **AI Service** — vision, OCR, translation, scene description

---

## Backend Tech Stack

| Concern | Technology | Reason |
|---|---|---|
| Runtime | Node.js 20 LTS | Stable, fast |
| Framework | Fastify 4 | 2x faster than Express |
| ORM | Prisma 5 | Type-safe, great DX |
| Database | PostgreSQL 16 | Relational, ACID |
| Cache/Sessions | Redis 7 | TTL-based, pub/sub |
| File Storage | Cloudflare R2 | S3-compatible, free egress |
| Job Queue | BullMQ | Redis-backed, reliable |
| RTMP Server | node-media-server | RTMP ingest + HLS |
| Multicast | FFmpeg (fluent-ffmpeg) | Fan-out to N platforms |
| Monorepo | pnpm workspaces + Turborepo | Fast, minimal |
| Auth | JWT (access 15min) + Refresh (30d) + Argon2id | Secure |
| Payments | Stripe | Subscriptions + webhooks |
| Email | Nodemailer | Transactional email |
| Validation | Zod | Runtime type safety |
| Testing | Vitest | Fast, Jest-compatible |
| Containers | Docker + docker-compose | Local dev + prod |

---

## Database Schema (Prisma — Single Shared Schema)

All four services share one PostgreSQL database accessed via the shared Prisma schema located in `auth-service/prisma/schema.prisma`.

### Key Models
- `User` — email, username, passwordHash (Argon2id), emailVerified, plan
- `OAuthAccount` — Google, Apple OAuth providers
- `Token` — email verification, password reset tokens
- `Subscription` — Stripe customer, plan, status, billing period
- `Invoice` — Stripe invoice records
- `Stream` — title, streamKey, status (IDLE/LIVE/ENDED/ERROR), viewerCount
- `Destination` — platform, rtmpUrl, streamKey per user
- `StreamDestination` — many-to-many stream ↔ destination
- `Scene` — named scene with order, isActive flag
- `Source` — type (CAMERA/SCREEN/IMAGE/VIDEO/TEXT/BROWSER/AUDIO), config JSON
- `Recording` — R2 URL, duration, size of recorded stream
- `StreamAnalytic` — bitrate, fps, viewerCount time series
- `MediaAsset` — uploaded files with metadata
- `Project` — video editing project with resolution, fps, aspectRatio
- `Clip` — timeline clip with startTime, endTime, effects JSON, colorGrade JSON
- `Export` — format, resolution, fps, status (PENDING/PROCESSING/DONE/FAILED), progress
- `AuditLog` — user actions for observability

### Plan Limits
```
FREE:       1 destination,  720p,  5GB storage,   3 projects,  watermark, no AI
PRO:        3 destinations, 1080p, 50GB storage,  20 projects, no watermark, AI
CREATOR:   10 destinations, 4K,    500GB storage, 100 projects, no watermark, AI
ENTERPRISE: unlimited,      4K,    unlimited,      unlimited,   no watermark, AI
```

---

## Auth Service — Complete File List

**Root:** `package.json`, `tsconfig.json`, `Dockerfile`, `.env.example`, `README.md`

**prisma/:** `schema.prisma`, `seed.ts`

**src/:** `index.ts`

**src/types/:** `index.ts` — TokenClaims, OAuthProfile, EmailJob

**src/plugins/:** `index.ts` — Helmet, CORS, JWT, cookies, rate limit, Swagger

**src/middleware/:** `auth.middleware.ts` — authenticate, requirePlan, requireEmailVerified, optionalAuth, requireInternalService, validateBody

**src/schemas/:** `auth.schema.ts` — RegisterSchema, LoginSchema, ResetPasswordSchema, ChangePasswordSchema, UpdateProfileSchema, CreateCheckoutSchema

**src/routes/:** `index.ts`, `auth.routes.ts`, `user.routes.ts`, `subscription.routes.ts`, `internal.routes.ts`

**src/services/:** `auth.service.ts` — register, login, refresh, logout, verifyEmail, forgotPassword, resetPassword, changePassword with Argon2id + brute-force protection (5 attempts, 15min lockout) + Redis token rotation. `email.service.ts` — branded HTML email templates. `subscription.service.ts` — full Stripe lifecycle (checkout, portal, all webhook events).

**src/utils/:** `config.ts`, `errors.ts`, `logger.ts`, `prisma.ts`, `redis.ts`, `shutdown.ts`

**src/__tests__/:** `auth.test.ts`

### Key Security Features
- Argon2id password hashing (64MB memory cost, 3 iterations)
- JWT access tokens (15min) + refresh tokens (30d) via HttpOnly cookies on web, body on mobile
- Redis-backed token revocation
- Brute force protection — 5 failed attempts triggers 15min lockout per IP/identifier
- Constant-time password comparison (prevents timing attacks)
- Email enumeration prevention (forgotPassword always returns success)
- CSRF protection via SameSite=strict cookies
- Rate limiting per IP via Redis

### Auth API Endpoints
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/change-password
GET  /api/v1/users/me
PATCH /api/v1/users/me
GET  /api/v1/users/:username
DELETE /api/v1/users/me
GET  /api/v1/subscriptions/plans
GET  /api/v1/subscriptions/me
POST /api/v1/subscriptions/checkout
POST /api/v1/subscriptions/portal
POST /api/v1/subscriptions/webhook
POST /api/internal/verify-token      ← service-to-service
GET  /api/internal/users/:userId      ← service-to-service
```

---

## Stream Service — Complete File List

**Root:** `package.json`, `tsconfig.json`, `Dockerfile`, `.env.example`

**src/:** `index.ts` — boots Fastify API + RTMP server + WebSocket server

**src/types/:** `index.ts` — LiveStreamState, RtmpSession, WsMessage, DestinationState, SourceTransform, BullMQ job payloads

**src/plugins/:** `index.ts`

**src/middleware/:** `auth.middleware.ts`

**src/schemas/:** `stream.schema.ts` — CreateStream, Destination, Scene, Source, SourceTransform with filters

**src/routes/:** `index.ts`, `stream.routes.ts`

**src/services/:**
- `multicast.service.ts` — FFmpeg fan-out, one RTMP ingest to N platforms, auto-retry (3 attempts, exponential backoff), per-destination process management
- `recording.service.ts` — records stream to MP4, uploads to R2 via AWS S3 client
- `scene.service.ts` — scene/source CRUD, optimistic active scene switching via Redis
- `stats.service.ts` — polls bitrate/fps/viewers every 3s, publishes via Redis pub/sub

**src/rtmp/:** `rtmp.server.ts` — node-media-server with stream key authentication, prePublish/donePublish lifecycle, duplicate stream prevention

**src/websocket/:** `ws.server.ts` — JWT-authenticated WebSocket, scene switch/source update messages, Redis pub/sub → WebSocket relay for stats

**src/workers/:** `index.ts` — BullMQ workers for multicast start/stop, recording start/stop

**src/utils/:** `config.ts`, `errors.ts`, `logger.ts`, `prisma.ts`, `redis.ts`, `shutdown.ts`

**src/__tests__/:** `stream.test.ts`

### Stream API Endpoints
```
POST   /api/v1/streams
GET    /api/v1/streams
GET    /api/v1/streams/:id
GET    /api/v1/streams/:id/key
POST   /api/v1/streams/:id/end
POST   /api/v1/streams/:id/destinations
DELETE /api/v1/streams/:id/destinations/:destId
GET    /api/v1/streams/:id/scenes
POST   /api/v1/streams/:id/scenes
POST   /api/v1/streams/:id/scenes/:sceneId/switch
POST   /api/v1/streams/:id/scenes/:sceneId/sources
PATCH  /api/v1/streams/:id/scenes/:sceneId/sources/:sourceId
WS     /ws?streamId=&token=    ← real-time control
```

### RTMP Flow
```
Mobile/OBS → RTMP ingest (port 1935) → node-media-server
  → prePublish: validate stream key → fetch stream from DB
  → Auth passed → update DB status to LIVE
  → Set Redis live state
  → Launch FFmpeg per destination (multicast)
  → Start recording FFmpeg process
  → HLS segments served on port 8000
```

---

## Media Service — Complete File List

**Root:** `package.json`, `tsconfig.json`, `Dockerfile`, `.env.example`

**src/:** `index.ts`

**src/types/:** `index.ts` — ExportFormat, TimelineClip, ExportJobPayload, TranscodeJobPayload

**src/plugins/:** `index.ts`

**src/middleware/:** `auth.middleware.ts`

**src/schemas/:** `media.schema.ts` — PresignedUpload, CreateProject, AddClip, Export, Trim, ColorGrade, ExtractAudio

**src/routes/:** `index.ts`, `media.routes.ts`

**src/services/:**
- `editor.service.ts` — FFmpeg operations: trim, merge clips, extract audio, color grading with LUTs, full project export to any format, thumbnail generation, video probing
- `upload.service.ts` — R2 presigned URL generation, file deletion, file existence check

**src/workers/:** `index.ts` — BullMQ: export-queue (concurrency 2), transcode-queue (concurrency 4), thumbnail-queue (concurrency 10)

**src/utils/:** `config.ts`, `errors.ts`, `logger.ts`, `prisma.ts`, `shutdown.ts`

**src/__tests__/:** `media.test.ts`

### Media API Endpoints
```
POST /api/v1/media/presigned-upload      ← get R2 presigned PUT URL
POST /api/v1/media/:assetId/upload-complete ← confirm upload, trigger thumbnail
GET  /api/v1/media                       ← list assets
DELETE /api/v1/media/:assetId
POST /api/v1/projects
GET  /api/v1/projects
GET  /api/v1/projects/:id
POST /api/v1/projects/:id/clips
POST /api/v1/projects/:id/export         ← queues BullMQ job, returns exportId
GET  /api/v1/projects/:id/exports/:exportId ← poll for status + download URL
POST /api/v1/projects/:id/trim
POST /api/v1/projects/:id/color-grade
```

### Upload Flow (Mobile → R2 Direct)
```
1. Mobile calls POST /media/presigned-upload → gets presignedUrl + assetId
2. Mobile PUTs file directly to R2 presignedUrl (no server bandwidth used)
3. Mobile calls POST /media/:assetId/upload-complete
4. Server queues thumbnail generation job
5. Asset is ready in library
```

### FFmpeg: Two Locations
- **On device** (`ffmpeg-kit-react-native`) — trim, split, quick operations, instant, no internet
- **On server** (`fluent-ffmpeg`) — final export, merge all clips, color grading, format conversion, upload to R2

---

## AI Service — Complete File List

**Root:** `package.json`, `tsconfig.json`, `Dockerfile`, `.env.example`

**src/:** `index.ts`

**src/types/:** `index.ts` — DetectedObject, BoundingBox, OcrResult, TranslationResult, SceneDescriptionResult, all BullMQ job payloads

**src/plugins/:** `index.ts`

**src/middleware/:** `auth.middleware.ts` — authenticate + requireAiPlan (PRO/CREATOR/ENTERPRISE only) + aiRateLimit (per-plan per-minute Redis counter)

**src/schemas/:** `ai.schema.ts` — DetectSchema, OcrSchema, TranslateSchema, SceneDescribeSchema, LiveAnalyzeSchema

**src/routes/:** `index.ts`, `ai.routes.ts`

**src/services/:**
- `vision.service.ts` — Google Cloud Vision API: object detection, label detection, face detection, safe search. Results cached in Redis 6hrs per image hash.
- `ocr.service.ts` — Google Cloud Vision DOCUMENT_TEXT_DETECTION. Full text + block-level with bounding boxes + language detection. Cached 24hrs.
- `translation.service.ts` — Google Cloud Translate v2. Single + batch translation. Language detection. Cached 48hrs.
- `scene.service.ts` — OpenAI Vision API (gpt-4o-mini). Returns description, tags, mood, suggestedTitle as JSON. Also generates stream title suggestions.

**src/workers/:** `index.ts` — BullMQ ai-queue (concurrency 5, rate limited 50/min)

**src/utils/:** `config.ts`, `errors.ts`, `logger.ts`, `prisma.ts`, `redis.ts`, `shutdown.ts`

**src/__tests__/:** `ai.test.ts`

### AI API Endpoints
```
POST /api/v1/ai/detect              ← object/label/face detection
POST /api/v1/ai/ocr                 ← text extraction
POST /api/v1/ai/translate           ← single or batch translation
POST /api/v1/ai/detect-language     ← identify language
GET  /api/v1/ai/languages           ← supported languages (no auth)
POST /api/v1/ai/scene/describe      ← AI scene description
POST /api/v1/ai/scene/suggest-titles ← generate stream title ideas
GET  /api/v1/ai/plans               ← plan access info (no auth)
```

---

## Shared Package

**Files:** `package.json`, `tsconfig.json`, `types/index.ts`, `utils/index.ts`

### types/index.ts exports
ApiResponse, ApiError, PaginationMeta, Plan, PlanLimits, User, UserWithSubscription, AuthTokens, Platform, Stream, StreamWithDetails, Destination, Scene, Source, SourceConfig, LiveStreamState, Recording, MediaAsset, Project, Clip, Export, Subscription, StreamStats, all AI result types, WsMessage, ErrorCodes

### utils/index.ts exports
Date helpers, string helpers (slugify, maskEmail), number helpers (bytesToGB), video helpers (secondsToTimecode, parseResolution), pagination builder, API response builders

---

## API Contract — Complete File List

Located at `api-contract/` (one level above both repos).

**Root:** `package.json`, `tsconfig.json`

**src/:**
- `types.ts` — ALL shared TypeScript types (mirrors shared package, framework-agnostic)
- `client.ts` — base `apiFetch()` with auto token refresh on 401, timeout, `ApiClientError` class
- `auth.api.ts` — `authApi`, `userApi`, `subscriptionApi` typed functions
- `stream.api.ts` — `streamApi`, `connectStreamWs()` typed WebSocket client
- `media.api.ts` — `mediaApi`, `projectApi` typed functions
- `ai.api.ts` — `aiApi` typed functions
- `index.ts` — barrel export of everything

### Installation
```bash
# In mobile project
npm install ../api-contract   # local file link
# OR
npm install @streamforge/api-contract  # after publishing to npm
```

### Usage in React Native
```typescript
import { configureApiClient, authApi, streamApi, mediaApi, aiApi } from '@streamforge/api-contract'

// Configure once in App.tsx
configureApiClient({
  baseUrl:        'https://api.streamforge.app',
  getAccessToken: () => tokenStore.getState().accessToken,
  onTokenExpired: () => tokenStore.getState().refresh(),
  onUnauthorized: () => navigation.navigate('Login'),
})

// Use anywhere
const { user, accessToken } = await authApi.login({ identifier: 'email', password: 'pass' })
const streams = await streamApi.list()
const { presignedUrl, assetId } = await mediaApi.getPresignedUploadUrl({ filename: 'video.mp4', contentType: 'video/mp4', size: fileSize })
const detection = await aiApi.detect({ imageUrl, features: ['OBJECT_DETECTION'] })
```

---

## Docker Setup

`docker-compose.yml` at backend root runs:
- **postgres** — PostgreSQL 16 Alpine, port 5432
- **redis** — Redis 7 Alpine, port 6379, append-only persistence, 256MB max memory
- **auth-service** — port 3001
- Optional dev tools (pgAdmin port 5050, Redis Commander port 8081) via `--profile tools`

### Environment Variables Pattern
Every service has `.env.example` with all required variables. Key shared vars:
```
DATABASE_URL=postgresql://streamforge:password@localhost:5432/streamforge_dev
REDIS_URL=redis://localhost:6379
INTERNAL_SERVICE_SECRET=  ← service-to-service auth
JWT_ACCESS_SECRET=        ← min 32 chars
JWT_REFRESH_SECRET=       ← min 32 chars
```

---

## React Native Mobile Project

**Project type:** Bare React Native CLI (NOT Expo)
**Reason:** Requires `ffmpeg-kit-react-native`, VisionCamera frame processors, custom RTMP — all incompatible with Expo managed workflow.

### Mobile Tech Stack

| Concern | Library |
|---|---|
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| State | Zustand + MMKV persistence |
| Server state | TanStack Query v5 |
| Camera | react-native-vision-camera v4 |
| Video playback | react-native-video v6 |
| Video editing (on device) | ffmpeg-kit-react-native v6 |
| Animations | Reanimated v3 |
| Gestures | Gesture Handler v2 |
| Canvas/Overlays | @shopify/react-native-skia |
| Fast storage | react-native-mmkv |
| Forms | React Hook Form + Zod |
| Icons | lucide-react-native |
| Payments | @stripe/stripe-react-native |
| Bottom sheets | @gorhom/bottom-sheet |
| Toasts | react-native-toast-message |

### Path Aliases (babel.config.js + tsconfig.json)
```
@app        → src/app
@features   → src/features
@core       → src/core
@shared     → src/shared
@assets     → assets
@shared/components → src/shared/components
@shared/theme      → src/shared/theme
@shared/constants  → src/shared/constants
@core/store        → src/core/store
@core/hooks        → src/core/hooks
@core/api          → src/core/api
@app/navigation    → src/app/navigation
```

**Critical:** Must install `babel-plugin-module-resolver` for path aliases to work.
**Critical:** Always run `npx react-native start --reset-cache` after changing `babel.config.js`.

---

## Mobile Project Structure — Complete File List

### Root (6 files)
`App.tsx`, `package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `README.md`

### src/app/navigation/ (4 files)
- `types.ts` — ALL typed screen params: RootStack, OnboardingStack, MainTab, StudioStack, EditorStack, LibraryStack, ProfileStack
- `RootNavigator.tsx` — auth gate: shows Onboarding or Main based on `isLoggedIn`
- `OnboardingNavigator.tsx` — Welcome → Login → Register → VerifyEmail → ForgotPassword → ResetPassword
- `MainNavigator.tsx` — bottom tab bar (Studio, Editor, Library, Profile) each with nested stack navigator

### src/app/providers/ (1 file)
- `AppProviders.tsx` — GestureHandler + SafeArea + QueryClient + NavigationContainer + BottomSheetModal + Toast

### src/core/api/ (2 files)
- `setup.ts` — `setupApiClient()` call once in App.tsx, configures API contract client with token store
- `queryClient.ts` — TanStack Query client config + all `QueryKeys` constants

### src/core/store/ (2 files)
- `tokenStore.ts` — Zustand + MMKV: stores access/refresh tokens, auto-refresh logic
- `authStore.ts` — Zustand + MMKV: user session, login/register/logout/loadUser actions

### src/core/hooks/ (2 files)
- `useAuth.ts` — wraps authStore with error handling, exposes isPro/isCreator helpers
- `useToast.ts` — wraps react-native-toast-message with success/error/info/hide

### src/shared/theme/ (2 files)
- `tokens.ts` — Colors, Typography, Spacing (4pt grid), Radius, Shadows, ZIndex, Duration, IconSize
- `index.ts` — barrel export

### src/shared/constants/ (1 file)
- `index.ts` — PLATFORM_RTMP_URLS, PLATFORM_COLORS, PLAN_LIMITS, EXPORT_FORMATS, ASPECT_RATIOS, SUPPORTED_LANGUAGES, VALIDATION regex, POLL_INTERVALS, FILE_LIMITS

### src/shared/components/ (11 files)
- `Button.tsx` — primary/secondary/ghost/danger variants, sizes sm/md/lg, loading state
- `Input.tsx` — label, error, hint, password toggle, left icon
- `UI.tsx` — Card, Badge (with plan/live variants), Avatar, Skeleton, Screen, Divider
- `Header.tsx` — back button, title, subtitle, right action slot
- `ProgressBar.tsx` — animated linear bar + CircularProgress variant
- `EmptyState.tsx` — icon, title, message, optional action button
- `Modal.tsx` — Modal + ConfirmModal shorthand with destructive variant
- `BottomSheet.tsx` — wraps @gorhom/bottom-sheet with ref API (open/close), scrollable variant
- `Toast.tsx` — custom toastConfig for react-native-toast-message (success/error/info)
- `ListItem.tsx` — ListItem + ListSection + ListSeparator for settings/menus
- `index.ts` — barrel export of all components (direct file paths, not folder paths)

### src/shared/index.ts (1 file)
Top-level barrel — exports all components, theme tokens, and constants.

### src/features/auth/ (4 files)
**hooks/:** `useLogin.ts` — RHF + Zod, calls authStore.login. `useRegister.ts` — 5 field validation + password matching.
**screens/:** `index.ts` (barrel), `SplashScreen.tsx` (animated logo), `WelcomeScreen.tsx` (feature showcase + CTAs), `LoginScreen.tsx` (full form + forgot password link), `RegisterScreen.tsx` (5 fields + live password strength indicator), `VerifyEmailScreen.tsx` (resend with 60s cooldown), `ForgotPasswordScreen.tsx` (form + success state), `ResetPasswordScreen.tsx` (new password + confirm + success state)

### src/features/studio/ (6 files)
**store/:** `streamStore.ts` — active stream, live state, scenes, stats, mic/camera mute, end stream
**hooks/:** `useStream.ts` (TanStack Query: list, getById, streamKey, create, addDestination, removeDestination), `useScenes.ts` (getScenes, createScene, switchScene with optimistic update, addSource, updateSource)
**components/:** `SceneCard.tsx` (thumbnail, name, source count, active indicator), `SourceItem.tsx` (type icon, visibility toggle), `StatsBar.tsx` (LIVE badge, bitrate with color coding, FPS, dropped frames warning, viewer count)
**screens/:** placeholder implementations for StudioHome, StreamSetup, LiveStudio, Destinations, SceneManager, StreamSummary

### src/features/editor/ (6 files)
**store/:** `editorStore.ts` — project, clips (grouped by track), timeline playback state, selected clip, zoom, scroll, active panel
**hooks/:** `useProject.ts` (TanStack Query: list, getById, create, addClip, export, pollExportStatus with auto-stop), `useTimeline.ts` (play/pause/seek, zoom in/out, pixel ↔ time conversion, playback ticker via setInterval)
**components/:** `Timeline.tsx` (scrollable multi-track, time ruler with ticks, playhead), `ClipItem.tsx` (width from duration × pixelsPerSecond, selection handles, video/audio distinction), `Toolbar.tsx` (playback controls, timecode, tool buttons: trim/split/audio/color/effects/AI/export, disabled when no clip selected)
**screens/:** placeholders for ProjectsList, ProjectSetup, EditorCanvas, ExportSettings, ExportProgress, ExportComplete

### src/features/library/ (1 file)
**hooks/:** `useAssets.ts` — useAssets (filtered list), useDeleteAsset, useUploadAsset (full 3-step presigned URL flow with progress callback)

### src/features/profile/ (1 file)
**hooks/:** `useProfile.ts` — useMe, useUpdateProfile, useSubscription, usePlans, useCreateCheckout, useBillingPortal, useDeleteAccount

---

## Navigation Flow

```
App starts
  └── SplashScreen (while loadUser() runs)
        ├── No token → OnboardingNavigator
        │     ├── WelcomeScreen
        │     ├── LoginScreen
        │     ├── RegisterScreen
        │     ├── VerifyEmailScreen
        │     ├── ForgotPasswordScreen
        │     └── ResetPasswordScreen
        └── Has token → MainNavigator (bottom tabs)
              ├── Studio tab → StudioStack
              │     ├── StudioHome
              │     ├── StreamSetup
              │     ├── Destinations
              │     ├── SceneManager
              │     ├── LiveStudio (fullscreen)
              │     └── StreamSummary
              ├── Editor tab → EditorStack
              │     ├── ProjectsList
              │     ├── ProjectSetup
              │     ├── EditorCanvas
              │     ├── ExportSettings
              │     ├── ExportProgress
              │     └── ExportComplete
              ├── Library tab → LibraryStack
              │     ├── LibraryHome
              │     └── AssetDetail
              └── Profile tab → ProfileStack
                    ├── ProfileHome
                    ├── EditProfile
                    ├── Subscription
                    └── Settings
```

---

## Design System

### Colors (Dark-first)
```
bg:          #0a0a0a   ← app background
bgElevated:  #141414   ← cards, panels
bgSurface:   #1e1e1e   ← inputs
bgOverlay:   #2a2a2a   ← modals
brand:       #6366f1   ← indigo, primary action
brandLight:  #818cf8
brandDark:   #4f46e5
success:     #22c55e
warning:     #f59e0b
error:       #ef4444
live:        #ef4444   ← red live indicator
```

### Typography
Inter font family, 6 sizes: xs(11) sm(13) base(15) md(17) lg(20) xl(24) xxl(30) xxxl(38)

### Spacing
4pt grid: xxs(2) xs(4) sm(8) md(12) lg(16) xl(20) xxl(24) 3xl(32) 4xl(40) 5xl(48) 6xl(64)

---

## What's Still To Build

### Phase 7 — Studio Screens (Next)
- `StudioHomeScreen` — stream list, create new stream CTA, live indicator
- `StreamSetupScreen` — title, destinations selector, scene preview
- `LiveStudioScreen` — fullscreen camera feed, scene switcher, StatsBar overlay, PiP second camera, AI panel
- `DestinationsScreen` — add/remove YouTube/Twitch/etc with RTMP form
- `SceneManagerScreen` — drag-reorder scenes, add/edit sources
- `StreamSummaryScreen` — duration, peak viewers, recording download

### Phase 8 — Editor Screens
- `ProjectsListScreen` — grid of projects with thumbnail, status, last edited
- `ProjectSetupScreen` — resolution/fps/aspectRatio selector
- `EditorCanvasScreen` — video preview + Timeline + Toolbar wired together
- `ExportSettingsScreen` — format/resolution/fps/bitrate selectors with plan gating
- `ExportProgressScreen` — real-time progress bar polling export status
- `ExportCompleteScreen` — download/share CTA with file size and duration

### Phase 9 — Library & Profile Screens
- `LibraryHomeScreen` — tabbed (Videos/Images/Audio/Recordings) with upload button
- `AssetDetailScreen` — preview, metadata, delete, add to project
- `ProfileHomeScreen` — avatar, plan badge, stats
- `EditProfileScreen` — displayName, bio, avatar upload
- `SubscriptionScreen` — plan cards with limits, upgrade/downgrade via Stripe WebView
- `SettingsScreen` — notifications, storage, privacy, logout, delete account

### Phase 10 — AI Feature Screens
- Live OCR overlay on stream
- Object detection bounding box overlay
- Translation panel during live stream
- Scene description in editor

### Phase 11 — Polish & Monetisation
- Stripe subscription flow with plan comparison
- Push notifications (stream events, export complete)
- App Store / Play Store submission prep
- Analytics dashboard

---

## How to Set Up From Scratch

### Backend
```bash
cd streamforge-backend
cp packages/auth-service/.env.example packages/auth-service/.env
# Edit .env with real values

docker-compose up -d postgres redis

cd packages/auth-service
npx prisma migrate dev
npx prisma db seed

# From backend root
pnpm install
pnpm dev
```

### Mobile
```bash
# Initialize fresh RN project (gets android/ and ios/ folders)
npx react-native@latest init StreamForgeMobile
cd StreamForgeMobile

# Copy our files (NOT android/, ios/, index.js, package.json)
cp -r path/to/our/src ./src
cp path/to/our/App.tsx .
cp path/to/our/babel.config.js .
cp path/to/our/metro.config.js .
cp path/to/our/tsconfig.json .

# Merge our dependencies into the generated package.json
# (do NOT replace package.json — keep the name/version from init)

# Install
npm install
npm install --save-dev babel-plugin-module-resolver

# Build api-contract first
cd ../api-contract && npm install && npm run build && cd ../StreamForgeMobile
npm install ../api-contract

# iOS
cd ios && pod install && cd ..

# Add Android permissions to android/app/src/main/AndroidManifest.xml:
# CAMERA, RECORD_AUDIO, INTERNET, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE

# Run
npx react-native start --reset-cache
npx react-native run-android
npx react-native run-ios
```

---

## Key Architectural Decisions Summary

1. **Separate repos** for backend and mobile — React Native's Metro bundler conflicts with pnpm workspaces
2. **API contract as standalone package** — consumed by mobile via `file:../api-contract`, publishable to npm for production
3. **FFmpeg in two places** — on-device for instant edits (no upload), server-side for quality exports
4. **Redis for live state** — stream status, active scene, viewer count in Redis for sub-millisecond reads; DB for persistence
5. **Presigned R2 uploads** — mobile uploads directly to Cloudflare R2, server never handles binary data
6. **BullMQ for all async jobs** — exports, transcodes, thumbnails, AI inference all queued
7. **Argon2id for passwords** — not bcrypt, Argon2id is the current gold standard (memory-hard)
8. **Token rotation on refresh** — every refresh issues new refresh token and invalidates old one
9. **On-device AI first** — use MLKit/TFLite on device where possible, fall back to server for heavy models
10. **Plan enforcement at API level** — not just UI — server validates plan limits on every request
