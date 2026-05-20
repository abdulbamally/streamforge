// ============================================================
//  App Providers — Expo version
// ============================================================

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClientProvider }    from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider }       from 'react-native-safe-area-context'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import Toast                      from 'react-native-toast-message'
import { StyleSheet }             from 'react-native'
import { queryClient }            from '@core/api/queryClient'
import { toastConfig }            from '@shared/components/Toast'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <BottomSheetModalProvider>
              {children}
              <Toast config={toastConfig} />
            </BottomSheetModalProvider>
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
})
