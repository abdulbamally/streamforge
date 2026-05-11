// ============================================================
//  StreamForge API Contract — Main Entry Point
//
//  USAGE IN REACT NATIVE:
//
//  1. Configure once at app startup (e.g. App.tsx):
//
//     import { configureApiClient } from '@streamforge/api-contract'
//
//     configureApiClient({
//       baseUrl:        'https://api.streamforge.app',
//       getAccessToken: () => tokenStore.getState().accessToken,
//       onTokenExpired: () => tokenStore.getState().refresh(),
//       onUnauthorized: () => navigationRef.navigate('Login'),
//     })
//
//  2. Use anywhere in the app:
//
//     import { authApi, streamApi, mediaApi, aiApi } from '@streamforge/api-contract'
//
//     const user = await authApi.login({ identifier: 'email', password: 'pass' })
//     const streams = await streamApi.list()
//     const { presignedUrl } = await mediaApi.getPresignedUploadUrl({ ... })
//     const result = await aiApi.detect({ imageUrl, features: ['OBJECT_DETECTION'] })
//
// ============================================================

// ─── Client configuration ─────────────────────────────────────
export { configureApiClient, ApiClientError } from './client'
export type { ClientConfig } from './client'

// ─── All types ────────────────────────────────────────────────
export type {
  // Base
  ApiResponse,
  ApiError,
  PaginationMeta,
  // User & Auth
  User,
  UserWithSubscription,
  AuthTokens,
  Plan,
  PlanLimits,
  PlanInfo,
  Subscription,
  // Streaming
  Stream,
  StreamWithDetails,
  StreamStatus,
  Destination,
  StreamDestination,
  Scene,
  Source,
  SourceType,
  SourceConfig,
  SourceFilter,
  Platform,
  LiveStreamState,
  LiveDestinationState,
  Recording,
  StreamStats,
  // Media & Editor
  MediaAsset,
  Project,
  ProjectWithTimeline,
  ProjectStatus,
  Clip,
  Export,
  ExportFormat,
  JobStatus,
  // AI
  DetectionResult,
  DetectedObject,
  BoundingBox,
  OcrResult,
  TranslationResult,
  SceneDescriptionResult,
  // WebSocket
  WsMessage,
  WsMessageType,
} from './types'

export { API_ERROR_CODES } from './types'

// ─── Auth service APIs ────────────────────────────────────────
export { authApi, userApi, subscriptionApi } from './auth.api'
export type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
  CreateCheckoutDto,
  CreateRegionalCheckoutDto,
  PaymentProvider,
  AuthResponse,
  RefreshResponse,
} from './auth.api'

// ─── Stream service APIs ──────────────────────────────────────
export { streamApi, connectStreamWs } from './stream.api'
export type {
  CreateStreamDto,
  UpdateStreamDto,
  CreateDestinationDto,
  CreateSceneDto,
  UpdateSceneDto,
  CreateSourceDto,
  UpdateSourceDto,
  StreamKeyResponse,
  StreamWsOptions,
} from './stream.api'

// ─── Media service APIs ───────────────────────────────────────
export { mediaApi, projectApi } from './media.api'
export type {
  PresignedUploadDto,
  PresignedUploadResponse,
  CreateProjectDto,
  UpdateProjectDto,
  AddClipDto,
  UpdateClipDto,
  ExportDto,
  TrimDto,
  ColorGradeDto,
  ExtractAudioDto,
  ListAssetsQuery,
} from './media.api'

// ─── AI service APIs ──────────────────────────────────────────
export { aiApi } from './ai.api'
export type {
  DetectDto,
  DetectionFeature,
  OcrDto,
  TranslateDto,
  SceneDescribeDto,
  SuggestTitlesDto,
} from './ai.api'
