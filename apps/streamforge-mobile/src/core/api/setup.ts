// ============================================================
//  API Client Setup
//  Call setupApiClient() once at app startup in App.tsx
// ============================================================

import { configureApiClient } from '@streamforge/api-contract'
import { apiConfig } from '../config/api.config'
import { useTokenStore } from '../store/tokenStore'

export const STREAM_WS_URL = apiConfig.realtimeWsUrl
export const REALTIME_WS_URL = apiConfig.realtimeWsUrl

let _navigateToLogin: (() => void) | null = null

export function setNavigateToLogin(fn: () => void) {
  _navigateToLogin = fn
}

export function setupApiClient() {
  configureApiClient({
    baseUrl: apiConfig.authBaseUrl,
    authBaseUrl: apiConfig.authBaseUrl,
    streamBaseUrl: apiConfig.streamBaseUrl,
    mediaBaseUrl: apiConfig.mediaBaseUrl,
    aiBaseUrl: apiConfig.aiBaseUrl,
    socialBaseUrl: apiConfig.socialBaseUrl,
    realtimeBaseUrl: apiConfig.realtimeBaseUrl,
    realtimeWsUrl: apiConfig.realtimeWsUrl,
    monetizationBaseUrl: apiConfig.monetizationBaseUrl,
    getAccessToken: () => useTokenStore.getState().accessToken,
    onTokenExpired: () => useTokenStore.getState().refresh(),
    onUnauthorized: () => {
      useTokenStore.getState().clearTokens()
      _navigateToLogin?.()
    },
    timeout: 15000,
  })
}
