// ============================================================
//  Header — Screen top bar
//  Usage:
//    <Header title="Settings" onBack={() => navigation.goBack()} />
//    <Header title="Studio" rightAction={<Button label="Live" />} />
// ============================================================

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { Colors, Typography, Spacing, IconSize } from '../theme/tokens'

interface HeaderProps {
  title:        string
  subtitle?:    string
  onBack?:      () => void
  rightAction?: React.ReactNode
  style?:       StyleProp<ViewStyle>
  transparent?: boolean
}

export function Header({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
  transparent = false,
}: HeaderProps) {
  return (
    <View style={[
      styles.container,
      transparent && styles.transparent,
      style,
    ]}>

      {/* Left — back button or spacer */}
      <View style={styles.side}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={IconSize.md} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Center — title */}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Right — action or spacer */}
      <View style={[styles.side, styles.rightSide]}>
        {rightAction ?? <View style={styles.placeholder} />}
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:    'row',
    alignItems:       'center',
    height:           56,
    paddingHorizontal: Spacing.md,
    backgroundColor:  Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transparent: {
    backgroundColor:   'transparent',
    borderBottomWidth: 0,
  },
  side: {
    width:          44,
    alignItems:     'flex-start',
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  center: {
    flex:       1,
    alignItems: 'center',
    gap:        2,
  },
  backBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: Colors.white10,
    alignItems:      'center',
    justifyContent:  'center',
  },
  placeholder: {
    width: 36,
  },
  title: {
    fontSize:      Typography.md,
    fontFamily:    Typography.fontSemiBold,
    color:         Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
  },
  subtitle: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
})
