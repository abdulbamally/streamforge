// ============================================================
//  Auth Store — user session, login, logout
// ============================================================

import { create }   from 'zustand'
import { MMKV }     from 'react-native-mmkv'
import { authApi, userApi } from '@streamforge/api-contract'
import type { UserWithSubscription } from '@streamforge/api-contract'
import { useTokenStore }    from './tokenStore'

const storage = new MMKV({ id: 'streamforge-auth' })

interface AuthState {
  user:          UserWithSubscription | null
  isLoggedIn:    boolean
  isLoading:     boolean
  isInitialised: boolean

  // Actions
  login:    (identifier: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, displayName?: string) => Promise<void>
  logout:   () => Promise<void>
  loadUser: () => Promise<void>
  setUser:  (user: UserWithSubscription) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:          null,
  isLoggedIn:    false,
  isLoading:     false,
  isInitialised: false,

  login: async (identifier, password) => {
    set({ isLoading: true })
    try {
      const result = await authApi.login({ identifier, password })
      useTokenStore.getState().setTokens(
        result.accessToken,
        '',              // refresh token comes via cookie on web; body on mobile
        result.expiresIn
      )
      // Fetch full user with subscription
      const user = await userApi.getMe()
      storage.set('user', JSON.stringify(user))
      set({ user, isLoggedIn: true })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email, username, password, displayName) => {
    set({ isLoading: true })
    try {
      const result = await authApi.register({ email, username, password, displayName })
      useTokenStore.getState().setTokens(result.accessToken, '', result.expiresIn)
      const user = await userApi.getMe()
      storage.set('user', JSON.stringify(user))
      set({ user, isLoggedIn: true })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    await authApi.logout().catch(() => {})
    useTokenStore.getState().clearTokens()
    storage.delete('user')
    set({ user: null, isLoggedIn: false })
  },

  loadUser: async () => {
    // Try to restore from MMKV first (instant)
    const cached = storage.getString('user')
    if (cached) {
      set({ user: JSON.parse(cached), isLoggedIn: true })
    }

    // Then refresh from server if we have a token
    const token = useTokenStore.getState().accessToken
    if (token) {
      try {
        const user = await userApi.getMe()
        storage.set('user', JSON.stringify(user))
        set({ user, isLoggedIn: true })
      } catch {
        if (!cached) set({ isLoggedIn: false })
      }
    }

    set({ isInitialised: true })
  },

  setUser: (user) => {
    storage.set('user', JSON.stringify(user))
    set({ user })
  },
}))
