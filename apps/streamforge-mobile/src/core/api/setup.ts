// ============================================================
//  API Client Setup
//  Call setupApiClient() once at app startup in App.tsx
// ============================================================

import { configureApiClient } from '@streamforge/api-contract'
import { useTokenStore }       from '../store/tokenStore'

const API_BASE_URL    = __DEV__
  ? 'http://localhost:3001'          // dev — points to auth service
  : 'https://api.streamforge.app'   // prod — API gateway

const STREAM_WS_URL   = __DEV__
  ? 'ws://localhost:3002'
  : 'wss://stream.streamforge.app'

const SOCIAL_BASE_URL = __DEV__
  ? 'http://localhost:3005'
  : 'https://api.streamforge.app'

const REALTIME_HTTP_BASE = __DEV__
  ? 'http://localhost:3006'
  : 'https://api.streamforge.app'

const REALTIME_WS_URL = __DEV__
  ? 'ws://localhost:3006'
  : 'wss://api.streamforge.app'

const MONETIZATION_BASE_URL = __DEV__
  ? 'http://localhost:3007'
  : 'https://api.streamforge.app'

export { STREAM_WS_URL, REALTIME_WS_URL }

// Navigation ref — set this after NavigationContainer mounts
let _navigateToLogin: (() => void) | null = null

export function setNavigateToLogin(fn: () => void) {
  _navigateToLogin = fn
}

export function setupApiClient() {
  configureApiClient({
    baseUrl:        API_BASE_URL,
    socialBaseUrl:       SOCIAL_BASE_URL,
    realtimeBaseUrl:     REALTIME_HTTP_BASE,
    realtimeWsUrl:       REALTIME_WS_URL,
    monetizationBaseUrl: MONETIZATION_BASE_URL,
    getAccessToken: () => useTokenStore.getState().accessToken,
    onTokenExpired: () => useTokenStore.getState().refresh(),
    onUnauthorized: () => {
      useTokenStore.getState().clearTokens()
      _navigateToLogin?.()
    },
    timeout: 15000,
  })
}
