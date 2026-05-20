// ============================================================
//  useAuth — Auth actions and state for components
// ============================================================

import { useCallback }  from 'react'
import { useAuthStore } from '../store/authStore'
import { ApiClientError } from '@streamforge/api-contract'

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
      password:   string,
      onError:    (message: string) => void
    ) => {
      try {
        await login(identifier, password)
      } catch (err) {
        if (err instanceof ApiClientError) {
          onError(err.message)
        } else {
          onError('Something went wrong. Please try again.')
        }
      }
    },
    [login]
  )

  const handleRegister = useCallback(
    async (
      email:       string,
      username:    string,
      password:    string,
      onError:     (message: string) => void,
      displayName?: string
    ) => {
      try {
        await register(email, username, password, displayName)
      } catch (err) {
        if (err instanceof ApiClientError) {
          onError(err.message)
        } else {
          onError('Registration failed. Please try again.')
        }
      }
    },
    [register]
  )

  const handleLogout = useCallback(async () => {
    await logout()
  }, [logout])

  return {
    user,
    isLoggedIn,
    isLoading,
    login:    handleLogin,
    register: handleRegister,
    logout:   handleLogout,
    plan:     user?.plan ?? 'FREE',
    isPro:    user?.plan === 'PRO' || user?.plan === 'CREATOR' || user?.plan === 'ENTERPRISE',
    isCreator: user?.plan === 'CREATOR' || user?.plan === 'ENTERPRISE',
  }
}
