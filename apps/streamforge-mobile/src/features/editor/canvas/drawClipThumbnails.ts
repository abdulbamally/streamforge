import React from 'react'
import { Line, Rect, RoundedRect } from '@shopify/react-native-skia'
import type { TimelineClip } from '../types/clip.types'
import { getThumbnailDensity } from '../engine/media/thumbnailService'
import { CLIP_BORDER_RADIUS } from '../engine/timeline/timelineConstants'

export function drawClipThumbnails(
  clip: TimelineClip,
  x: number,
  y: number,
  width: number,
  height: number,
  zoomLevel: number,
): React.ReactNode[] {
  const density = getThumbnailDensity(width, zoomLevel)
  const ready = Boolean(clip.thumbnailUris?.length || clip.thumbnailUri)
  const nodes: React.ReactNode[] = []

  for (let index = 0; index < density.count; index += 1) {
    const segmentX = x + index * density.segmentWidth
    const segmentWidth = Math.max(6, density.segmentWidth - 1)
    nodes.push(
      React.createElement(RoundedRect, {
        key: `${clip.id}-thumb-${index}`,
        x: segmentX + 2,
        y: y + 7,
        width: Math.max(2, segmentWidth - 4),
        height: Math.max(8, height - 14),
        r: Math.min(CLIP_BORDER_RADIUS, 6),
        color: ready
          ? index % 2 === 0
            ? 'rgba(15,23,42,0.26)'
            : 'rgba(15,23,42,0.18)'
          : index % 2 === 0
            ? 'rgba(255,255,255,0.30)'
            : 'rgba(255,255,255,0.18)',
      }),
    )
    if (density.count > 1 && index > 0) {
      nodes.push(
        React.createElement(Line, {
          key: `${clip.id}-thumb-divider-${index}`,
          p1: { x: segmentX, y: y + 8 },
          p2: { x: segmentX, y: y + height - 8 },
          color: 'rgba(255,255,255,0.18)',
          strokeWidth: 1,
        }),
      )
    }
  }

  if (!ready && width > 82) {
    nodes.push(
      React.createElement(Rect, {
        key: `${clip.id}-film-perf-top`,
        x: x + 8,
        y: y + 6,
        width: Math.max(0, width - 16),
        height: 3,
        color: 'rgba(15,23,42,0.18)',
      }),
      React.createElement(Rect, {
        key: `${clip.id}-film-perf-bottom`,
        x: x + 8,
        y: y + height - 9,
        width: Math.max(0, width - 16),
        height: 3,
        color: 'rgba(15,23,42,0.18)',
      }),
    )
  }

  return nodes
}
