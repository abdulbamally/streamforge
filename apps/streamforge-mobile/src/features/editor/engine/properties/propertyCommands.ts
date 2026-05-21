import { createEditCommand } from '../editing/editCommands'
import type { ClipTransform, TimelineClip } from '../../types/clip.types'
import type { FilterAssignment } from '../../types/filter.types'
import type { TextClipProperties } from '../../types/text.types'
import type { TransitionAssignment } from '../../types/transition.types'

export function updateClipTransformCommand(clipId: string, transform: ClipTransform) {
  return createEditCommand('UPDATE_CLIP_TRANSFORM', { clipId, patch: { transform } })
}

export function updateClipOpacityCommand(clipId: string, opacity: number) {
  return createEditCommand('UPDATE_CLIP_OPACITY', { clipId, patch: { opacity } })
}

export function updateClipVolumeCommand(clipId: string, volume: number) {
  return createEditCommand('UPDATE_CLIP_VOLUME', { clipId, patch: { volume } })
}

export function updateTextPropertiesCommand(clipId: string, text: TextClipProperties) {
  return createEditCommand('UPDATE_TEXT_PROPERTIES', {
    clipId,
    patch: {
      text,
      textContent: text.content,
      fontSize: text.fontSize,
      textColor: text.color,
    },
  })
}

export function addTextClipCommand(trackId: string, clip: TimelineClip) {
  return createEditCommand('ADD_TEXT_CLIP', { trackId, clip })
}

export function addStickerClipCommand(trackId: string, clip: TimelineClip) {
  return createEditCommand('ADD_STICKER_CLIP', { trackId, clip })
}

export function updateFiltersCommand(clipId: string, filters: FilterAssignment[]) {
  return createEditCommand('UPDATE_FILTER_ASSIGNMENT', { clipId, patch: { filters } })
}

export function updateTransitionsCommand(clipId: string, transitions: TransitionAssignment[]) {
  return createEditCommand('UPDATE_TRANSITION_ASSIGNMENT', { clipId, patch: { transitions } })
}
