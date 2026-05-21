import React from 'react'
import { Line } from '@shopify/react-native-skia'
import type { TimelineMetrics } from '../types/timeline.types'
import type { SnapGuide } from '../engine/editing/snappingEngine'
import { timeToX } from '../engine/timeline/timelineMath'
import { RULER_HEIGHT } from '../engine/timeline/timelineConstants'

export function drawSnapGuide(
  guide: SnapGuide | null,
  metrics: TimelineMetrics,
): React.ReactNode[] {
  if (!guide) return []
  const x = timeToX(guide.time, metrics.pixelsPerSecond, metrics.scrollOffsetX)
  if (x < 0 || x > metrics.viewportWidth) return []

  return [
    React.createElement(Line, {
      key: `snap-guide-${guide.type}-${guide.time}`,
      p1: { x, y: RULER_HEIGHT },
      p2: { x, y: metrics.viewportHeight },
      color: '#22c55e',
      strokeWidth: 2,
    }),
  ]
}

