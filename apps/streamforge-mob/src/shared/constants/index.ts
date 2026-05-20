// ============================================================
//  App Constants
// ============================================================

// ─── Platform RTMP URLs ───────────────────────────────────────
export const PLATFORM_RTMP_URLS: Record<string, string> = {
  YOUTUBE:   'rtmp://a.rtmp.youtube.com/live2',
  TWITCH:    'rtmp://live.twitch.tv/app',
  FACEBOOK:  'rtmps://live-api-s.facebook.com:443/rtmp/',
  TIKTOK:    'rtmp://push.tiktok.com/live/',
  INSTAGRAM: 'rtmps://edgetee-upload.facebook.com:443/rtmp/',
  CUSTOM:    '',
}

export const PLATFORM_LABELS: Record<string, string> = {
  YOUTUBE:   'YouTube',
  TWITCH:    'Twitch',
  FACEBOOK:  'Facebook',
  TIKTOK:    'TikTok',
  INSTAGRAM: 'Instagram',
  CUSTOM:    'Custom RTMP',
}

export const PLATFORM_COLORS: Record<string, string> = {
  YOUTUBE:   '#FF0000',
  TWITCH:    '#9146FF',
  FACEBOOK:  '#1877F2',
  TIKTOK:    '#000000',
  INSTAGRAM: '#E1306C',
  CUSTOM:    '#6366f1',
}

// ─── Plan limits (mirrors backend) ───────────────────────────
export const PLAN_LIMITS = {
  FREE: {
    maxDestinations:  1,
    maxResolution:    '720p',
    maxStorageGB:     5,
    maxProjects:      3,
    hasWatermark:     true,
    hasAI:            false,
    hasColorGrading:  false,
  },
  PRO: {
    maxDestinations:  3,
    maxResolution:    '1080p',
    maxStorageGB:     50,
    maxProjects:      20,
    hasWatermark:     false,
    hasAI:            true,
    hasColorGrading:  true,
  },
  CREATOR: {
    maxDestinations:  10,
    maxResolution:    '4K',
    maxStorageGB:     500,
    maxProjects:      100,
    hasWatermark:     false,
    hasAI:            true,
    hasColorGrading:  true,
  },
  ENTERPRISE: {
    maxDestinations:  -1,
    maxResolution:    '4K',
    maxStorageGB:     -1,
    maxProjects:      -1,
    hasWatermark:     false,
    hasAI:            true,
    hasColorGrading:  true,
  },
} as const

// ─── Export formats ───────────────────────────────────────────
export const EXPORT_FORMATS = ['MP4', 'MOV', 'WEBM', 'MKV', 'GIF', 'MP3'] as const

export const EXPORT_RESOLUTIONS = [
  { label: '4K (3840×2160)',   value: '3840x2160', plan: 'CREATOR'    },
  { label: '1080p (1920×1080)', value: '1920x1080', plan: 'PRO'       },
  { label: '720p (1280×720)',   value: '1280x720',  plan: 'FREE'      },
  { label: '480p (854×480)',    value: '854x480',   plan: 'FREE'      },
] as const

export const EXPORT_FPS_OPTIONS = [60, 30, 24] as const

// ─── Video aspect ratios ──────────────────────────────────────
export const ASPECT_RATIOS = [
  { label: '16:9  (Landscape)', value: '16:9'  },
  { label: '9:16  (Portrait)',  value: '9:16'  },
  { label: '1:1   (Square)',    value: '1:1'   },
  { label: '4:3   (Classic)',   value: '4:3'   },
  { label: '21:9  (Cinematic)', value: '21:9'  },
] as const

// ─── Source types ─────────────────────────────────────────────
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  CAMERA:  'Camera',
  SCREEN:  'Screen Share',
  IMAGE:   'Image',
  VIDEO:   'Video File',
  TEXT:    'Text',
  BROWSER: 'Browser',
  AUDIO:   'Audio',
}

// ─── AI supported languages ───────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English'    },
  { code: 'es', label: 'Spanish'    },
  { code: 'fr', label: 'French'     },
  { code: 'de', label: 'German'     },
  { code: 'zh', label: 'Chinese'    },
  { code: 'ja', label: 'Japanese'   },
  { code: 'ko', label: 'Korean'     },
  { code: 'ar', label: 'Arabic'     },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian'    },
  { code: 'hi', label: 'Hindi'      },
  { code: 'it', label: 'Italian'    },
] as const

// ─── Validation ───────────────────────────────────────────────
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_REGEX:      /^[a-zA-Z0-9_]+$/,
  EMAIL_REGEX:         /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// ─── Polling intervals (ms) ───────────────────────────────────
export const POLL_INTERVALS = {
  EXPORT_STATUS:  3000,   // Poll export progress every 3s
  STREAM_STATS:   3000,   // Already handled by WebSocket
  VIEWER_COUNT:   10000,  // Refresh viewer count every 10s
} as const

// ─── File size limits ─────────────────────────────────────────
export const FILE_LIMITS = {
  MAX_UPLOAD_BYTES:    10 * 1024 * 1024 * 1024,  // 10GB
  MAX_IMAGE_BYTES:     20  * 1024 * 1024,         // 20MB
  MAX_THUMBNAIL_BYTES: 5   * 1024 * 1024,         // 5MB
} as const
