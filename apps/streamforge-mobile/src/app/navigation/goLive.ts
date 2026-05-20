// ============================================================
//  Go Live — Center FAB navigation with config gate
// ============================================================

import {
  getConfiguredStreamId,
  isStreamConfigured,
} from '@features/studio/store/streamConfigStore'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleGoLive(navigation: { navigate: (...args: any[]) => void }): void {
  if (!isStreamConfigured()) {
    navigation.navigate('StreamingSettings', {
      screen: 'StreamingSettingsHome',
      params: { fromLiveGate: true },
    })
    return
  }

  const streamId = getConfiguredStreamId()
  if (!streamId) {
    navigation.navigate('StreamingSettings', {
      screen: 'StreamingSettingsHome',
      params: { fromLiveGate: true },
    })
    return
  }

  navigation.navigate('Studio', {
    screen: 'LiveStudio',
    params: { streamId },
  })
}
