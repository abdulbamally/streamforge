import React from 'react'
import { Line, RoundedRect } from '@shopify/react-native-skia'
import type { TimelineMetrics } from '../types/timeline.types'
import { EditorColors } from '../theme/editorTokens'
import { PLAYHEAD_WIDTH, RULER_HEIGHT } from '../engine/timeline/timelineConstants'
import { timeToX } from '../engine/timeline/timelineMath'

export function drawPlayhead(currentTime: number, metrics: TimelineMetrics): React.ReactNode[] {
  const x = timeToX(currentTime, metrics.pixelsPerSecond, metrics.scrollOffsetX)
  if (x < 0 || x > metrics.viewportWidth) return []

  return [
    React.createElement(Line, {
      key: 'playhead-line',
      p1: { x, y: 0 },
      p2: { x, y: metrics.viewportHeight },
      color: EditorColors.accent,
      strokeWidth: PLAYHEAD_WIDTH,
    }),
    React.createElement(RoundedRect, {
      key: 'playhead-handle',
      x: x - 7,
      y: RULER_HEIGHT - 8,
      width: 14,
      height: 14,
      r: 7,
      color: EditorColors.accent,
    }),
  ]
}
