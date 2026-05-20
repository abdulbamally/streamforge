import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { AppProviders } from './src/app/providers/AppProviders'
import { RootNavigator } from './src/app/navigation/RootNavigator'
import { setupApiClient } from './src/core/api/setup'

// Configure API client before anything renders
setupApiClient()

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      <RootNavigator />
    </AppProviders>
  )
}
