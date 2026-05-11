// ============================================================
//  StreamForge Mobile — App.tsx
// ============================================================

import React, { useEffect } from 'react'
import { StatusBar }        from 'react-native'
import { AppProviders }     from './src/app/providers/AppProviders'
import { RootNavigator }    from './src/app/navigation/RootNavigator'
import { setupApiClient }   from './src/core/api/setup'
import { Colors }           from './src/shared/theme/tokens'

// Configure API client before anything renders
setupApiClient()

export default function App() {
  return (
    <AppProviders>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.bg}
        translucent={false}
      />
      <RootNavigator />
    </AppProviders>
  )
}
