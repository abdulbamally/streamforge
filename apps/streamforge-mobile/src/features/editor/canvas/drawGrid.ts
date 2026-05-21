import React from 'react'
import { Line } from '@shopify/react-native-skia'
import type { TimelineMetrics } from '../types/timeline.types'
import { EditorColors } from '../theme/editorTokens'
import { timeToX } from '../engine/timeline/timelineMath'

export function drawGrid(metrics: TimelineMetrics): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const start = Math.floor(metrics.visibleStartTime)
  const end = Math.ceil(metrics.visibleEndTime)

  for (let time = start; time <= end; time += 1) {
    const x = timeToX(time, metrics.pixelsPerSecond, metrics.scrollOffsetX)
    const isMajor = time % 5 === 0
    nodes.push(
      React.createElement(Line, {
        key: `grid-${time}`,
        p1: { x, y: 0 },
        p2: { x, y: metrics.viewportHeight },
        color: isMajor ? EditorColors.borderStrong : EditorColors.border,
        strokeWidth: isMajor ? 1 : 0.6,
        opacity: isMajor ? 0.7 : 0.45,
      }),
    )
  }

  return nodes
}
