import type { TimelineClip } from './clip.types'
import type { TimelineTrack } from './track.types'

export type TimelineVisibleRange = {
  start: number
  end: number
}

export type TimelineMetrics = {
  viewportWidth: number
  viewportHeight: number
  contentWidth: number
  contentHeight: number
  pixelsPerSecond: number
  scrollOffsetX: number
  scrollOffsetY: number
  visibleStartTime: number
  visibleEndTime: number
}

export type TimelineClipLayout = {
  clip: TimelineClip
  track: TimelineTrack
  x: number
  y: number
  width: number
  height: number
  isVisible: boolean
}

export type TimelineTrackLayout = {
  track: TimelineTrack
  y: number
  height: number
}

export type TimelineHitResult =
  | {
      type: 'clip'
      clip: TimelineClip
      track: TimelineTrack
    }
  | {
      type: 'trim-left'
      clip: TimelineClip
      track: TimelineTrack
    }
  | {
      type: 'trim-right'
      clip: TimelineClip
      track: TimelineTrack
    }
  | {
      type: 'ruler'
      time: number
    }
  | {
      type: 'track-control'
      track: TimelineTrack
    }
  | {
      type: 'track'
      track: TimelineTrack
    }
  | {
      type: 'empty'
      time: number
    }
