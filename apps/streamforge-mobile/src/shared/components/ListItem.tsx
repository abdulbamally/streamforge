// ============================================================
//  ListItem — Reusable tappable row
//  Usage:
//    <ListItem
//      icon={<Settings size={20} color={Colors.brand} />}
//      label="Settings"
//      onPress={() => navigation.navigate('Settings')}
//    />
//    <ListItem
//      icon={<Youtube size={20} color="#FF0000" />}
//      label="YouTube"
//      sublabel="Connected"
//      rightElement={<Badge label="LIVE" variant="live" />}
//      onPress={handlePress}
//    />
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
import { ChevronRight } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '../theme/tokens'

interface ListItemProps {
  label:         string
  sublabel?:     string
  icon?:         React.ReactNode
  rightElement?: React.ReactNode
  showChevron?:  boolean
  onPress?:      () => void
  onLongPress?:  () => void
  disabled?:     boolean
  destructive?:  boolean
  style?:        StyleProp<ViewStyle>
}

export function ListItem({
  label,
  sublabel,
  icon,
  rightElement,
  showChevron = true,
  onPress,
  onLongPress,
  disabled    = false,
  destructive = false,
  style,
}: ListItemProps) {
  const labelColor = destructive
    ? Colors.error
    : disabled
      ? Colors.textDisabled
      : Colors.textPrimary

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      {/* Left icon */}
      {icon && (
        <View style={styles.iconWrapper}>
          {icon}
        </View>
      )}

      {/* Text */}
      <View style={styles.textWrapper}>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        {sublabel && (
          <Text style={styles.sublabel} numberOfLines={1}>{sublabel}</Text>
        )}
      </View>

      {/* Right element or chevron */}
      <View style={styles.right}>
        {rightElement}
        {showChevron && onPress && (
          <ChevronRight
            size={IconSize.sm}
            color={Colors.textTertiary}
            style={rightElement ? styles.chevronWithElement : undefined}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}

// ─── ListSection — groups ListItems with a heading ────────────
interface ListSectionProps {
  title?:    string
  children:  React.ReactNode
  style?:    StyleProp<ViewStyle>
}

export function ListSection({ title, children, style }: ListSectionProps) {
  return (
    <View style={[sectionStyles.container, style]}>
      {title && (
        <Text style={sectionStyles.title}>{title.toUpperCase()}</Text>
      )}
      <View style={sectionStyles.group}>
        {children}
      </View>
    </View>
  )
}

// ─── ListSeparator — thin line between items ──────────────────
export function ListSeparator() {
  return <View style={separatorStyles.line} />
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor:   Colors.bgElevated,
    gap:               Spacing.md,
    minHeight:         52,
  },
  disabled: {
    opacity: 0.4,
  },
  iconWrapper: {
    width:           36,
    height:          36,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.bgSurface,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  textWrapper: {
    flex: 1,
    gap:  2,
  },
  label: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontMedium,
    color:      Colors.textPrimary,
  },
  sublabel: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
    flexShrink:    0,
  },
  chevronWithElement: {
    marginLeft: Spacing.xs,
  },
})

const sectionStyles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  title: {
    fontSize:          Typography.xs,
    fontFamily:        Typography.fontSemiBold,
    color:             Colors.textTertiary,
    letterSpacing:     1,
    paddingHorizontal: Spacing.md,
    paddingBottom:     Spacing.xs,
  },
  group: {
    backgroundColor: Colors.bgElevated,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    overflow:        'hidden',
  },
})

const separatorStyles = StyleSheet.create({
  line: {
    height:          1,
    backgroundColor: Colors.border,
    marginLeft:      Spacing.md + 36 + Spacing.md,  // align with text, skip icon
  },
})
