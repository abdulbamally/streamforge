// ============================================================
//  Timeline — Scrollable multi-track timeline with playhead
// ============================================================

import React, { useRef } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native'
import { Colors, Typography, Spacing } from '@shared/theme/tokens'
import { ClipItem }    from './ClipItem'
import { useTimeline } from '../hooks/useTimeline'
import type { Clip }   from '@streamforge/api-contract'

// How many distinct tracks to show (0 = primary, 1-2 = overlays, 3 = audio)
const TRACK_COUNT  = 4
const TRACK_HEIGHT = 64
const RULER_HEIGHT = 24
const TRACK_LABEL_WIDTH = 60

interface TimelineProps {
  onClipPress?: (clip: Clip) => void
}

export function Timeline({ onClipPress }: TimelineProps) {
  const scrollRef = useRef<ScrollView>(null)
  const {
    clips,
    currentTime,
    duration,
    selectedClipId,
    zoom,
    PIXELS_PER_SECOND,
    totalWidth,
    timeToX,
    selectClip,
  } = useTimeline()

  const playheadX = timeToX(currentTime)

  // Group clips by track
  const trackClips = Array.from({ length: TRACK_COUNT }, (_, i) =>
    clips.filter(c => c.trackIndex === i)
  )

  // Generate ruler tick marks every 5 seconds
  const tickInterval = zoom < 0.5 ? 30 : zoom < 1 ? 10 : 5
  const ticks = Array.from(
    { length: Math.ceil(duration / tickInterval) + 1 },
    (_, i) => i * tickInterval
  )

  return (
    <View style={styles.container}>
      {/* Track labels (fixed left column) */}
      <View style={styles.labelsColumn}>
        <View style={styles.rulerLabel} />
        {Array.from({ length: TRACK_COUNT }, (_, i) => (
          <View key={i} style={styles.trackLabel}>
            <Text style={styles.trackLabelText}>
              {i === 0 ? 'Video' : i === TRACK_COUNT - 1 ? 'Audio' : `Ovly ${i}`}
            </Text>
          </View>
        ))}
      </View>

      {/* Scrollable timeline area */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{ width: Math.max(totalWidth + 120, 300) }}
      >
        {/* Time ruler */}
        <View style={[styles.ruler, { width: totalWidth + 120 }]}>
          {ticks.map(tick => (
            <View
              key={tick}
              style={[styles.tick, { left: timeToX(tick) }]}
            >
              <View style={styles.tickLine} />
              <Text style={styles.tickLabel}>{formatTime(tick)}</Text>
            </View>
          ))}
        </View>

        {/* Tracks */}
        {trackClips.map((trackClipList, trackIndex) => (
          <View key={trackIndex} style={styles.track}>
            {trackClipList.map(clip => (
              <View
                key={clip.id}
                style={[styles.clipWrapper, { left: timeToX(clip.startTime) }]}
              >
                <ClipItem
                  clip={clip}
                  isSelected={selectedClipId === clip.id}
                  pixelsPerSecond={PIXELS_PER_SECOND}
                  onPress={() => {
                    selectClip(clip.id)
                    onClipPress?.(clip)
                  }}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Playhead */}
        <View
          pointerEvents="none"
          style={[styles.playhead, { left: playheadX }]}
        >
          <View style={styles.playheadHead} />
          <View style={styles.playheadLine} />
        </View>
      </ScrollView>
    </View>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    backgroundColor: Colors.bg,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
  },
  labelsColumn: {
    width:           TRACK_LABEL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  rulerLabel: {
    height:          RULER_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trackLabel: {
    height:          TRACK_HEIGHT,
    justifyContent:  'center',
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trackLabelText: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontMedium,
    color:      Colors.textTertiary,
  },
  scroll: {
    flex: 1,
  },
  ruler: {
    height:          RULER_HEIGHT,
    backgroundColor: Colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position:        'relative',
  },
  tick: {
    position:  'absolute',
    alignItems: 'center',
  },
  tickLine: {
    width:           1,
    height:          8,
    backgroundColor: Colors.border,
  },
  tickLabel: {
    fontSize:   9,
    fontFamily: Typography.fontRegular,
    color:      Colors.textTertiary,
    marginTop:  2,
  },
  track: {
    height:          TRACK_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position:        'relative',
    paddingVertical: Spacing.xxs,
  },
  clipWrapper: {
    position:  'absolute',
    top:       Spacing.xxs,
    bottom:    Spacing.xxs,
  },
  playhead: {
    position:  'absolute',
    top:       0,
    bottom:    0,
    width:     2,
    alignItems: 'center',
    zIndex:    10,
  },
  playheadHead: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: Colors.brand,
    marginTop:       RULER_HEIGHT - 5,
  },
  playheadLine: {
    flex:            1,
    width:           2,
    backgroundColor: Colors.brand,
    opacity:         0.8,
  },
})
