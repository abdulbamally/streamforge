// ============================================================
//  EmptyState — Empty list / zero data placeholder
//  Usage:
//    <EmptyState
//      icon={<FolderOpen size={48} color={Colors.textTertiary} />}
//      title="No projects yet"
//      message="Create your first video project to get started"
//      action={{ label: 'New Project', onPress: () => {} }}
//    />
// ============================================================

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Colors, Typography, Spacing, Radius } from '../theme/tokens'
import { Button } from './Button'

interface EmptyStateAction {
  label:   string
  onPress: () => void
}

interface EmptyStateProps {
  icon?:    React.ReactNode
  title:    string
  message?: string
  action?:  EmptyStateAction
  style?:   StyleProp<ViewStyle>
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>

      {/* Icon wrapper */}
      {icon && (
        <View style={styles.iconWrapper}>
          {icon}
        </View>
      )}

      {/* Text */}
      <Text style={styles.title}>{title}</Text>
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}

      {/* Optional action button */}
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          style={styles.actionBtn}
        />
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: Spacing['5xl'],
    paddingHorizontal: Spacing['3xl'],
    gap:             Spacing.md,
  },
  iconWrapper: {
    width:           80,
    height:          80,
    borderRadius:    Radius.xl,
    backgroundColor: Colors.bgElevated,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Colors.border,
    marginBottom:    Spacing.sm,
  },
  title: {
    fontSize:   Typography.lg,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
    textAlign:  'center',
  },
  message: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
    textAlign:  'center',
    lineHeight: Typography.sm * 1.6,
  },
  actionBtn: {
    marginTop: Spacing.md,
  },
})
