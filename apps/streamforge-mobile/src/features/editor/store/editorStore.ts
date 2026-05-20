// ============================================================
//  Editor Store — Project + clips (local timeline model)
// ============================================================

import { create } from 'zustand'
import type { EditProject, TimelineClip } from '../engine/types'
import { applyCommand, type EditorCommand } from '../engine/commands'
import { getTotalDuration } from '../engine/timelineEngine'
import { saveProject } from '../services/projectPersistence'
import { usePlaybackStore } from './playbackStore'
import { useUiStore } from './uiStore'

interface EditorState {
  project: EditProject | null
  clips: TimelineClip[]
  selectedClipId: string | null

  loadProject: (project: EditProject) => void
  setClips: (clips: TimelineClip[]) => void
  selectClip: (clipId: string | null) => void
  runCommand: (command: EditorCommand) => void
  addClip: (clip: TimelineClip) => void
  persist: () => void
  reset: () => void
}

function syncDuration(clips: TimelineClip[]) {
  return getTotalDuration(clips)
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  clips: [],
  selectedClipId: null,

  loadProject: (project) => {
    set({
      project,
      clips: project.clips,
      selectedClipId: null,
    })
    usePlaybackStore.getState().setDuration(syncDuration(project.clips))
    usePlaybackStore.getState().setCurrentTime(0)
  },

  setClips: (clips) => {
    const project = get().project
    if (!project) return
    const updated: EditProject = {
      ...project,
      clips,
      updatedAt: Date.now(),
    }
    set({ project: updated, clips })
    usePlaybackStore.getState().setDuration(syncDuration(clips))
    saveProject(updated)
  },

  selectClip: (selectedClipId) => set({ selectedClipId }),

  runCommand: (command) => {
    const next = applyCommand(get().clips, command)
    get().setClips(next)
  },

  addClip: (clip) => {
    const clips = [...get().clips, clip]
    get().setClips(clips)
    set({ selectedClipId: clip.id })
  },

  persist: () => {
    const project = get().project
    if (project) saveProject({ ...project, clips: get().clips, updatedAt: Date.now() })
  },

  reset: () => {
    set({ project: null, clips: [], selectedClipId: null })
    usePlaybackStore.getState().reset()
    useUiStore.getState().reset()
  },
}))
