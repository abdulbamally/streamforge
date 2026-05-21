import React, { useMemo } from 'react'
import { Canvas, Line, Rect, RoundedRect } from '@shopify/react-native-skia'
import type { TimelineClip } from '../engine/types'
import { layoutClips } from '../engine/timelineEngine'
import { EditorColors } from '../theme/editorTokens'

type EditorTimelineCanvasProps = {
  clips: TimelineClip[]
  width: number
  height: number
  pixelsPerSecond: number
  currentTime: number
}

const RULER_HEIGHT = 30
const TRACK_TOP = 42
const TRACK_HEIGHT = 56

export function EditorTimelineCanvas({
  clips,
  width,
  height,
  pixelsPerSecond,
  currentTime,
}: EditorTimelineCanvasProps) {
  const mainTrackClips = useMemo(
    () => clips.filter((clip) => clip.trackIndex === 0),
    [clips],
  )
  const layouts = useMemo(
    () => layoutClips(mainTrackClips, pixelsPerSecond),
    [mainTrackClips, pixelsPerSecond],
  )
  const playheadX = Math.max(16, Math.min(currentTime * pixelsPerSecond + 16, width - 16))

  return (
    <Canvas style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height} color={EditorColors.surfaceSoft} />
      <Rect x={0} y={0} width={width} height={RULER_HEIGHT} color={EditorColors.surface} />
      {Array.from({ length: 7 }, (_, index) => {
        const x = 16 + index * Math.max(1, (width - 32) / 6)
        return (
          <Line
            key={`ruler-${index}`}
            p1={{ x, y: 10 }}
            p2={{ x, y: RULER_HEIGHT }}
            strokeWidth={index % 2 === 0 ? 1.4 : 1}
            color={index % 2 === 0 ? EditorColors.borderStrong : EditorColors.border}
          />
        )
      })}
      <RoundedRect
        x={16}
        y={TRACK_TOP}
        width={width - 32}
        height={TRACK_HEIGHT}
        r={14}
        color={EditorColors.white}
      />
      <Line
        p1={{ x: 16, y: TRACK_TOP + TRACK_HEIGHT + 20 }}
        p2={{ x: width - 16, y: TRACK_TOP + TRACK_HEIGHT + 20 }}
        strokeWidth={1}
        color={EditorColors.border}
      />
      {layouts.length === 0 ? (
        <RoundedRect
          x={28}
          y={TRACK_TOP + 10}
          width={Math.max(80, width - 56)}
          height={TRACK_HEIGHT - 20}
          r={10}
          color={EditorColors.surfaceSoft}
        />
      ) : null}
      {layouts.map(({ clip, left, width: clipWidth }, index) => {
        const x = 28 + left
        const safeWidth = Math.min(Math.max(clipWidth, 44), width - x - 28)
        const selected = index === 0
        return (
          <RoundedRect
            key={clip.id}
            x={x}
            y={TRACK_TOP + 10}
            width={safeWidth}
            height={TRACK_HEIGHT - 20}
            r={10}
            color={selected ? EditorColors.accentMuted : EditorColors.clipVideo}
          />
        )
      })}
      <Line
        p1={{ x: playheadX, y: 4 }}
        p2={{ x: playheadX, y: height - 14 }}
        strokeWidth={2}
        color={EditorColors.accent}
      />
      <RoundedRect x={playheadX - 6} y={2} width={12} height={12} r={6} color={EditorColors.accent} />
    </Canvas>
  )
}
