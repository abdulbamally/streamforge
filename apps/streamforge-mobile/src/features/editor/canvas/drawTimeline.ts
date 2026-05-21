import React from 'react'
import { Rect } from '@shopify/react-native-skia'
import type { SkFont } from '@shopify/react-native-skia'
import type { TimelineTrack } from '../types/track.types'
import type { TimelineMetrics } from '../types/timeline.types'
import { EditorColors } from '../theme/editorTokens'
import { drawClips } from './drawClips'
import { drawGrid } from './drawGrid'
import { drawPlayhead } from './drawPlayhead'
import { drawRuler } from './drawRuler'
import { drawSnapGuide } from './drawSnapGuide'
import { drawTracks } from './drawTracks'
import type { SnapGuide } from '../engine/editing/snappingEngine'

type DrawTimelineArgs = {
  tracks: TimelineTrack[]
  metrics: TimelineMetrics
  currentTime: number
  selectedClipId: string | null
  activeSnapGuide: SnapGuide | null
  font: SkFont | null
}

export function drawTimeline({
  tracks,
  metrics,
  currentTime,
  selectedClipId,
  activeSnapGuide,
  font,
}: DrawTimelineArgs): React.ReactNode[] {
  return [
    React.createElement(Rect, {
      key: 'timeline-bg',
      x: 0,
      y: 0,
      width: metrics.viewportWidth,
      height: metrics.viewportHeight,
      color: EditorColors.surfaceSoft,
    }),
    ...drawGrid(metrics),
    ...drawTracks(tracks, metrics.viewportWidth, font),
    ...drawClips(tracks, metrics, selectedClipId, font),
    ...drawSnapGuide(activeSnapGuide, metrics),
    ...drawRuler(metrics, font),
    ...drawPlayhead(currentTime, metrics),
  ]
}
