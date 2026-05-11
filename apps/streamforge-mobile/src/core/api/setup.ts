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

export { STREAM_WS_URL }

// Navigation ref — set this after NavigationContainer mounts
let _navigateToLogin: (() => void) | null = null

export function setNavigateToLogin(fn: () => void) {
  _navigateToLogin = fn
}

export function setupApiClient() {
  configureApiClient({
    baseUrl:        API_BASE_URL,
    getAccessToken: () => useTokenStore.getState().accessToken,
    onTokenExpired: () => useTokenStore.getState().refresh(),
    onUnauthorized: () => {
      useTokenStore.getState().clearTokens()
      _navigateToLogin?.()
    },
    timeout: 15000,
  })
}
