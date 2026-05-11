// ============================================================
//  Root Navigator
// ============================================================

import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore }       from '@core/store/authStore'
import { setNavigateToLogin } from '@core/api/setup'
import { OnboardingNavigator } from './OnboardingNavigator'
import { MainNavigator }       from './MainNavigator'
import { SplashScreen }        from '@features/auth/screens/SplashScreen'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { isLoggedIn, isInitialised, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
    setNavigateToLogin(() => {
      useAuthStore.setState({ user: null, isLoggedIn: false })
    })
  }, [loadUser])

  if (!isInitialised) {
    return <SplashScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main"       component={MainNavigator} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
    </Stack.Navigator>
  )
}
