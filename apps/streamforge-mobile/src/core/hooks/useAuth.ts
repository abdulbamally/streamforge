// ============================================================
//  useAuth — Auth actions and state for components
// ============================================================

import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { ApiClientError } from '@streamforge/api-contract'

function formatAuthError(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError) {
    if (err.isNetworkError) {
      return 'Cannot reach the server. Ensure auth-service is running on port 3001 (Android emulator uses 10.0.2.2, not localhost).'
    }
    return err.message
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return fallback
}

export function useAuth() {
  const {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
  } = useAuthStore()

  const handleLogin = useCallback(
    async (
      identifier: string,
      password: string,
      onError: (message: string) => void,
      rememberMe = false,
    ) => {
      try {
        await login(identifier, password, rememberMe)
      } catch (err) {
        onError(formatAuthError(err, 'Something went wrong. Please try again.'))
      }
    },
    [login],
  )

  const handleRegister = useCallback(
    async (
      email: string,
      username: string,
      password: string,
      onError: (message: string) => void,
      displayName?: string,
    ) => {
      try {
        await register(email, username, password, displayName)
      } catch (err) {
        onError(formatAuthError(err, 'Registration failed. Please try again.'))
      }
    },
    [register],
  )

  const handleLogout = useCallback(async () => {
    await logout()
  }, [logout])

  return {
    user,
    isLoggedIn,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    plan: user?.plan ?? 'FREE',
    isPro:
      user?.plan === 'PRO' ||
      user?.plan === 'CREATOR' ||
      user?.plan === 'ENTERPRISE',
    isCreator: user?.plan === 'CREATOR' || user?.plan === 'ENTERPRISE',
  }
}
