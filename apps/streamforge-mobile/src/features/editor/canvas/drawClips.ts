import React from 'react'
import { Circle, Line, Rect, RoundedRect, Text as SkiaText } from '@shopify/react-native-skia'
import type { SkFont } from '@shopify/react-native-skia'
import type { TimelineMetrics } from '../types/timeline.types'
import type { TimelineTrack } from '../types/track.types'
import {
  CLIP_BORDER_RADIUS,
  CLIP_COLORS,
  TRACK_LABEL_WIDTH,
  TRIM_HANDLE_WIDTH,
} from '../engine/timeline/timelineConstants'
import { layoutClips } from '../engine/timeline/timelineLayout'
import { EditorColors } from '../theme/editorTokens'
import { drawClipThumbnails } from './drawClipThumbnails'
import { drawWaveforms } from './drawWaveforms'

function clipLabelPrefix(type: string): string {
  if (type === 'audio') return 'AUD'
  if (type === 'text') return 'TXT'
  if (type === 'effect') return 'FX'
  if (type === 'image') return 'IMG'
  return 'VID'
}

function visualStatusColor(status: string | undefined): string {
  if (status === 'loading') return 'rgba(245,158,11,0.82)'
  if (status === 'error') return 'rgba(220,38,38,0.82)'
  if (status === 'ready') return 'rgba(34,197,94,0.72)'
  return 'rgba(255,255,255,0.62)'
}

export function drawClips(
  tracks: TimelineTrack[],
  metrics: TimelineMetrics,
  selectedClipId: string | null,
  font: SkFont | null,
): React.ReactNode[] {
  return layoutClips(tracks, metrics)
    .filter((layout) => layout.isVisible)
    .flatMap(({ clip, track, x, y, width, height }) => {
      const safeX = Math.max(TRACK_LABEL_WIDTH + 8, x)
      const safeWidth = Math.max(0, width - Math.max(0, safeX - x))
      if (safeWidth <= 0) return []
      const selected = clip.id === selectedClipId
      const subdued = track.isLocked || track.isMuted || !track.isVisible
      const baseColor = subdued ? '#d1d5db' : clip.color ?? CLIP_COLORS[clip.type]
      const contentY = y + 5
      return [
        React.createElement(RoundedRect, {
          key: `${clip.id}-clip`,
          x: safeX,
          y: contentY,
          width: safeWidth,
          height,
          r: CLIP_BORDER_RADIUS,
          color: baseColor,
        }),
        clip.type === 'video' || clip.type === 'image'
          ? drawClipThumbnails(clip, safeX, contentY, safeWidth, height, metrics.pixelsPerSecond / 40)
          : null,
        clip.type === 'audio'
          ? drawWaveforms(clip, safeX, contentY, safeWidth, height)
          : null,
        clip.type === 'text'
          ? React.createElement(RoundedRect, {
              key: `${clip.id}-text-card`,
              x: safeX + 8,
              y: contentY + 9,
              width: Math.max(12, safeWidth - 16),
              height: Math.max(8, height - 18),
              r: 7,
              color: 'rgba(146,64,14,0.16)',
            })
          : null,
        clip.type === 'effect'
          ? Array.from({ length: Math.max(2, Math.min(8, Math.floor(safeWidth / 24))) }, (_, index) =>
              React.createElement(Line, {
                key: `${clip.id}-effect-stripe-${index}`,
                p1: { x: safeX + index * 24, y: contentY + height - 6 },
                p2: { x: safeX + index * 24 + 18, y: contentY + 8 },
                color: 'rgba(88,28,135,0.26)',
                strokeWidth: 2,
              }),
            )
          : null,
        clip.visualStatus && clip.visualStatus !== 'ready'
          ? React.createElement(Rect, {
              key: `${clip.id}-status-fill`,
              x: safeX,
              y: contentY,
              width: safeWidth,
              height,
              color: clip.visualStatus === 'loading'
                ? 'rgba(255,255,255,0.16)'
                : clip.visualStatus === 'error'
                  ? 'rgba(220,38,38,0.16)'
                  : 'rgba(255,255,255,0.10)',
            })
          : null,
        React.createElement(Circle, {
          key: `${clip.id}-status-dot`,
          cx: safeX + safeWidth - 10,
          cy: contentY + 11,
          r: 3,
          color: visualStatusColor(clip.visualStatus),
        }),
        selected
          ? React.createElement(RoundedRect, {
              key: `${clip.id}-selection`,
              x: safeX - 2,
              y: y + 3,
              width: safeWidth + 4,
              height: height + 4,
              r: CLIP_BORDER_RADIUS + 2,
              color: 'rgba(79,70,229,0.22)',
            })
          : null,
        selected
          ? React.createElement(RoundedRect, {
              key: `${clip.id}-trim-left`,
              x: safeX + 3,
              y: y + 10,
              width: Math.min(TRIM_HANDLE_WIDTH / 2, safeWidth / 4),
              height: height - 10,
              r: 4,
              color: 'rgba(17,24,39,0.44)',
            })
          : null,
        selected
          ? React.createElement(RoundedRect, {
              key: `${clip.id}-trim-right`,
              x: safeX + safeWidth - Math.min(TRIM_HANDLE_WIDTH / 2, safeWidth / 4) - 3,
              y: y + 10,
              width: Math.min(TRIM_HANDLE_WIDTH / 2, safeWidth / 4),
              height: height - 10,
              r: 4,
              color: 'rgba(17,24,39,0.44)',
            })
          : null,
        track.isLocked
          ? React.createElement(Line, {
              key: `${clip.id}-locked-line`,
              p1: { x: safeX + 8, y: y + height - 2 },
              p2: { x: safeX + safeWidth - 8, y: y + height - 2 },
              color: 'rgba(17,24,39,0.28)',
              strokeWidth: 2,
            })
          : null,
        React.createElement(SkiaText, {
          key: `${clip.id}-type`,
          x: safeX + 10,
          y: y + 18,
          text: clipLabelPrefix(clip.type),
          font,
          color: EditorColors.textSecondary,
        }),
        React.createElement(SkiaText, {
          key: `${clip.id}-label`,
          x: safeX + 10,
          y: y + 34,
          text: clip.type === 'text' && clip.textContent ? clip.textContent : clip.name,
          font,
          color: EditorColors.textPrimary,
        }),
        safeWidth > 120 && clip.type === 'audio'
          ? React.createElement(SkiaText, {
              key: `${clip.id}-volume`,
              x: safeX + safeWidth - 48,
              y: y + height - 6,
              text: `${Math.round((clip.volume ?? 1) * 100)}%`,
              font,
              color: EditorColors.textSecondary,
            })
          : null,
      ]
    })
    .filter(Boolean)
}
