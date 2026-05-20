import React from 'react'
import { Text, StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Typography, Radius, Spacing } from '@shared/theme/tokens'

export function UltraBadge() {
  return (
    <LinearGradient
      colors={['#22c55e', '#eab308', '#f97316']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badge}
    >
      <Text style={styles.text}>Ultra</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: 10,
    fontFamily: Typography.fontBold,
    color: '#000',
  },
})
