// ============================================================
//  Editor Store — Timeline and editing state
// ============================================================

import { create }    from 'zustand'
import type { Project, Clip, Export } from '@streamforge/api-contract'

interface EditorState {
  // Project
  project:         Project | null
  clips:           Clip[]
  exports:         Export[]

  // Timeline playback
  currentTime:     number     // seconds
  duration:        number     // total timeline duration
  isPlaying:       boolean
  playbackRate:    number

  // Selection
  selectedClipId:  string | null
  selectedTrack:   number

  // Timeline view
  zoom:            number     // 1 = 1s per 50px, 2 = 1s per 100px etc
  scrollOffset:    number     // horizontal scroll in seconds

  // UI panels
  activePanel:     'effects' | 'color' | 'audio' | 'ai' | null

  // Actions
  setProject:       (project: Project) => void
  setClips:         (clips: Clip[]) => void
  addClip:          (clip: Clip) => void
  removeClip:       (clipId: string) => void
  updateClip:       (clipId: string, updates: Partial<Clip>) => void
  selectClip:       (clipId: string | null) => void
  setCurrentTime:   (time: number) => void
  setPlaying:       (playing: boolean) => void
  setPlaybackRate:  (rate: number) => void
  setZoom:          (zoom: number) => void
  setScrollOffset:  (offset: number) => void
  setActivePanel:   (panel: EditorState['activePanel']) => void
  addExport:        (exp: Export) => void
  updateExport:     (exportId: string, updates: Partial<Export>) => void
  reset:            () => void
}

const initialState = {
  project:        null,
  clips:          [],
  exports:        [],
  currentTime:    0,
  duration:       0,
  isPlaying:      false,
  playbackRate:   1,
  selectedClipId: null,
  selectedTrack:  0,
  zoom:           1,
  scrollOffset:   0,
  activePanel:    null,
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setProject: (project) => set({ project }),

  setClips: (clips) => {
    // Recalculate total duration from clips
    const duration = clips.reduce((max, c) => Math.max(max, c.endTime), 0)
    set({ clips, duration })
  },

  addClip: (clip) => {
    const clips   = [...get().clips, clip]
    const duration = clips.reduce((max, c) => Math.max(max, c.endTime), 0)
    set({ clips, duration })
  },

  removeClip: (clipId) => {
    const clips    = get().clips.filter(c => c.id !== clipId)
    const duration = clips.reduce((max, c) => Math.max(max, c.endTime), 0)
    set({ clips, duration, selectedClipId: null })
  },

  updateClip: (clipId, updates) => {
    set(state => ({
      clips: state.clips.map(c => c.id === clipId ? { ...c, ...updates } : c),
    }))
  },

  selectClip:      (clipId)  => set({ selectedClipId: clipId }),
  setCurrentTime:  (time)    => set({ currentTime: Math.max(0, time) }),
  setPlaying:      (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate)    => set({ playbackRate: rate }),
  setZoom:         (zoom)    => set({ zoom: Math.max(0.25, Math.min(zoom, 10)) }),
  setScrollOffset: (offset)  => set({ scrollOffset: Math.max(0, offset) }),
  setActivePanel:  (panel)   => set({ activePanel: panel }),

  addExport: (exp) => set(state => ({ exports: [exp, ...state.exports] })),

  updateExport: (exportId, updates) => {
    set(state => ({
      exports: state.exports.map(e => e.id === exportId ? { ...e, ...updates } : e),
    }))
  },

  reset: () => set({ ...initialState }),
}))
