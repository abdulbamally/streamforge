// ============================================================
//  Toast — Custom toast config for react-native-toast-message
//
//  Setup in App.tsx (already done):
//    import Toast from 'react-native-toast-message'
//    <Toast config={toastConfig} />
//
//  Usage anywhere via useToast hook:
//    const toast = useToast()
//    toast.success('Stream started!')
//    toast.error('Connection failed')
//    toast.info('Buffering...')
// ============================================================

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import {
  CheckCircle,
  XCircle,
  Info,
  X,
} from 'lucide-react-native'
import type { ToastConfig } from 'react-native-toast-message'
import { Colors, Typography, Spacing, Radius, Shadows, IconSize } from '../theme/tokens'

// ─── Toast item types ─────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info'

interface ToastItemProps {
  type:     ToastType
  text1?:   string
  text2?:   string
  onPress?: () => void
  hide?:    () => void
}

const TOAST_STYLES: Record<ToastType, { color: string; Icon: React.FC<any> }> = {
  success: { color: Colors.success, Icon: CheckCircle },
  error:   { color: Colors.error,   Icon: XCircle     },
  info:    { color: Colors.info,    Icon: Info         },
}

function ToastItem({ type, text1, text2, hide }: ToastItemProps) {
  const { color, Icon } = TOAST_STYLES[type]

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Icon size={IconSize.md} color={color} />
      </View>

      {/* Text */}
      <View style={styles.textWrapper}>
        {text1 && (
          <Text style={styles.title} numberOfLines={1}>{text1}</Text>
        )}
        {text2 && (
          <Text style={styles.message} numberOfLines={2}>{text2}</Text>
        )}
      </View>

      {/* Close button */}
      <TouchableOpacity
        onPress={hide}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.closeBtn}
      >
        <X size={14} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  )
}

// ─── Toast config — pass this to <Toast config={toastConfig} /> ─
export const toastConfig: ToastConfig = {
  success: ({ text1, text2, hide }) => (
    <ToastItem type="success" text1={text1} text2={text2} hide={hide} />
  ),
  error: ({ text1, text2, hide }) => (
    <ToastItem type="error" text1={text1} text2={text2} hide={hide} />
  ),
  info: ({ text1, text2, hide }) => (
    <ToastItem type="info" text1={text1} text2={text2} hide={hide} />
  ),
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.bgElevated,
    borderRadius:      Radius.md,
    borderWidth:       1,
    borderColor:       Colors.border,
    borderLeftWidth:   4,
    paddingVertical:   Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal:  Spacing.md,
    gap:               Spacing.sm,
    ...Shadows.md,
  },
  iconWrapper: {
    width:           32,
    height:          32,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  textWrapper: {
    flex: 1,
    gap:  2,
  },
  title: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },
  message: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
    lineHeight: Typography.xs * 1.5,
  },
  closeBtn: {
    padding:  Spacing.xxs,
    flexShrink: 0,
  },
})
