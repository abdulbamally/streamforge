import React from 'react'
import { Circle, Line, Rect, Text as SkiaText } from '@shopify/react-native-skia'
import type { SkFont } from '@shopify/react-native-skia'
import type { TimelineTrack } from '../types/track.types'
import { EditorColors } from '../theme/editorTokens'
import { TRACK_LABEL_WIDTH } from '../engine/timeline/timelineConstants'

function trackIcon(track: TimelineTrack) {
  if (track.type === 'audio') return 'A'
  if (track.type === 'text') return 'T'
  if (track.type === 'effect') return 'FX'
  return 'V'
}

export function drawTrackHeader(
  track: TimelineTrack,
  y: number,
  height: number,
  font: SkFont | null,
): React.ReactNode[] {
  const label = track.name.replace(' Track ', ' ')
  const controls = [
    { key: 'lock', active: track.isLocked, text: track.isLocked ? 'L' : 'U' },
    { key: 'mute', active: track.isMuted, text: track.type === 'audio' ? 'M' : '-' },
    { key: 'view', active: !track.isVisible, text: track.isVisible ? 'E' : 'H' },
  ]
  const iconColor = track.type === 'audio' ? '#16a34a' : track.type === 'text' ? '#b45309' : track.type === 'effect' ? '#7c3aed' : '#2563eb'

  return [
    React.createElement(Rect, {
      key: `${track.id}-label-bg`,
      x: 0,
      y,
      width: TRACK_LABEL_WIDTH,
      height,
      color: EditorColors.surface,
    }),
    React.createElement(Circle, {
      key: `${track.id}-type-dot`,
      cx: 15,
      cy: y + 16,
      r: 8,
      color: iconColor,
    }),
    React.createElement(SkiaText, {
      key: `${track.id}-type-label`,
      x: 10,
      y: y + 20,
      text: trackIcon(track),
      font,
      color: EditorColors.white,
    }),
    React.createElement(SkiaText, {
      key: `${track.id}-label`,
      x: 28,
      y: y + 20,
      text: label.slice(0, 9),
      font,
      color: EditorColors.textSecondary,
    }),
    ...controls.map((control, index) =>
      React.createElement(SkiaText, {
        key: `${track.id}-${control.key}`,
        x: 10 + index * 22,
        y: y + height - 12,
        text: control.text,
        font,
        color: control.active ? EditorColors.accent : EditorColors.textTertiary,
      }),
    ),
    React.createElement(Line, {
      key: `${track.id}-label-separator`,
      p1: { x: TRACK_LABEL_WIDTH, y },
      p2: { x: TRACK_LABEL_WIDTH, y: y + height },
      color: EditorColors.border,
      strokeWidth: 1,
    }),
  ]
}
