import type {
  EditCommand,
  EditCommandPayload,
  EditCommandSnapshot,
  EditCommandType,
  EditValidationResult,
} from '../../types/editCommand.types'
import type { TimelineTrack } from '../../types/track.types'
import { SNAP_GRID_SECONDS } from '../timeline/timelineConstants'
import { clampTime } from '../timeline/timelineMath'
import {
  calculateProjectDuration,
  findClipById,
  removeClipFromTracks,
  replaceClipWithClips,
  sortTrackClips,
  updateClipInTracks,
} from './clipOperations'
import {
  canDeleteClip,
  canAddClip,
  canMoveClip,
  canSplitClip,
  canTrimClipEnd,
  canTrimClipStart,
  fail,
} from './editValidation'
import { getClipEndTime } from './overlapDetection'
import { snapTimelineTime, type SnapGuide } from './snappingEngine'
import { splitClipAtTime } from './splitOperations'
import { updateTrackById } from './trackOperations'
import { trimClipEnd, trimClipStart } from './trimOperations'

export type EditCommandContext = {
  tracks: TimelineTrack[]
  currentTime: number
  duration: number
  selectedClipId: string | null
  selectedTrackId: string | null
  snappingEnabled: boolean
}

export type EditCommandResult = {
  valid: boolean
  reason?: string
  tracks: TimelineTrack[]
  selectedClipId: string | null
  selectedTrackId: string | null
  duration: number
  activeSnapGuide: SnapGuide | null
}

export function createEditCommand(type: EditCommandType, payload: EditCommandPayload): EditCommand {
  return {
    id: `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: Date.now(),
    payload,
  }
}

export function createSnapshot(context: {
  tracks: TimelineTrack[]
  selectedClipId: string | null
  selectedTrackId: string | null
  duration: number
}): EditCommandSnapshot {
  return {
    tracks: context.tracks,
    selectedClipId: context.selectedClipId,
    selectedTrackId: context.selectedTrackId,
    duration: context.duration,
  }
}

function invalid(context: EditCommandContext, validation: EditValidationResult): EditCommandResult {
  return {
    valid: false,
    reason: validation.reason,
    tracks: context.tracks,
    selectedClipId: context.selectedClipId,
    selectedTrackId: context.selectedTrackId,
    duration: context.duration,
    activeSnapGuide: null,
  }
}

function success(
  context: EditCommandContext,
  tracks: TimelineTrack[],
  selectedClipId = context.selectedClipId,
  selectedTrackId = context.selectedTrackId,
  activeSnapGuide: SnapGuide | null = null,
): EditCommandResult {
  const duration = Math.max(0, calculateProjectDuration(tracks), 60)
  return {
    valid: true,
    tracks: sortTrackClips(tracks),
    selectedClipId,
    selectedTrackId,
    duration,
    activeSnapGuide,
  }
}

function moveClip(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { clipId: string; trackId?: string; startTime: number }
  const lookup = findClipById(context.tracks, payload.clipId)
  if (!lookup) return invalid(context, fail('Clip not found'))
  const targetTrackId = payload.trackId ?? lookup.track.id
  const snapResult = snapTimelineTime({
    proposedTime: Math.max(0, payload.startTime),
    currentTime: context.currentTime,
    tracks: context.tracks,
    activeTrackId: targetTrackId,
    snappingEnabled: context.snappingEnabled,
    gridSizeSeconds: SNAP_GRID_SECONDS,
    ignoreClipId: payload.clipId,
  })
  const startTime = Math.max(0, snapResult.snappedTime)
  const validation = canMoveClip(
    payload.clipId,
    targetTrackId,
    startTime,
    lookup.clip.duration,
    context.tracks,
  )
  if (!validation.valid) return invalid(context, validation)

  const tracks = context.tracks.map((track) => {
    if (track.id === lookup.track.id && track.id !== targetTrackId) {
      return {
        ...track,
        clips: track.clips.filter((clip) => clip.id !== payload.clipId),
      }
    }
    if (track.id === targetTrackId) {
      const existing = track.clips.some((clip) => clip.id === payload.clipId)
      const movedClip = {
        ...lookup.clip,
        trackId: targetTrackId,
        startTime,
      }
      return {
        ...track,
        clips: existing
          ? track.clips.map((clip) => (clip.id === payload.clipId ? movedClip : clip))
          : [...track.clips, movedClip],
      }
    }
    return track
  })

  return success(
    context,
    tracks,
    payload.clipId,
    targetTrackId,
    snapResult.shouldShowSnapGuide && snapResult.snapTargetTime !== null
      ? { time: snapResult.snapTargetTime, type: snapResult.snapType as SnapGuide['type'] }
      : null,
  )
}

function trimStart(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { clipId: string; time: number }
  const lookup = findClipById(context.tracks, payload.clipId)
  if (!lookup) return invalid(context, fail('Clip not found'))
  const snapResult = snapTimelineTime({
    proposedTime: clampTime(payload.time, 0, getClipEndTime(lookup.clip)),
    currentTime: context.currentTime,
    tracks: context.tracks,
    activeTrackId: lookup.track.id,
    snappingEnabled: context.snappingEnabled,
    ignoreClipId: payload.clipId,
  })
  const validation = canTrimClipStart(
    lookup.clip,
    lookup.track,
    snapResult.snappedTime,
    context.tracks,
  )
  if (!validation.valid) return invalid(context, validation)
  const nextClip = trimClipStart(lookup.clip, snapResult.snappedTime)
  return success(
    context,
    updateClipInTracks(context.tracks, payload.clipId, nextClip),
    payload.clipId,
    lookup.track.id,
    snapResult.shouldShowSnapGuide && snapResult.snapTargetTime !== null
      ? { time: snapResult.snapTargetTime, type: snapResult.snapType as SnapGuide['type'] }
      : null,
  )
}

function trimEnd(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { clipId: string; time: number }
  const lookup = findClipById(context.tracks, payload.clipId)
  if (!lookup) return invalid(context, fail('Clip not found'))
  const snapResult = snapTimelineTime({
    proposedTime: Math.max(lookup.clip.startTime, payload.time),
    currentTime: context.currentTime,
    tracks: context.tracks,
    activeTrackId: lookup.track.id,
    snappingEnabled: context.snappingEnabled,
    ignoreClipId: payload.clipId,
  })
  const validation = canTrimClipEnd(
    lookup.clip,
    lookup.track,
    snapResult.snappedTime,
    context.tracks,
  )
  if (!validation.valid) return invalid(context, validation)
  const nextClip = trimClipEnd(lookup.clip, snapResult.snappedTime)
  return success(
    context,
    updateClipInTracks(context.tracks, payload.clipId, nextClip),
    payload.clipId,
    lookup.track.id,
    snapResult.shouldShowSnapGuide && snapResult.snapTargetTime !== null
      ? { time: snapResult.snapTargetTime, type: snapResult.snapType as SnapGuide['type'] }
      : null,
  )
}

function splitClip(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { clipId: string; time: number }
  const lookup = findClipById(context.tracks, payload.clipId)
  if (!lookup) return invalid(context, fail('Clip not found'))
  const validation = canSplitClip(lookup.clip, lookup.track, payload.time)
  if (!validation.valid) return invalid(context, validation)
  const splitClips = splitClipAtTime(lookup.clip, payload.time)
  const [, rightClip] = splitClips
  const tracks = replaceClipWithClips(
    context.tracks,
    payload.clipId,
    splitClips,
  )
  return success(context, tracks, rightClip.id, lookup.track.id)
}

function deleteClip(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { clipId: string }
  const lookup = findClipById(context.tracks, payload.clipId)
  if (!lookup) return invalid(context, fail('Clip not found'))
  const validation = canDeleteClip(lookup.track)
  if (!validation.valid) return invalid(context, validation)
  return success(context, removeClipFromTracks(context.tracks, payload.clipId), null, lookup.track.id)
}

function addClip(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { trackId: string; clip: import('../../types/clip.types').TimelineClip }
  const track = context.tracks.find((item) => item.id === payload.trackId)
  const clip = {
    ...payload.clip,
    trackId: payload.trackId,
  }
  const validation = canAddClip(clip, track, context.tracks)
  if (!validation.valid) return invalid(context, validation)
  const tracks = context.tracks.map((item) =>
    item.id === payload.trackId ? { ...item, clips: [...item.clips, clip] } : item,
  )
  return success(context, tracks, clip.id, payload.trackId)
}

function updateClip(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { clipId: string; patch: Partial<import('../../types/clip.types').TimelineClip> }
  const lookup = findClipById(context.tracks, payload.clipId)
  if (!lookup) return invalid(context, fail('Clip not found'))
  if (lookup.track.isLocked) return invalid(context, fail('Track is locked'))
  return success(
    context,
    updateClipInTracks(context.tracks, payload.clipId, payload.patch),
    payload.clipId,
    lookup.track.id,
  )
}

function updateTrack(command: EditCommand, context: EditCommandContext) {
  const payload = command.payload as { trackId: string }
  const track = context.tracks.find((item) => item.id === payload.trackId)
  if (!track) return invalid(context, fail('Track not found'))

  const trackPatches: Partial<Record<EditCommandType, Partial<TimelineTrack>>> = {
    LOCK_TRACK: { isLocked: true },
    UNLOCK_TRACK: { isLocked: false },
    MUTE_TRACK: { isMuted: true },
    UNMUTE_TRACK: { isMuted: false },
    HIDE_TRACK: { isVisible: false },
    SHOW_TRACK: { isVisible: true },
  }
  const patchByType = trackPatches[command.type] ?? {}

  return success(context, updateTrackById(context.tracks, payload.trackId, patchByType))
}

export function applyCommand(command: EditCommand, context: EditCommandContext): EditCommandResult {
  switch (command.type) {
    case 'MOVE_CLIP':
      return moveClip(command, context)
    case 'TRIM_CLIP_START':
      return trimStart(command, context)
    case 'TRIM_CLIP_END':
      return trimEnd(command, context)
    case 'SPLIT_CLIP':
      return splitClip(command, context)
    case 'DELETE_CLIP':
      return deleteClip(command, context)
    case 'ADD_CLIP':
      return addClip(command, context)
    case 'UPDATE_CLIP':
      return updateClip(command, context)
    case 'LOCK_TRACK':
    case 'UNLOCK_TRACK':
    case 'MUTE_TRACK':
    case 'UNMUTE_TRACK':
    case 'HIDE_TRACK':
    case 'SHOW_TRACK':
      return updateTrack(command, context)
    default:
      return invalid(context, fail('Unsupported edit command'))
  }
}

export function revertCommand(command: EditCommand) {
  return command.beforeState ?? null
}
