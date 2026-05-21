import {
  BASE_PIXELS_PER_SECOND,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../engine/timeline/timelineConstants'
import type { SnapGuide } from '../engine/editing/snappingEngine'

export type TimelineSlice = {
  zoomLevel: number
  minZoom: number
  maxZoom: number
  scrollOffsetX: number
  scrollOffsetY: number
  pixelsPerSecond: number
  visibleStartTime: number
  visibleEndTime: number
  timelineWidth: number
  timelineHeight: number
  contentWidth: number
  contentHeight: number
  isSnappingEnabled: boolean
  autoScrollEnabled: boolean
  followPlayhead: boolean
  playheadLockedToCenter: boolean
  viewportWidth: number
  viewportHeight: number
  activeSnapGuide: SnapGuide | null
}

export const initialTimelineSlice: TimelineSlice = {
  zoomLevel: 1,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  scrollOffsetX: 0,
  scrollOffsetY: 0,
  pixelsPerSecond: BASE_PIXELS_PER_SECOND,
  visibleStartTime: 0,
  visibleEndTime: 0,
  timelineWidth: 0,
  timelineHeight: 0,
  contentWidth: 0,
  contentHeight: 0,
  isSnappingEnabled: true,
  autoScrollEnabled: true,
  followPlayhead: true,
  playheadLockedToCenter: false,
  viewportWidth: 0,
  viewportHeight: 0,
  activeSnapGuide: null,
}
