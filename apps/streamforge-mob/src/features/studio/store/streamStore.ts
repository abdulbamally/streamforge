// ============================================================
//  Stream Store — Live stream client state
// ============================================================

import { create }        from 'zustand'
import { streamApi }     from '@streamforge/api-contract'
import type {
  Stream,
  LiveStreamState,
  Scene,
  StreamStats,
} from '@streamforge/api-contract'

interface StreamState {
  // Current stream
  activeStream:    Stream | null
  liveState:       LiveStreamState | null
  scenes:          Scene[]
  activeSceneId:   string | null
  stats:           StreamStats | null

  // UI state
  isGoingLive:     boolean
  isEnding:        boolean
  isMicMuted:      boolean
  isCameraMuted:   boolean
  isStatsVisible:  boolean

  // Actions
  setActiveStream:  (stream: Stream | null) => void
  setLiveState:     (state: LiveStreamState) => void
  setScenes:        (scenes: Scene[]) => void
  setActiveScene:   (sceneId: string) => void
  setStats:         (stats: StreamStats) => void
  toggleMic:        () => void
  toggleCamera:     () => void
  toggleStats:      () => void
  endStream:        (streamId: string) => Promise<void>
  reset:            () => void
}

const initialState = {
  activeStream:   null,
  liveState:      null,
  scenes:         [],
  activeSceneId:  null,
  stats:          null,
  isGoingLive:    false,
  isEnding:       false,
  isMicMuted:     false,
  isCameraMuted:  false,
  isStatsVisible: false,
}

export const useStreamStore = create<StreamState>((set) => ({
  ...initialState,

  setActiveStream:  (stream) => set({ activeStream: stream }),
  setLiveState:     (state)  => set({ liveState: state, activeSceneId: state.activeSceneId }),
  setScenes:        (scenes) => set({ scenes }),
  setActiveScene:   (sceneId) => set({ activeSceneId: sceneId }),
  setStats:         (stats)  => set({ stats }),
  toggleMic:        () => set(s => ({ isMicMuted:    !s.isMicMuted })),
  toggleCamera:     () => set(s => ({ isCameraMuted: !s.isCameraMuted })),
  toggleStats:      () => set(s => ({ isStatsVisible: !s.isStatsVisible })),

  endStream: async (streamId) => {
    set({ isEnding: true })
    try {
      await streamApi.end(streamId)
      set({ ...initialState })
    } finally {
      set({ isEnding: false })
    }
  },

  reset: () => set({ ...initialState }),
}))
