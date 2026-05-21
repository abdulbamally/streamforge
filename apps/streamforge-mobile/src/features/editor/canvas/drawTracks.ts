import React from 'react'
import { Line, Rect } from '@shopify/react-native-skia'
import type { SkFont } from '@shopify/react-native-skia'
import type { TimelineTrack } from '../types/track.types'
import { EditorColors } from '../theme/editorTokens'
import { layoutTracks } from '../engine/timeline/timelineLayout'
import { drawTrackHeader } from './drawTrackHeaders'

export function drawTracks(
  tracks: TimelineTrack[],
  viewportWidth: number,
  font: SkFont | null,
): React.ReactNode[] {
  return layoutTracks(tracks).flatMap(({ track, y, height }) => [
    React.createElement(Rect, {
      key: `${track.id}-bg`,
      x: 0,
      y,
      width: viewportWidth,
      height,
      color: track.isLocked ? '#eef2f7' : track.type === 'video' ? '#f8fafc' : '#fbfcfe',
    }),
    ...drawTrackHeader(track, y, height, font),
    React.createElement(Line, {
      key: `${track.id}-separator`,
      p1: { x: 0, y: y + height },
      p2: { x: viewportWidth, y: y + height },
      color: EditorColors.border,
      strokeWidth: 1,
    }),
  ])
}
