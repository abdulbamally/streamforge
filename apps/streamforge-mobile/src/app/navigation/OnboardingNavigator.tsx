// ============================================================
//  Onboarding Navigator — Auth flow
// ============================================================

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { WelcomeScreen }      from '@features/auth/screens/WelcomeScreen'
import { LoginScreen }        from '@features/auth/screens/LoginScreen'
import { RegisterScreen }     from '@features/auth/screens/RegisterScreen'
import { VerifyEmailScreen }  from '@features/auth/screens/VerifyEmailScreen'
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen'
import { ResetPasswordScreen }  from '@features/auth/screens/ResetPasswordScreen'
import type { OnboardingStackParamList } from './types'

const Stack = createNativeStackNavigator<OnboardingStackParamList>()

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown:  false,
        animation:    'slide_from_right',
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen name="Welcome"        component={WelcomeScreen} />
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail"    component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
    </Stack.Navigator>
  )
}
