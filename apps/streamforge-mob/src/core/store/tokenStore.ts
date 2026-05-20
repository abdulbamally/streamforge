// ============================================================
//  Token Store — Zustand + MMKV
//  Manages access token, refresh token, and auto-refresh logic
// ============================================================

import { create }  from 'zustand'
import { MMKV }    from 'react-native-mmkv'
import { authApi } from '@streamforge/api-contract'

const storage = new MMKV({ id: 'streamforge-tokens' })

const KEYS = {
  ACCESS_TOKEN:  'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT:    'expires_at',
}

interface TokenState {
  accessToken:  string | null
  refreshToken: string | null
  expiresAt:    number | null   // unix ms

  // Actions
  setTokens:    (access: string, refresh: string, expiresIn: number) => void
  clearTokens:  () => void
  refresh:      () => Promise<string | null>
  isExpired:    () => boolean
}

export const useTokenStore = create<TokenState>((set, get) => ({
  // Hydrate from MMKV on store creation
  accessToken:  storage.getString(KEYS.ACCESS_TOKEN)  ?? null,
  refreshToken: storage.getString(KEYS.REFRESH_TOKEN) ?? null,
  expiresAt:    storage.getNumber(KEYS.EXPIRES_AT)    ?? null,

  setTokens: (access, refresh, expiresIn) => {
    const expiresAt = Date.now() + expiresIn * 1000

    // Persist to MMKV
    storage.set(KEYS.ACCESS_TOKEN,  access)
    storage.set(KEYS.REFRESH_TOKEN, refresh)
    storage.set(KEYS.EXPIRES_AT,    expiresAt)

    set({ accessToken: access, refreshToken: refresh, expiresAt })
  },

  clearTokens: () => {
    storage.delete(KEYS.ACCESS_TOKEN)
    storage.delete(KEYS.REFRESH_TOKEN)
    storage.delete(KEYS.EXPIRES_AT)
    set({ accessToken: null, refreshToken: null, expiresAt: null })
  },

  isExpired: () => {
    const { expiresAt } = get()
    if (!expiresAt) return true
    // Consider expired 60 seconds before actual expiry
    return Date.now() >= expiresAt - 60_000
  },

  refresh: async () => {
    const { refreshToken, setTokens, clearTokens } = get()
    if (!refreshToken) return null

    try {
      const result = await authApi.refresh(refreshToken)
      // Note: refresh endpoint only returns new access token
      // Refresh token is rotated server-side via cookie (web) or returned in body (mobile)
      setTokens(result.accessToken, refreshToken, result.expiresIn)
      return result.accessToken
    } catch {
      clearTokens()
      return null
    }
  },
}))

// Convenience selector
export const getAccessToken  = () => useTokenStore.getState().accessToken
export const getRefreshToken = () => useTokenStore.getState().refreshToken
