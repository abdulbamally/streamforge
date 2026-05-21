import type { TimelineClip } from './clip.types'
import type { TimelineTrack } from './track.types'

export type EditCommandType =
  | 'MOVE_CLIP'
  | 'TRIM_CLIP_START'
  | 'TRIM_CLIP_END'
  | 'SPLIT_CLIP'
  | 'DELETE_CLIP'
  | 'ADD_CLIP'
  | 'UPDATE_CLIP'
  | 'UPDATE_CLIP_TRANSFORM'
  | 'UPDATE_CLIP_OPACITY'
  | 'UPDATE_CLIP_VOLUME'
  | 'UPDATE_TEXT_PROPERTIES'
  | 'ADD_TEXT_CLIP'
  | 'ADD_STICKER_CLIP'
  | 'ADD_FILTER_ASSIGNMENT'
  | 'UPDATE_FILTER_ASSIGNMENT'
  | 'REMOVE_FILTER_ASSIGNMENT'
  | 'ADD_TRANSITION_ASSIGNMENT'
  | 'UPDATE_TRANSITION_ASSIGNMENT'
  | 'REMOVE_TRANSITION_ASSIGNMENT'
  | 'LOCK_TRACK'
  | 'UNLOCK_TRACK'
  | 'MUTE_TRACK'
  | 'UNMUTE_TRACK'
  | 'HIDE_TRACK'
  | 'SHOW_TRACK'

export type EditCommandPayload =
  | { clipId: string; trackId?: string; startTime: number }
  | { clipId: string; time: number }
  | { clipId: string }
  | { trackId: string }
  | { trackId: string; clip: TimelineClip }
  | { clipId: string; patch: Partial<TimelineClip> }

export type EditCommandSnapshot = {
  tracks: TimelineTrack[]
  selectedClipId: string | null
  selectedTrackId: string | null
  duration: number
}

export type EditCommand = {
  id: string
  type: EditCommandType
  timestamp: number
  payload: EditCommandPayload
  beforeState?: EditCommandSnapshot
  afterState?: EditCommandSnapshot
}

export type EditValidationResult = {
  valid: boolean
  reason?: string
}
