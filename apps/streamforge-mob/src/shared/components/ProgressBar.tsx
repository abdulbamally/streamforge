// ============================================================
//  ProgressBar — Linear progress indicator
//  Usage:
//    <ProgressBar progress={0.75} />
//    <ProgressBar progress={export.progress / 100} label="Exporting..." showPercent />
// ============================================================

import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Colors, Typography, Spacing } from '../theme/tokens'

interface ProgressBarProps {
  progress:     number          // 0 to 1
  label?:       string
  showPercent?: boolean
  color?:       string
  height?:      number
  animated?:    boolean
  style?:       StyleProp<ViewStyle>
}

export function ProgressBar({
  progress,
  label,
  showPercent = false,
  color       = Colors.brand,
  height      = 6,
  animated    = true,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const widthAnim       = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue:         clampedProgress,
        duration:        300,
        useNativeDriver: false,
      }).start()
    } else {
      widthAnim.setValue(clampedProgress)
    }
  }, [clampedProgress, animated, widthAnim])

  const percent = Math.round(clampedProgress * 100)

  return (
    <View style={[styles.container, style]}>

      {/* Label row */}
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && (
            <Text style={styles.percent}>{percent}%</Text>
          )}
        </View>
      )}

      {/* Track */}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange:  [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

    </View>
  )
}

// ── Circular variant for compact use ─────────────────────────
interface CircularProgressProps {
  progress: number   // 0 to 1
  size?:    number
  color?:   string
  label?:   string
}

export function CircularProgress({
  progress,
  size  = 48,
  color = Colors.brand,
  label,
}: CircularProgressProps) {
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100)

  return (
    <View style={[circStyles.container, { width: size, height: size, borderColor: color }]}>
      <Text style={[circStyles.percent, { fontSize: size * 0.22 }]}>
        {label ?? `${percent}%`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  label: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontMedium,
    color:      Colors.textSecondary,
  },
  percent: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },
  track: {
    width:           '100%',
    backgroundColor: Colors.bgSurface,
    overflow:        'hidden',
  },
  fill: {
    position: 'absolute',
    left:     0,
    top:      0,
  },
})

const circStyles = StyleSheet.create({
  container: {
    borderRadius:    999,
    backgroundColor: Colors.bgSurface,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     Colors.brand,
  },
  percent: {
    fontFamily: Typography.fontBold,
    color:      Colors.textPrimary,
  },
})
