import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

type EditorControlButtonProps = {
  label?: string
  Icon: LucideIcon
  onPress?: () => void
  disabled?: boolean
  active?: boolean
  variant?: 'plain' | 'filled' | 'accent'
  style?: StyleProp<ViewStyle>
}

export function EditorControlButton({
  label,
  Icon,
  onPress,
  disabled = false,
  active = false,
  variant = 'plain',
  style,
}: EditorControlButtonProps) {
  const isAccent = variant === 'accent' || active
  const isFilled = variant === 'filled'

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isFilled && styles.filled,
        isAccent && styles.accent,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon
        size={18}
        color={isAccent ? EditorColors.white : EditorColors.textPrimary}
      />
      {label ? (
        <Text style={[styles.label, isAccent && styles.labelAccent]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    minWidth: 40,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: EditorSpacing.xs,
    paddingHorizontal: EditorSpacing.md,
  },
  filled: {
    backgroundColor: EditorColors.surfaceSoft,
  },
  accent: {
    backgroundColor: EditorColors.accent,
    borderColor: EditorColors.accent,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.38,
  },
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '700',
  },
  labelAccent: {
    color: EditorColors.white,
  },
})
