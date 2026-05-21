import React from 'react'
import { Line, Rect, Text as SkiaText } from '@shopify/react-native-skia'
import type { SkFont } from '@shopify/react-native-skia'
import type { TimelineMetrics } from '../types/timeline.types'
import { EditorColors } from '../theme/editorTokens'
import { RULER_HEIGHT } from '../engine/timeline/timelineConstants'
import { formatTimeLabel, timeToX } from '../engine/timeline/timelineMath'

export function drawRuler(metrics: TimelineMetrics, font: SkFont | null): React.ReactNode[] {
  const nodes: React.ReactNode[] = [
    React.createElement(Rect, {
      key: 'ruler-bg',
      x: 0,
      y: 0,
      width: metrics.viewportWidth,
      height: RULER_HEIGHT,
      color: EditorColors.surface,
    }),
  ]
  const start = Math.floor(metrics.visibleStartTime)
  const end = Math.ceil(metrics.visibleEndTime)

  for (let time = start; time <= end; time += 1) {
    const x = timeToX(time, metrics.pixelsPerSecond, metrics.scrollOffsetX)
    const isMajor = time % 5 === 0
    nodes.push(
      React.createElement(Line, {
        key: `ruler-tick-${time}`,
        p1: { x, y: isMajor ? 8 : 16 },
        p2: { x, y: RULER_HEIGHT },
        color: isMajor ? EditorColors.textTertiary : EditorColors.borderStrong,
        strokeWidth: isMajor ? 1.2 : 0.8,
      }),
    )
    if (isMajor) {
      nodes.push(
        React.createElement(SkiaText, {
          key: `ruler-label-${time}`,
          x: x + 4,
          y: 13,
          text: formatTimeLabel(time),
          font,
          color: EditorColors.textSecondary,
        }),
      )
    }
  }

  return nodes
}
