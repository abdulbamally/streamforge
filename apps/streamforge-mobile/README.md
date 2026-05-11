# StreamForge Mobile

React Native mobile app for StreamForge — live streaming, video editing, and AI features.

---

## Project Structure

```
streamforge-mobile/
├── App.tsx                         ← Entry point
├── babel.config.js                 ← Path aliases (@app, @features, @core, @shared)
├── metro.config.js
├── package.json
├── tsconfig.json
│
└── src/
    ├── app/
    │   ├── navigation/
    │   │   ├── types.ts            ← All typed screen params
    │   │   ├── RootNavigator.tsx   ← Auth gate (Onboarding vs Main)
    │   │   ├── OnboardingNavigator.tsx
    │   │   └── MainNavigator.tsx   ← Tab bar + nested stacks
    │   └── providers/
    │       └── AppProviders.tsx    ← QueryClient, Navigation, SafeArea
    │
    ├── features/
    │   ├── auth/screens/           ← Login, Register, Verify, ForgotPassword
    │   ├── studio/screens/         ← StudioHome, StreamSetup, LiveStudio, Scenes
    │   ├── editor/screens/         ← ProjectsList, EditorCanvas, Export
    │   ├── library/screens/        ← LibraryHome, AssetDetail
    │   └── profile/screens/        ← Profile, Subscription, Settings
    │
    ├── core/
    │   ├── api/
    │   │   ├── setup.ts            ← configureApiClient() — call once in App.tsx
    │   │   └── queryClient.ts      ← TanStack Query client + QueryKeys
    │   └── store/
    │       ├── tokenStore.ts       ← Access/refresh tokens → MMKV
    │       └── authStore.ts        ← User session state → MMKV
    │
    └── shared/
        ├── theme/
        │   └── tokens.ts           ← Colors, Typography, Spacing, Radius, Shadows
        └── components/
            ├── Button.tsx          ← primary, secondary, ghost, danger
            ├── Input.tsx           ← text, password, with icons
            └── UI.tsx              ← Card, Badge, Avatar, Skeleton, Screen, Divider
```

---

## Setup

### Prerequisites
- Node.js 20+
- Xcode 15+ (iOS)
- Android Studio + SDK 34 (Android)
- CocoaPods (iOS)

### Install
```bash
npm install -g yarn
yarn install

# iOS
cd ios && pod install && cd ..

# Start
yarn start
yarn ios      # or yarn android
```

### Path Aliases
Use these imports anywhere in the project:
```ts
import { Button }      from '@shared/components/Button'
import { Colors }      from '@shared/theme/tokens'
import { authStore }   from '@core/store/authStore'
import { QueryKeys }   from '@core/api/queryClient'
import { LoginScreen } from '@features/auth/screens/LoginScreen'
```

### API Contract
The app consumes `@streamforge/api-contract` — install it from the local package:
```bash
yarn add @streamforge/api-contract@file:../api-contract
```

Usage:
```ts
import { authApi, streamApi, mediaApi, aiApi } from '@streamforge/api-contract'

// Login
const result = await authApi.login({ identifier: 'email@example.com', password: 'pass' })

// List streams
const streams = await streamApi.list()

// Upload video (presigned URL flow)
const { presignedUrl, assetId } = await mediaApi.getPresignedUploadUrl({
  filename: 'video.mp4',
  contentType: 'video/mp4',
  size: fileSize,
})
// PUT file to presignedUrl directly
// Then confirm:
await mediaApi.confirmUpload(assetId)

// AI detection
const result = await aiApi.detect({
  imageUrl: frameUrl,
  features: ['OBJECT_DETECTION', 'LABEL_DETECTION'],
})
```

---

## Build Phases

| Phase | Feature | Status |
|---|---|---|
| 1 | Backend — Auth Service | ✅ Done |
| 2 | Backend — Stream Service | ✅ Done |
| 3 | Backend — Media Service | ✅ Done |
| 4 | Backend — AI Service | ✅ Done |
| 5 | API Contract | ✅ Done |
| 6 | RN Scaffold + Navigation + Design System | ✅ Done |
| 7 | Auth Screens (Login, Register, Verify) | 🔜 Next |
| 8 | Studio Screens (Live streaming) | 🔜 Planned |
| 9 | Editor Screens (Timeline + FFmpeg) | 🔜 Planned |
| 10 | AI Feature Screens | 🔜 Planned |
