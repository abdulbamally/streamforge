// ============================================================
//  Editor Store — Phase 2 timeline + state engine
// ============================================================

import { create } from 'zustand'
import type { EditProject, TimelineClip as LegacyTimelineClip } from '../engine/types'
import { applyCommand as applyLegacyCommand, type EditorCommand } from '../engine/commands'
import { getTotalDuration } from '../engine/timelineEngine'
import {
  applyCommand as applyEditCommand,
  createEditCommand,
  createSnapshot,
  revertCommand,
} from '../engine/editing/editCommands'
import { pushUndoEntry } from '../engine/editing/commandHistory'
import type { SnapGuide } from '../engine/editing/snappingEngine'
import {
  BASE_PIXELS_PER_SECOND,
  CLIP_COLORS,
  MAX_ZOOM,
  MIN_ZOOM,
  TRACK_HEIGHT_AUDIO,
  TRACK_HEIGHT_EFFECT,
  TRACK_HEIGHT_TEXT,
  TRACK_HEIGHT_VIDEO,
} from '../engine/timeline/timelineConstants'
import { createMockEditorProject, createMockTracks } from '../engine/timeline/timelineMockData'
import {
  calculateVisibleRange,
  clampTime,
  getClipEndTime,
} from '../engine/timeline/timelineMath'
import {
  getTimelineContentHeight,
  getTimelineContentWidth,
} from '../engine/timeline/timelineLayout'
import { saveProject } from '../services/projectPersistence'
import type { EditorProject, EditorTool } from '../types/editor.types'
import {
  DEFAULT_CLIP_TRANSFORM,
  type TimelineClip,
  type TimelineClipType,
} from '../types/clip.types'
import type { MediaAsset, WaveformData } from '../types/media.types'
import type { PlaybackStatus } from '../types/playback.types'
import type { TimelineTrack } from '../types/track.types'
import type {
  EditCommand,
  EditCommandPayload,
  EditCommandType,
  EditCommandSnapshot,
} from '../types/editCommand.types'
import type { PlaybackSlice } from './playbackSlice'
import { initialPlaybackSlice } from './playbackSlice'
import type { TimelineSlice } from './timelineSlice'
import { initialTimelineSlice } from './timelineSlice'
import type { SelectionSlice } from './selectionSlice'
import { initialSelectionSlice } from './selectionSlice'
import type { GestureSlice, TimelineGesture } from './gestureSlice'
import { initialGestureSlice } from './gestureSlice'
import type { HistorySlice } from './historySlice'
import { initialHistorySlice } from './historySlice'
import { validateAssetForTrack } from '../engine/media/assetValidation'
import { getAssetDuration } from '../engine/media/mediaAssetManager'
import { mediaTypeToClipType, mediaTypeToTrackType } from '../engine/media/mediaTypes'
import { buildThumbnailStrip } from '../engine/media/thumbnailService'
import type { MediaSlice } from './mediaSlice'
import {
  addAssetToSlice,
  attachWaveformToSlice,
  initialMediaSlice,
  removeAssetFromSlice,
} from './mediaSlice'

type RenderingSlice = {
  previewReady: boolean
  timelineReady: boolean
}

type OverlaysSlice = {
  showSafeAreaGuides: boolean
  showCropGuides: boolean
  showTransformHandles: boolean
}

type UiSlice = {
  exportProgress: number
  isExporting: boolean
}

type EditorInitialState = {
  project: EditProject | null
  editorProject: EditorProject
  clips: LegacyTimelineClip[]
  tracks: TimelineTrack[]
  playback: PlaybackSlice
  timeline: TimelineSlice
  selection: SelectionSlice
  gestures: GestureSlice
  overlays: OverlaysSlice
  rendering: RenderingSlice
  ui: UiSlice
  history: HistorySlice
  media: MediaSlice
}

export interface EditorState extends EditorInitialState {
  loadProject: (project: EditProject) => void
  setClips: (clips: LegacyTimelineClip[]) => void
  addClip: (clip: LegacyTimelineClip) => void
  runCommand: (command: EditorCommand) => void

  setIsPlaying: (value: boolean) => void
  setPlaying: (value: boolean) => void
  togglePlayback: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: number) => void
  setIsSeeking: (value: boolean) => void
  setIsScrubbing: (value: boolean) => void
  setLastSeekTime: (time: number) => void
  setPlayerReady: (value: boolean) => void
  setPlaybackStatus: (status: PlaybackStatus) => void
  seekTo: (time: number) => void
  resetPlayback: () => void

  setZoomLevel: (zoom: number) => void
  setScrollOffsetX: (value: number) => void
  setScrollOffsetY: (value: number) => void
  setScrollOffset: (value: number) => void
  setTimelineSize: (width: number, height: number) => void
  updateVisibleRange: () => void
  setPixelsPerSecond: (value: number) => void
  setSnappingEnabled: (value: boolean) => void
  setActiveSnapGuide: (guide: SnapGuide | null) => void
  clearActiveSnapGuide: () => void
  setAutoScrollEnabled: (value: boolean) => void
  setFollowPlayhead: (value: boolean) => void
  setPlayheadLockedToCenter: (value: boolean) => void
  setViewportSize: (width: number, height: number) => void

  selectClip: (clipId: string | null) => void
  selectTrack: (trackId: string | null) => void
  clearSelection: () => void
  setActiveTool: (tool: EditorTool) => void

  addTrack: (track: TimelineTrack) => void
  removeTrack: (trackId: string) => void
  updateTrack: (trackId: string, patch: Partial<TimelineTrack>) => void
  addTimelineClip: (trackId: string, clip: TimelineClip) => void
  updateClip: (clipId: string, patch: Partial<TimelineClip>) => void
  removeClip: (clipId: string) => void
  moveClip: (clipId: string, startTime: number, trackId?: string) => void
  previewEditCommand: (type: EditCommandType, payload: EditCommandPayload) => boolean
  executeCommand: (command: EditCommand) => boolean
  executeEditCommand: (type: EditCommandType, payload: EditCommandPayload) => boolean
  undo: () => void
  redo: () => void
  clearHistory: () => void
  pushHistoryEntry: (entry: EditCommand) => void

  addMediaAsset: (asset: MediaAsset) => void
  addMediaAssets: (assets: MediaAsset[]) => void
  updateMediaAsset: (assetId: string, updates: Partial<MediaAsset>) => void
  removeMediaAsset: (assetId: string) => void
  selectMediaAsset: (assetId: string | null) => void
  setIsImporting: (value: boolean) => void
  setImportError: (error: string | null) => void
  attachThumbnail: (assetId: string, thumbnailUri: string) => void
  attachWaveformData: (assetId: string, waveformData: WaveformData) => void
  addMediaAssetToTimeline: (
    assetId: string,
    options?: { startTime?: number; trackId?: string },
  ) => boolean

  setActiveGesture: (gesture: TimelineGesture) => void
  setIsDraggingClip: (value: boolean) => void
  setIsDraggingPlayhead: (value: boolean) => void
  setIsPinching: (value: boolean) => void
  setDragClipId: (clipId: string | null) => void
  beginScrub: (time: number, x: number) => void
  updateScrub: (time: number, x: number) => void
  endScrub: () => void
  cancelScrub: () => void

  setExportProgress: (progress: number) => void
  setIsExporting: (exporting: boolean) => void
  persist: () => void
  reset: () => void
}

const mockProject = createMockEditorProject()

const initialState: EditorInitialState = {
  project: null,
  editorProject: mockProject,
  clips: [],
  tracks: mockProject.tracks,
  playback: {
    ...initialPlaybackSlice,
    duration: mockProject.duration,
  },
  timeline: {
    ...initialTimelineSlice,
    contentWidth: getTimelineContentWidth(mockProject.duration, BASE_PIXELS_PER_SECOND),
    contentHeight: getTimelineContentHeight(mockProject.tracks),
    visibleEndTime: 30,
  },
  selection: initialSelectionSlice,
  gestures: initialGestureSlice,
  overlays: {
    showSafeAreaGuides: true,
    showCropGuides: false,
    showTransformHandles: false,
  },
  rendering: {
    previewReady: false,
    timelineReady: true,
  },
  ui: {
    exportProgress: 0,
    isExporting: false,
  },
  history: initialHistorySlice,
  media: initialMediaSlice,
}

function clipTypeFromLegacy(clip: LegacyTimelineClip): TimelineClipType {
  if (clip.sourceUri.match(/\.(mp3|aac|wav|m4a)/i)) return 'audio'
  if (clip.sourceUri.match(/\.(png|jpe?g|webp|heic|gif)/i)) return 'image'
  return 'video'
}

function createEmptyTracks(): TimelineTrack[] {
  return [
    {
      id: 'track-video-1',
      name: 'Video Track 1',
      type: 'video',
      height: TRACK_HEIGHT_VIDEO,
      isLocked: false,
      isMuted: false,
      isVisible: true,
      clips: [],
    },
    {
      id: 'track-audio-1',
      name: 'Audio Track 1',
      type: 'audio',
      height: TRACK_HEIGHT_AUDIO,
      isLocked: false,
      isMuted: false,
      isVisible: true,
      clips: [],
    },
    {
      id: 'track-text-1',
      name: 'Text Track 1',
      type: 'text',
      height: TRACK_HEIGHT_TEXT,
      isLocked: false,
      isMuted: false,
      isVisible: true,
      clips: [],
    },
    {
      id: 'track-effect-1',
      name: 'Effects Track 1',
      type: 'effect',
      height: TRACK_HEIGHT_EFFECT,
      isLocked: false,
      isMuted: false,
      isVisible: true,
      clips: [],
    },
  ]
}

function legacyClipToTimelineClip(clip: LegacyTimelineClip): TimelineClip {
  const type = clipTypeFromLegacy(clip)
  const trackId = type === 'audio' ? 'track-audio-1' : 'track-video-1'
  return {
    id: clip.id,
    trackId,
    type,
    name: clip.label ?? (type === 'audio' ? 'Audio clip' : 'Video clip'),
    startTime: clip.timelineStart,
    duration: clip.duration,
    trimStart: clip.sourceStart,
    trimEnd: clip.sourceEnd,
    mediaStartTime: clip.sourceStart,
    mediaEndTime: clip.sourceEnd,
    color: CLIP_COLORS[type],
    sourceUri: clip.sourceUri,
    transform: DEFAULT_CLIP_TRANSFORM,
    opacity: 1,
    volume: 1,
    visualStatus: 'placeholder',
  }
}

function tracksFromLegacyClips(clips: LegacyTimelineClip[]): TimelineTrack[] {
  if (!clips.length) return createMockTracks()

  const tracks = createEmptyTracks()
  clips.forEach((clip) => {
    const timelineClip = legacyClipToTimelineClip(clip)
    const track = tracks.find((item) => item.id === timelineClip.trackId)
    track?.clips.push(timelineClip)
  })
  return tracks
}

function durationFromTracks(tracks: TimelineTrack[]): number {
  return Math.max(
    0,
    ...tracks.flatMap((track) => track.clips.map(getClipEndTime)),
  )
}

function createEditorProjectFromLegacy(project: EditProject, tracks: TimelineTrack[]): EditorProject {
  const duration = Math.max(getTotalDuration(project.clips), durationFromTracks(tracks), 60)
  return {
    id: project.id,
    title: project.title,
    duration,
    width: project.resolution?.width ?? 1920,
    height: project.resolution?.height ?? 1080,
    fps: project.fps ?? 30,
    tracks,
    mediaAssetIds: [],
    projectSettings: {
      aspectRatio: `${project.resolution?.width ?? 1920}:${project.resolution?.height ?? 1080}`,
      resolution: {
        width: project.resolution?.width ?? 1920,
        height: project.resolution?.height ?? 1080,
      },
      fps: project.fps ?? 30,
      backgroundColor: '#000000',
    },
    renderSettings: {
      format: 'mp4',
      quality: 'standard',
    },
    createdAt: new Date(project.createdAt).toISOString(),
    updatedAt: new Date(project.updatedAt).toISOString(),
  }
}

function updateTimelineFor(
  timeline: TimelineSlice,
  duration: number,
  tracks: TimelineTrack[],
): TimelineSlice {
  const visibleRange = calculateVisibleRange(
    timeline.scrollOffsetX,
    timeline.timelineWidth || 0,
    timeline.pixelsPerSecond,
  )
  return {
    ...timeline,
    contentWidth: getTimelineContentWidth(duration, timeline.pixelsPerSecond),
    contentHeight: getTimelineContentHeight(tracks),
    viewportWidth: timeline.timelineWidth,
    viewportHeight: timeline.timelineHeight,
    visibleStartTime: visibleRange.start,
    visibleEndTime: visibleRange.end,
  }
}

function updateClipInTracks(
  tracks: TimelineTrack[],
  clipId: string,
  patch: Partial<TimelineClip>,
): TimelineTrack[] {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) =>
      clip.id === clipId ? { ...clip, ...patch } : clip,
    ),
  }))
}

function removeClipFromTracks(tracks: TimelineTrack[], clipId: string): TimelineTrack[] {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.filter((clip) => clip.id !== clipId),
  }))
}

function legacyClipsFromTracks(
  tracks: TimelineTrack[],
  previousClips: LegacyTimelineClip[],
): LegacyTimelineClip[] {
  const previousById = new Map(previousClips.map((clip) => [clip.id, clip]))
  return tracks.flatMap((track, trackIndex) =>
    track.clips
      .filter((clip) => clip.sourceUri || previousById.has(clip.id))
      .map((clip) => {
        const previous = previousById.get(clip.id)
        return {
          id: clip.id,
          sourceUri: clip.sourceUri ?? previous?.sourceUri ?? '',
          sourceStart: clip.trimStart,
          sourceEnd: clip.trimEnd || clip.trimStart + clip.duration,
          timelineStart: clip.startTime,
          duration: clip.duration,
          trackIndex,
          muted: track.isMuted,
          speed: previous?.speed ?? 1,
          label: clip.name,
        }
      }),
  )
}

function createCommandContext(state: EditorState) {
  return {
    tracks: state.tracks,
    currentTime: state.playback.currentTime,
    duration: state.playback.duration,
    selectedClipId: state.selection.selectedClipId,
    selectedTrackId: state.selection.selectedTrackId,
    snappingEnabled: state.timeline.isSnappingEnabled,
  }
}

function createClipFromAsset(
  asset: MediaAsset,
  trackId: string,
  startTime: number,
): TimelineClip {
  const duration = getAssetDuration(asset, asset.type === 'image' ? 5 : 10)
  const clipType = mediaTypeToClipType(asset.type)
  return {
    id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    trackId,
    assetId: asset.id,
    type: clipType,
    name: asset.name,
    startTime,
    duration,
    trimStart: 0,
    trimEnd: duration,
    mediaStartTime: 0,
    mediaEndTime: duration,
    color: CLIP_COLORS[clipType],
    sourceUri: asset.uri,
    thumbnailUri: asset.thumbnailUri,
    thumbnailUris: buildThumbnailStrip(asset),
    waveformData: asset.waveformData,
    opacity: 1,
    volume: 1,
    transform: {
      ...DEFAULT_CLIP_TRANSFORM,
      width: asset.width,
      height: asset.height,
    },
    visualStatus: asset.metadataStatus === 'error' ? 'error' : 'ready',
  }
}

function findCompatibleTrack(
  tracks: TimelineTrack[],
  asset: MediaAsset,
  preferredTrackId?: string,
): TimelineTrack | null {
  if (preferredTrackId) {
    const preferred = tracks.find((track) => track.id === preferredTrackId)
    if (preferred) return preferred
  }
  const targetType = mediaTypeToTrackType(asset.type)
  return tracks.find((track) => track.type === targetType && !track.isLocked) ?? null
}

function getDefaultTrackForAsset(asset: MediaAsset): TimelineTrack {
  const type = mediaTypeToTrackType(asset.type)
  return {
    id: `track-${type}-${Date.now()}`,
    name: type === 'audio' ? 'Audio Track' : 'Video Track',
    type,
    height: type === 'audio' ? TRACK_HEIGHT_AUDIO : TRACK_HEIGHT_VIDEO,
    isLocked: false,
    isMuted: false,
    isVisible: true,
    clips: [],
  }
}

function createStoreSnapshot(state: EditorState): EditCommandSnapshot {
  return createSnapshot({
    tracks: state.tracks,
    selectedClipId: state.selection.selectedClipId,
    selectedTrackId: state.selection.selectedTrackId,
    duration: state.playback.duration,
  })
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  loadProject: (project) => {
    const tracks = tracksFromLegacyClips(project.clips)
    const editorProject = createEditorProjectFromLegacy(project, tracks)
    const timeline = updateTimelineFor(
      {
        ...get().timeline,
        scrollOffsetX: 0,
        scrollOffsetY: 0,
        visibleStartTime: 0,
      },
      editorProject.duration,
      tracks,
    )

    set({
      project,
      editorProject,
      clips: project.clips,
      tracks,
      playback: {
        ...initialPlaybackSlice,
        duration: editorProject.duration,
      },
      timeline,
      selection: initialSelectionSlice,
      gestures: initialGestureSlice,
      history: initialHistorySlice,
      media: initialMediaSlice,
      rendering: {
        previewReady: false,
        timelineReady: true,
      },
    })
  },

  setClips: (clips) => {
    const project = get().project
    const tracks = tracksFromLegacyClips(clips)
    const duration = Math.max(getTotalDuration(clips), durationFromTracks(tracks), 60)
    const timeline = updateTimelineFor(get().timeline, duration, tracks)
    const editorProject: EditorProject = {
      ...get().editorProject,
      duration,
      tracks,
      updatedAt: new Date().toISOString(),
    }

    set({
      clips,
      tracks,
      editorProject,
      playback: {
        ...get().playback,
        duration,
        currentTime: clampTime(get().playback.currentTime, 0, duration),
      },
      timeline,
    })

    if (project) {
      const updated: EditProject = {
        ...project,
        clips,
        updatedAt: Date.now(),
      }
      set({ project: updated })
      saveProject(updated)
    }
  },

  addClip: (clip) => {
    const startTime =
      clip.timelineStart ??
      Math.max(0, ...get().clips.map((item) => item.timelineStart + item.duration))
    const next = [...get().clips, { ...clip, timelineStart: startTime }]
    get().setClips(next)
    get().selectClip(clip.id)
  },

  runCommand: (command) => {
    get().setClips(applyLegacyCommand(get().clips, command))
  },

  setIsPlaying: (value) => {
    set({
      playback: {
        ...get().playback,
        isPlaying: value,
        playbackStatus: value ? 'playing' : 'paused',
      },
    })
  },

  setPlaying: (value) => {
    get().setIsPlaying(value)
  },

  togglePlayback: () => {
    const { isPlaying, currentTime, duration } = get().playback
    const nextTime = currentTime >= duration ? 0 : currentTime
    set({
      playback: {
        ...get().playback,
        currentTime: nextTime,
        isPlaying: !isPlaying,
        playbackStatus: !isPlaying ? 'playing' : 'paused',
      },
    })
  },

  setCurrentTime: (time) => {
    set({
      playback: {
        ...get().playback,
        currentTime: clampTime(time, 0, get().playback.duration),
      },
    })
  },

  setDuration: (duration) => {
    const safeDuration = Math.max(0, duration)
    set({
      playback: {
        ...get().playback,
        duration: safeDuration,
        currentTime: clampTime(get().playback.currentTime, 0, safeDuration),
      },
      editorProject: {
        ...get().editorProject,
        duration: safeDuration,
      },
      timeline: updateTimelineFor(get().timeline, safeDuration, get().tracks),
    })
  },

  setPlaybackRate: (rate) => {
    set({
      playback: {
        ...get().playback,
        playbackRate: Math.max(0.25, Math.min(rate, 4)),
      },
    })
  },

  setIsSeeking: (value) => {
    set({
      playback: {
        ...get().playback,
        isSeeking: value,
        playbackStatus: value ? 'seeking' : get().playback.playbackStatus,
      },
    })
  },

  setIsScrubbing: (value) => {
    set({
      playback: {
        ...get().playback,
        isScrubbing: value,
      },
    })
  },

  setLastSeekTime: (time) => {
    set({
      playback: {
        ...get().playback,
        lastSeekTime: clampTime(time, 0, get().playback.duration),
      },
    })
  },

  setPlayerReady: (value) => {
    set({
      playback: {
        ...get().playback,
        playerReady: value,
        playbackStatus: value ? 'ready' : 'idle',
      },
    })
  },

  setPlaybackStatus: (status) => {
    set({
      playback: {
        ...get().playback,
        playbackStatus: status,
      },
    })
  },

  seekTo: (time) => {
    const targetTime = clampTime(time, 0, get().playback.duration)
    set({
      playback: {
        ...get().playback,
        currentTime: targetTime,
        isSeeking: true,
        lastSeekTime: targetTime,
        playbackStatus: 'seeking',
      },
    })
  },

  resetPlayback: () => {
    set({
      playback: {
        ...initialPlaybackSlice,
        duration: get().playback.duration,
      },
    })
  },

  setZoomLevel: (zoom) => {
    const zoomLevel = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM))
    const pixelsPerSecond = BASE_PIXELS_PER_SECOND * zoomLevel
    const timeline = updateTimelineFor(
      {
        ...get().timeline,
        zoomLevel,
        pixelsPerSecond,
      },
      get().playback.duration,
      get().tracks,
    )
    set({ timeline })
  },

  setScrollOffsetX: (value) => {
    const maxScroll = Math.max(0, get().timeline.contentWidth - get().timeline.timelineWidth)
    const scrollOffsetX = Math.max(0, Math.min(value, maxScroll))
    const timeline = updateTimelineFor(
      {
        ...get().timeline,
        scrollOffsetX,
      },
      get().playback.duration,
      get().tracks,
    )
    set({ timeline })
  },

  setScrollOffsetY: (value) => {
    set({
      timeline: {
        ...get().timeline,
        scrollOffsetY: Math.max(0, value),
      },
    })
  },

  setScrollOffset: (value) => {
    get().setScrollOffsetX(value)
  },

  setTimelineSize: (width, height) => {
    const timeline = updateTimelineFor(
      {
        ...get().timeline,
        timelineWidth: Math.max(0, width),
        timelineHeight: Math.max(0, height),
        viewportWidth: Math.max(0, width),
        viewportHeight: Math.max(0, height),
      },
      get().playback.duration,
      get().tracks,
    )
    set({ timeline })
  },

  updateVisibleRange: () => {
    set({
      timeline: updateTimelineFor(get().timeline, get().playback.duration, get().tracks),
    })
  },

  setPixelsPerSecond: (value) => {
    const pixelsPerSecond = Math.max(BASE_PIXELS_PER_SECOND * MIN_ZOOM, value)
    const zoomLevel = pixelsPerSecond / BASE_PIXELS_PER_SECOND
    set({
      timeline: updateTimelineFor(
        {
          ...get().timeline,
          zoomLevel: Math.max(MIN_ZOOM, Math.min(zoomLevel, MAX_ZOOM)),
          pixelsPerSecond,
        },
        get().playback.duration,
        get().tracks,
      ),
    })
  },

  setSnappingEnabled: (value) => {
    set({
      timeline: {
        ...get().timeline,
        isSnappingEnabled: value,
      },
    })
  },

  setActiveSnapGuide: (guide) => {
    set({
      timeline: {
        ...get().timeline,
        activeSnapGuide: guide,
      },
    })
  },

  clearActiveSnapGuide: () => {
    set({
      timeline: {
        ...get().timeline,
        activeSnapGuide: null,
      },
    })
  },

  setAutoScrollEnabled: (value) => {
    set({
      timeline: {
        ...get().timeline,
        autoScrollEnabled: value,
      },
    })
  },

  setFollowPlayhead: (value) => {
    set({
      timeline: {
        ...get().timeline,
        followPlayhead: value,
      },
    })
  },

  setPlayheadLockedToCenter: (value) => {
    set({
      timeline: {
        ...get().timeline,
        playheadLockedToCenter: value,
      },
    })
  },

  setViewportSize: (width, height) => {
    get().setTimelineSize(width, height)
  },

  selectClip: (clipId) => {
    const selectedTrack = get().tracks.find((track) =>
      track.clips.some((clip) => clip.id === clipId),
    )
    set({
      selection: {
        ...get().selection,
        selectedClipId: clipId,
        selectedTrackId: selectedTrack?.id ?? null,
        selectedClipIds: clipId ? [clipId] : [],
        selectedElements: clipId ? [clipId] : [],
      },
    })
  },

  selectTrack: (trackId) => {
    set({
      selection: {
        ...get().selection,
        selectedTrackId: trackId,
      },
    })
  },

  clearSelection: () => {
    set({ selection: initialSelectionSlice })
  },

  setActiveTool: (tool) => {
    set({
      selection: {
        ...get().selection,
        activeTool: tool,
      },
    })
  },

  addTrack: (track) => {
    const tracks = [...get().tracks, track]
    set({
      tracks,
      editorProject: { ...get().editorProject, tracks },
      timeline: updateTimelineFor(get().timeline, get().playback.duration, tracks),
    })
  },

  removeTrack: (trackId) => {
    const tracks = get().tracks.filter((track) => track.id !== trackId)
    set({
      tracks,
      editorProject: { ...get().editorProject, tracks },
      timeline: updateTimelineFor(get().timeline, get().playback.duration, tracks),
    })
  },

  updateTrack: (trackId, patch) => {
    const tracks = get().tracks.map((track) =>
      track.id === trackId ? { ...track, ...patch } : track,
    )
    set({
      tracks,
      editorProject: { ...get().editorProject, tracks },
      timeline: updateTimelineFor(get().timeline, get().playback.duration, tracks),
    })
  },

  addTimelineClip: (trackId, clip) => {
    const tracks = get().tracks.map((track) =>
      track.id === trackId ? { ...track, clips: [...track.clips, clip] } : track,
    )
    const duration = Math.max(get().playback.duration, durationFromTracks(tracks), 60)
    set({
      tracks,
      editorProject: { ...get().editorProject, duration, tracks },
      playback: { ...get().playback, duration },
      timeline: updateTimelineFor(get().timeline, duration, tracks),
    })
  },

  updateClip: (clipId, patch) => {
    const tracks = updateClipInTracks(get().tracks, clipId, patch)
    const duration = Math.max(get().playback.duration, durationFromTracks(tracks), 60)
    set({
      tracks,
      editorProject: { ...get().editorProject, duration, tracks },
      playback: { ...get().playback, duration },
      timeline: updateTimelineFor(get().timeline, duration, tracks),
    })
  },

  removeClip: (clipId) => {
    const tracks = removeClipFromTracks(get().tracks, clipId)
    const clips = get().clips.filter((clip) => clip.id !== clipId)
    const duration = Math.max(getTotalDuration(clips), durationFromTracks(tracks), 60)
    set({
      clips,
      tracks,
      editorProject: { ...get().editorProject, duration, tracks },
      playback: { ...get().playback, duration },
      timeline: updateTimelineFor(get().timeline, duration, tracks),
    })
  },

  moveClip: (clipId, startTime, trackId) => {
    get().previewEditCommand('MOVE_CLIP', { clipId, trackId, startTime })
  },

  previewEditCommand: (type, payload) => {
    const command = createEditCommand(type, payload)
    const result = applyEditCommand(command, createCommandContext(get()))
    if (!result.valid) {
      set({
        history: {
          ...get().history,
          validationError: result.reason ?? 'Edit is not allowed',
        },
      })
      return false
    }

    const clips = legacyClipsFromTracks(result.tracks, get().clips)
    const project = get().project
    const updatedProject = project
      ? { ...project, clips, updatedAt: Date.now() }
      : null

    set({
      project: updatedProject ?? project,
      clips,
      tracks: result.tracks,
      editorProject: {
        ...get().editorProject,
        duration: result.duration,
        tracks: result.tracks,
        updatedAt: new Date().toISOString(),
      },
      playback: {
        ...get().playback,
        duration: result.duration,
        currentTime: clampTime(get().playback.currentTime, 0, result.duration),
      },
      selection: {
        ...get().selection,
        selectedClipId: result.selectedClipId,
        selectedTrackId: result.selectedTrackId,
        selectedClipIds: result.selectedClipId ? [result.selectedClipId] : [],
        selectedElements: result.selectedClipId ? [result.selectedClipId] : [],
      },
      timeline: {
        ...updateTimelineFor(get().timeline, result.duration, result.tracks),
        activeSnapGuide: result.activeSnapGuide,
      },
      history: {
        ...get().history,
        validationError: null,
      },
    })
    return true
  },

  executeCommand: (command) => {
    const beforeState = command.beforeState ?? createStoreSnapshot(get())
    const result = applyEditCommand(command, createCommandContext(get()))
    if (!result.valid) {
      set({
        history: {
          ...get().history,
          validationError: result.reason ?? 'Edit is not allowed',
        },
      })
      return false
    }

    const afterState = createSnapshot({
      tracks: result.tracks,
      selectedClipId: result.selectedClipId,
      selectedTrackId: result.selectedTrackId,
      duration: result.duration,
    })
    const committedCommand: EditCommand = {
      ...command,
      beforeState,
      afterState,
    }
    const clips = legacyClipsFromTracks(result.tracks, get().clips)
    const project = get().project
    const updatedProject = project
      ? { ...project, clips, updatedAt: Date.now() }
      : null
    const undoStack = pushUndoEntry(
      get().history.undoStack,
      committedCommand,
      get().history.maxHistorySize,
    )

    set({
      project: updatedProject ?? project,
      clips,
      tracks: result.tracks,
      editorProject: {
        ...get().editorProject,
        duration: result.duration,
        tracks: result.tracks,
        updatedAt: new Date().toISOString(),
      },
      playback: {
        ...get().playback,
        duration: result.duration,
        currentTime: clampTime(get().playback.currentTime, 0, result.duration),
      },
      selection: {
        ...get().selection,
        selectedClipId: result.selectedClipId,
        selectedTrackId: result.selectedTrackId,
        selectedClipIds: result.selectedClipId ? [result.selectedClipId] : [],
        selectedElements: result.selectedClipId ? [result.selectedClipId] : [],
      },
      timeline: {
        ...updateTimelineFor(get().timeline, result.duration, result.tracks),
        activeSnapGuide: result.activeSnapGuide,
      },
      history: {
        ...get().history,
        undoStack,
        redoStack: [],
        canUndo: undoStack.length > 0,
        canRedo: false,
        lastEditCommand: committedCommand,
        validationError: null,
      },
    })

    if (updatedProject) saveProject(updatedProject)
    return true
  },

  executeEditCommand: (type, payload) => {
    return get().executeCommand(createEditCommand(type, payload))
  },

  undo: () => {
    const command = get().history.undoStack.at(-1)
    const snapshot = command ? revertCommand(command) : null
    if (!command || !snapshot) return
    const nextUndoStack = get().history.undoStack.slice(0, -1)
    const redoStack = [...get().history.redoStack, command]
    const clips = legacyClipsFromTracks(snapshot.tracks, get().clips)
    const project = get().project
    const updatedProject = project
      ? { ...project, clips, updatedAt: Date.now() }
      : null

    set({
      project: updatedProject ?? project,
      clips,
      tracks: snapshot.tracks,
      editorProject: {
        ...get().editorProject,
        duration: snapshot.duration,
        tracks: snapshot.tracks,
        updatedAt: new Date().toISOString(),
      },
      playback: {
        ...get().playback,
        duration: snapshot.duration,
        currentTime: clampTime(get().playback.currentTime, 0, snapshot.duration),
      },
      selection: {
        ...get().selection,
        selectedClipId: snapshot.selectedClipId,
        selectedTrackId: snapshot.selectedTrackId,
        selectedClipIds: snapshot.selectedClipId ? [snapshot.selectedClipId] : [],
        selectedElements: snapshot.selectedClipId ? [snapshot.selectedClipId] : [],
      },
      timeline: {
        ...updateTimelineFor(get().timeline, snapshot.duration, snapshot.tracks),
        activeSnapGuide: null,
      },
      history: {
        ...get().history,
        undoStack: nextUndoStack,
        redoStack,
        canUndo: nextUndoStack.length > 0,
        canRedo: redoStack.length > 0,
        lastEditCommand: command,
        validationError: null,
      },
    })

    if (updatedProject) saveProject(updatedProject)
  },

  redo: () => {
    const command = get().history.redoStack.at(-1)
    const snapshot = command?.afterState
    if (!command || !snapshot) return
    const redoStack = get().history.redoStack.slice(0, -1)
    const undoStack = pushUndoEntry(get().history.undoStack, command, get().history.maxHistorySize)
    const clips = legacyClipsFromTracks(snapshot.tracks, get().clips)
    const project = get().project
    const updatedProject = project
      ? { ...project, clips, updatedAt: Date.now() }
      : null

    set({
      project: updatedProject ?? project,
      clips,
      tracks: snapshot.tracks,
      editorProject: {
        ...get().editorProject,
        duration: snapshot.duration,
        tracks: snapshot.tracks,
        updatedAt: new Date().toISOString(),
      },
      playback: {
        ...get().playback,
        duration: snapshot.duration,
        currentTime: clampTime(get().playback.currentTime, 0, snapshot.duration),
      },
      selection: {
        ...get().selection,
        selectedClipId: snapshot.selectedClipId,
        selectedTrackId: snapshot.selectedTrackId,
        selectedClipIds: snapshot.selectedClipId ? [snapshot.selectedClipId] : [],
        selectedElements: snapshot.selectedClipId ? [snapshot.selectedClipId] : [],
      },
      timeline: {
        ...updateTimelineFor(get().timeline, snapshot.duration, snapshot.tracks),
        activeSnapGuide: null,
      },
      history: {
        ...get().history,
        undoStack,
        redoStack,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        lastEditCommand: command,
        validationError: null,
      },
    })

    if (updatedProject) saveProject(updatedProject)
  },

  clearHistory: () => {
    set({ history: initialHistorySlice })
  },

  pushHistoryEntry: (entry) => {
    const undoStack = pushUndoEntry(get().history.undoStack, entry, get().history.maxHistorySize)
    set({
      history: {
        ...get().history,
        undoStack,
        redoStack: [],
        canUndo: undoStack.length > 0,
        canRedo: false,
        lastEditCommand: entry,
      },
    })
  },

  addMediaAsset: (asset) => {
    const media = addAssetToSlice(get().media, asset)
    set({
      media,
      editorProject: {
        ...get().editorProject,
        mediaAssetIds: media.assetOrder,
        updatedAt: new Date().toISOString(),
      },
    })
  },

  addMediaAssets: (assets) => {
    let media = get().media
    assets.forEach((asset) => {
      media = addAssetToSlice(media, asset)
    })
    set({
      media,
      editorProject: {
        ...get().editorProject,
        mediaAssetIds: media.assetOrder,
        updatedAt: new Date().toISOString(),
      },
    })
  },

  updateMediaAsset: (assetId, updates) => {
    const asset = get().media.mediaAssets[assetId]
    if (!asset) return
    set({
      media: {
        ...get().media,
        mediaAssets: {
          ...get().media.mediaAssets,
          [assetId]: {
            ...asset,
            ...updates,
          },
        },
      },
    })
  },

  removeMediaAsset: (assetId) => {
    const media = removeAssetFromSlice(get().media, assetId)
    set({
      media,
      editorProject: {
        ...get().editorProject,
        mediaAssetIds: media.assetOrder,
        updatedAt: new Date().toISOString(),
      },
    })
  },

  selectMediaAsset: (assetId) => {
    set({
      media: {
        ...get().media,
        selectedAssetId: assetId,
      },
    })
  },

  setIsImporting: (value) => {
    set({
      media: {
        ...get().media,
        isImporting: value,
      },
    })
  },

  setImportError: (error) => {
    set({
      media: {
        ...get().media,
        importError: error,
      },
    })
  },

  attachThumbnail: (assetId, thumbnailUri) => {
    get().updateMediaAsset(assetId, { thumbnailUri })
  },

  attachWaveformData: (assetId, waveformData) => {
    set({ media: attachWaveformToSlice(get().media, assetId, waveformData) })
  },

  addMediaAssetToTimeline: (assetId, options) => {
    const asset = get().media.mediaAssets[assetId]
    if (!asset) {
      get().setImportError('Media asset not found')
      return false
    }

    let tracks = get().tracks
    let track = findCompatibleTrack(tracks, asset, options?.trackId)
    if (!track) {
      track = getDefaultTrackForAsset(asset)
      tracks = [...tracks, track]
    }

    const validation = validateAssetForTrack(asset, track)
    if (!validation.valid) {
      get().setImportError(validation.reason ?? 'Asset cannot be added to this track')
      return false
    }

    const targetTrack = track
    const endOfTrack = Math.max(0, ...targetTrack.clips.map(getClipEndTime))
    const startTime = Math.max(0, options?.startTime ?? get().playback.currentTime ?? endOfTrack)
    const clip = createClipFromAsset(asset, targetTrack.id, startTime || endOfTrack)
    const nextTracks = tracks.map((item) =>
      item.id === targetTrack.id ? { ...item, clips: [...item.clips, clip] } : item,
    )
    const duration = Math.max(get().playback.duration, durationFromTracks(nextTracks), 60)

    set({
      tracks: nextTracks,
      editorProject: {
        ...get().editorProject,
        duration,
        tracks: nextTracks,
        updatedAt: new Date().toISOString(),
      },
      playback: { ...get().playback, duration },
      selection: {
        ...get().selection,
        selectedClipId: clip.id,
        selectedTrackId: targetTrack.id,
        selectedClipIds: [clip.id],
        selectedElements: [clip.id],
      },
      timeline: updateTimelineFor(get().timeline, duration, nextTracks),
      media: {
        ...get().media,
        selectedAssetId: asset.id,
        importError: null,
      },
    })
    return true
  },

  setActiveGesture: (gesture) => {
    set({ gestures: { ...get().gestures, activeGesture: gesture } })
  },

  setIsDraggingClip: (value) => {
    set({ gestures: { ...get().gestures, isDraggingClip: value } })
  },

  setIsDraggingPlayhead: (value) => {
    set({ gestures: { ...get().gestures, isDraggingPlayhead: value } })
  },

  setIsPinching: (value) => {
    set({ gestures: { ...get().gestures, isPinching: value } })
  },

  setDragClipId: (clipId) => {
    set({ gestures: { ...get().gestures, dragClipId: clipId } })
  },

  beginScrub: (time, x) => {
    const scrubTime = clampTime(time, 0, get().playback.duration)
    set({
      playback: {
        ...get().playback,
        currentTime: scrubTime,
        isScrubbing: true,
      },
      gestures: {
        ...get().gestures,
        activeGesture: 'playhead-drag',
        isDraggingPlayhead: true,
        isScrubbingPlayhead: true,
        scrubStartTime: scrubTime,
        scrubCurrentTime: scrubTime,
        scrubStartX: x,
        scrubCurrentX: x,
      },
    })
  },

  updateScrub: (time, x) => {
    const scrubTime = clampTime(time, 0, get().playback.duration)
    set({
      playback: {
        ...get().playback,
        currentTime: scrubTime,
        isScrubbing: true,
      },
      gestures: {
        ...get().gestures,
        scrubCurrentTime: scrubTime,
        scrubCurrentX: x,
      },
    })
  },

  endScrub: () => {
    set({
      playback: {
        ...get().playback,
        isScrubbing: false,
      },
      gestures: {
        ...get().gestures,
        activeGesture: 'none',
        isDraggingPlayhead: false,
        isScrubbingPlayhead: false,
      },
    })
  },

  cancelScrub: () => {
    set({
      playback: {
        ...get().playback,
        isScrubbing: false,
      },
      gestures: {
        ...get().gestures,
        activeGesture: 'none',
        isDraggingPlayhead: false,
        isScrubbingPlayhead: false,
      },
    })
  },

  setExportProgress: (progress) => {
    set({
      ui: {
        ...get().ui,
        exportProgress: Math.max(0, Math.min(progress, 1)),
      },
    })
  },

  setIsExporting: (exporting) => {
    set({ ui: { ...get().ui, isExporting: exporting } })
  },

  persist: () => {
    const project = get().project
    if (project) saveProject({ ...project, clips: get().clips, updatedAt: Date.now() })
  },

  reset: () => {
    set({ ...initialState })
  },
}))

export function getSelectedClip(state: EditorState): TimelineClip | null {
  const selectedClipId = state.selection.selectedClipId
  if (!selectedClipId) return null
  return (
    state.tracks
      .flatMap((track) => track.clips)
      .find((clip) => clip.id === selectedClipId) ?? null
  )
}

export type { EditorTool, TimelineClip, TimelineTrack }
