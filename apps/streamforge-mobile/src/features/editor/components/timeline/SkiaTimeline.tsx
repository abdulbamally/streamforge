// ============================================================
//  Skia Timeline — performant ruler, clips, playhead
// ============================================================

import React, { useMemo, useCallback } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Canvas, Rect, Line } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated'
import { Colors, Typography } from '@shared/theme/tokens'
import { useTimeline } from '../../hooks/useTimeline'
import { useEditorStore } from '../../store/editorStore'
import { layoutClips } from '../../engine/timelineEngine'
import { SplitAtPlayheadCommand } from '../../engine/commands'
import type { TimelineClip } from '../../engine/types'

const TRACK_HEIGHT = 72
const RULER_HEIGHT = 28
const HANDLE_WIDTH = 10

export function SkiaTimeline() {
  const {
    clips,
    currentTime,
    duration,
    selectedClipId,
    PIXELS_PER_SECOND,
    totalWidth,
    seekTo,
    selectClip,
  } = useTimeline()

  const scrollX = useSharedValue(0)
  const screenW = Dimensions.get('window').width

  const contentWidth = Math.max(totalWidth + 80, screenW)
  const playheadX = currentTime * PIXELS_PER_SECOND

  const layouts = useMemo(
    () => layoutClips(clips.filter((c) => c.trackIndex === 0), PIXELS_PER_SECOND),
    [clips, PIXELS_PER_SECOND],
  )

  const scrub = Gesture.Pan()
    .onUpdate((e) => {
      const x = e.x + scrollX.value
      const t = Math.max(0, Math.min(x / PIXELS_PER_SECOND, duration || 0))
      runOnJS(seekTo)(t)
    })

  const tap = Gesture.Tap().onEnd((e) => {
    const x = e.x + scrollX.value
    const t = x / PIXELS_PER_SECOND
    runOnJS(seekTo)(t)
  })

  const onSelectClip = useCallback(
    (clip: TimelineClip) => selectClip(clip.id),
    [selectClip],
  )

  const ticks = useMemo(() => {
    const interval = PIXELS_PER_SECOND < 30 ? 10 : 5
    const count = Math.ceil((duration || 1) / interval) + 1
    return Array.from({ length: count }, (_, i) => i * interval)
  }, [duration, PIXELS_PER_SECOND])

  return (
    <View style={styles.root}>
      <GestureDetector gesture={Gesture.Race(scrub, tap)}>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: contentWidth, height: RULER_HEIGHT + TRACK_HEIGHT }}
          onScroll={(e) => {
            scrollX.value = e.nativeEvent.contentOffset.x
          }}
          scrollEventThrottle={16}
        >
          <Canvas style={{ width: contentWidth, height: RULER_HEIGHT + TRACK_HEIGHT }}>
            {/* Ruler background */}
            <Rect
              x={0}
              y={0}
              width={contentWidth}
              height={RULER_HEIGHT}
              color={Colors.bgElevated}
            />
            {ticks.map((tick) => {
              const x = tick * PIXELS_PER_SECOND
              const m = Math.floor(tick / 60)
              const s = Math.floor(tick % 60)
              const label = `${m}:${String(s).padStart(2, '0')}`
              return (
                <React.Fragment key={tick}>
                  <Line
                    p1={{ x, y: RULER_HEIGHT - 8 }}
                    p2={{ x, y: RULER_HEIGHT }}
                    color={Colors.border}
                    strokeWidth={1}
                  />
                </React.Fragment>
              )
            })}

            {/* Track */}
            <Rect
              x={0}
              y={RULER_HEIGHT}
              width={contentWidth}
              height={TRACK_HEIGHT}
              color={Colors.bg}
            />

            {layouts.map(({ clip, left, width }) => {
              const selected = clip.id === selectedClipId
              return (
                <React.Fragment key={clip.id}>
                  <Rect
                    x={left}
                    y={RULER_HEIGHT + 8}
                    width={width}
                    height={TRACK_HEIGHT - 16}
                    color={selected ? Colors.brand : Colors.bgSurface}
                  />
                  {selected ? (
                    <>
                      <Rect
                        x={left}
                        y={RULER_HEIGHT + 8}
                        width={HANDLE_WIDTH}
                        height={TRACK_HEIGHT - 16}
                        color={Colors.brandLight}
                      />
                      <Rect
                        x={left + width - HANDLE_WIDTH}
                        y={RULER_HEIGHT + 8}
                        width={HANDLE_WIDTH}
                        height={TRACK_HEIGHT - 16}
                        color={Colors.brandLight}
                      />
                    </>
                  ) : null}
                </React.Fragment>
              )
            })}

            {/* Playhead */}
            <Line
              p1={{ x: playheadX, y: 0 }}
              p2={{ x: playheadX, y: RULER_HEIGHT + TRACK_HEIGHT }}
              color={Colors.brand}
              strokeWidth={2}
            />
          </Canvas>

          {/* Touch targets for clips */}
          {layouts.map(({ clip, left, width }) => (
            <View
              key={`touch_${clip.id}`}
              style={[
                styles.clipTouch,
                {
                  left,
                  top: RULER_HEIGHT + 8,
                  width,
                  height: TRACK_HEIGHT - 16,
                },
              ]}
              onTouchEnd={() => onSelectClip(clip)}
            />
          ))}
        </Animated.ScrollView>
      </GestureDetector>
    </View>
  )
}

// Export split handler for toolbar wiring
export function useTimelineSplit() {
  const { currentTime, selectedClipId } = useTimeline()
  const runCommand = useEditorStore((s) => s.runCommand)
  return useCallback(() => {
    if (!selectedClipId) return
    runCommand(new SplitAtPlayheadCommand(selectedClipId, currentTime))
  }, [selectedClipId, currentTime, runCommand])
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clipTouch: {
    position: 'absolute',
  },
})
