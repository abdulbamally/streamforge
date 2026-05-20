// ============================================================
//  Auth Service — Local domain types
// ============================================================

export interface TokenClaims {
  sub:           string
  email:         string
  username:      string
  plan:          string
  emailVerified: boolean
  iat?:          number
  exp?:          number
}

export interface OAuthProfile {
  provider:    'GOOGLE' | 'APPLE' | 'GITHUB'
  providerUid: string
  email:       string
  displayName: string | null
  avatarUrl:   string | null
}

export interface StripeWebhookEvent {
  id:   string
  type: string
  data: { object: Record<string, unknown> }
}

export interface LoginAttemptResult {
  success:       boolean
  attemptsLeft?: number
  lockedUntil?:  Date
}

export interface EmailJob {
  to:       string
  template: 'verify' | 'reset' | 'welcome' | 'password_changed'
  data:     Record<string, string>
}
