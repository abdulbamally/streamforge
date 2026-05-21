import type { TimelineClip, TimelineClipType } from './clip.types'

export type TimelineTrackType = TimelineClipType

export type TimelineTrack = {
  id: string
  name: string
  type: TimelineTrackType
  height: number
  isLocked: boolean
  isMuted: boolean
  isVisible: boolean
  clips: TimelineClip[]
}
