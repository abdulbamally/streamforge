
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  username: 'username',
  displayName: 'displayName',
  avatarUrl: 'avatarUrl',
  bio: 'bio',
  passwordHash: 'passwordHash',
  emailVerified: 'emailVerified',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OAuthAccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  providerUid: 'providerUid',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.TokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  token: 'token',
  expiresAt: 'expiresAt',
  usedAt: 'usedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubId: 'stripeSubId',
  plan: 'plan',
  status: 'status',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  trialEnd: 'trialEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  stripeInvoiceId: 'stripeInvoiceId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  paidAt: 'paidAt',
  createdAt: 'createdAt'
};

exports.Prisma.StreamScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  thumbnailUrl: 'thumbnailUrl',
  status: 'status',
  streamKey: 'streamKey',
  ingestUrl: 'ingestUrl',
  viewerCount: 'viewerCount',
  peakViewers: 'peakViewers',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DestinationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  platform: 'platform',
  label: 'label',
  rtmpUrl: 'rtmpUrl',
  streamKey: 'streamKey',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StreamDestinationScalarFieldEnum = {
  streamId: 'streamId',
  destinationId: 'destinationId',
  status: 'status',
  error: 'error',
  startedAt: 'startedAt'
};

exports.Prisma.SceneScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  name: 'name',
  order: 'order',
  isActive: 'isActive',
  thumbnail: 'thumbnail',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SourceScalarFieldEnum = {
  id: 'id',
  sceneId: 'sceneId',
  type: 'type',
  label: 'label',
  order: 'order',
  isVisible: 'isVisible',
  config: 'config',
  assetUrl: 'assetUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RecordingScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  url: 'url',
  duration: 'duration',
  sizeBytes: 'sizeBytes',
  format: 'format',
  createdAt: 'createdAt'
};

exports.Prisma.StreamAnalyticScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  timestamp: 'timestamp',
  viewerCount: 'viewerCount',
  bitrate: 'bitrate',
  droppedFrames: 'droppedFrames',
  latencyMs: 'latencyMs'
};

exports.Prisma.SocialFollowScalarFieldEnum = {
  id: 'id',
  followerId: 'followerId',
  followeeId: 'followeeId',
  createdAt: 'createdAt'
};

exports.Prisma.StreamCommentScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  userId: 'userId',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.StreamReactionScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  userId: 'userId',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.LiveChatMessageScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  userId: 'userId',
  body: 'body',
  createdAt: 'createdAt'
};

exports.Prisma.CreatorWalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  balanceCents: 'balanceCents',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WalletLedgerEntryScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  type: 'type',
  amountCents: 'amountCents',
  balanceAfter: 'balanceAfter',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CreatorGiftScalarFieldEnum = {
  id: 'id',
  streamId: 'streamId',
  senderId: 'senderId',
  receiverId: 'receiverId',
  coinAmount: 'coinAmount',
  giftType: 'giftType',
  createdAt: 'createdAt'
};

exports.Prisma.PayoutRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amountCents: 'amountCents',
  status: 'status',
  requestedAt: 'requestedAt',
  processedAt: 'processedAt'
};

exports.Prisma.MediaAssetScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  filename: 'filename',
  originalName: 'originalName',
  mimeType: 'mimeType',
  sizeBytes: 'sizeBytes',
  url: 'url',
  thumbnailUrl: 'thumbnailUrl',
  duration: 'duration',
  width: 'width',
  height: 'height',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  thumbnailUrl: 'thumbnailUrl',
  duration: 'duration',
  resolution: 'resolution',
  fps: 'fps',
  aspectRatio: 'aspectRatio',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClipScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  assetId: 'assetId',
  assetUrl: 'assetUrl',
  trackIndex: 'trackIndex',
  startTime: 'startTime',
  endTime: 'endTime',
  trimIn: 'trimIn',
  trimOut: 'trimOut',
  volume: 'volume',
  opacity: 'opacity',
  speed: 'speed',
  effects: 'effects',
  colorGrade: 'colorGrade',
  audioConfig: 'audioConfig',
  transform: 'transform',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExportScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  format: 'format',
  resolution: 'resolution',
  fps: 'fps',
  videoBitrate: 'videoBitrate',
  audioBitrate: 'audioBitrate',
  status: 'status',
  progress: 'progress',
  outputUrl: 'outputUrl',
  sizeBytes: 'sizeBytes',
  error: 'error',
  jobId: 'jobId',
  createdAt: 'createdAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  metadata: 'metadata',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.OAuthProvider = exports.$Enums.OAuthProvider = {
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
  GITHUB: 'GITHUB'
};

exports.TokenType = exports.$Enums.TokenType = {
  EMAIL_VERIFY: 'EMAIL_VERIFY',
  PASSWORD_RESET: 'PASSWORD_RESET',
  REFRESH: 'REFRESH'
};

exports.Plan = exports.$Enums.Plan = {
  FREE: 'FREE',
  PRO: 'PRO',
  CREATOR: 'CREATOR',
  ENTERPRISE: 'ENTERPRISE'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  PAST_DUE: 'PAST_DUE',
  TRIALING: 'TRIALING',
  INCOMPLETE: 'INCOMPLETE'
};

exports.StreamStatus = exports.$Enums.StreamStatus = {
  IDLE: 'IDLE',
  LIVE: 'LIVE',
  ENDED: 'ENDED',
  ERROR: 'ERROR'
};

exports.Platform = exports.$Enums.Platform = {
  YOUTUBE: 'YOUTUBE',
  TWITCH: 'TWITCH',
  FACEBOOK: 'FACEBOOK',
  TIKTOK: 'TIKTOK',
  INSTAGRAM: 'INSTAGRAM',
  CUSTOM: 'CUSTOM'
};

exports.SourceType = exports.$Enums.SourceType = {
  CAMERA: 'CAMERA',
  SCREEN: 'SCREEN',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  TEXT: 'TEXT',
  BROWSER: 'BROWSER',
  AUDIO: 'AUDIO'
};

exports.WalletTxType = exports.$Enums.WalletTxType = {
  TOP_UP: 'TOP_UP',
  GIFT_SENT: 'GIFT_SENT',
  GIFT_RECEIVED: 'GIFT_RECEIVED',
  PAYOUT: 'PAYOUT',
  ADJUSTMENT: 'ADJUSTMENT'
};

exports.ProjectStatus = exports.$Enums.ProjectStatus = {
  DRAFT: 'DRAFT',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  ARCHIVED: 'ARCHIVED'
};

exports.ExportFormat = exports.$Enums.ExportFormat = {
  MP4: 'MP4',
  MOV: 'MOV',
  WEBM: 'WEBM',
  MKV: 'MKV',
  GIF: 'GIF',
  MP3: 'MP3'
};

exports.JobStatus = exports.$Enums.JobStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  User: 'User',
  OAuthAccount: 'OAuthAccount',
  Token: 'Token',
  Subscription: 'Subscription',
  Invoice: 'Invoice',
  Stream: 'Stream',
  Destination: 'Destination',
  StreamDestination: 'StreamDestination',
  Scene: 'Scene',
  Source: 'Source',
  Recording: 'Recording',
  StreamAnalytic: 'StreamAnalytic',
  SocialFollow: 'SocialFollow',
  StreamComment: 'StreamComment',
  StreamReaction: 'StreamReaction',
  LiveChatMessage: 'LiveChatMessage',
  CreatorWallet: 'CreatorWallet',
  WalletLedgerEntry: 'WalletLedgerEntry',
  CreatorGift: 'CreatorGift',
  PayoutRequest: 'PayoutRequest',
  MediaAsset: 'MediaAsset',
  Project: 'Project',
  Clip: 'Clip',
  Export: 'Export',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
