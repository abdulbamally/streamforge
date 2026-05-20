// ============================================================
//  Modal — Centered overlay dialog
//  Usage:
//    <Modal
//      visible={showDelete}
//      title="Delete Project?"
//      message="This cannot be undone."
//      onClose={() => setShowDelete(false)}
//      actions={[
//        { label: 'Cancel',  onPress: () => setShowDelete(false), variant: 'secondary' },
//        { label: 'Delete',  onPress: handleDelete,               variant: 'danger'    },
//      ]}
//    />
// ============================================================

import React from 'react'
import {
  View,
  Text,
  Modal as RNModal,
  TouchableWithoutFeedback,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme/tokens'
import { Button } from './Button'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ModalAction {
  label:    string
  onPress:  () => void
  variant?: ButtonVariant
  loading?: boolean
}

interface ModalProps {
  visible:          boolean
  title:            string
  message?:         string
  children?:        React.ReactNode
  actions?:         ModalAction[]
  onClose?:         () => void
  closeOnBackdrop?: boolean
  style?:           StyleProp<ViewStyle>
}

export function Modal({
  visible,
  title,
  message,
  children,
  actions,
  onClose,
  closeOnBackdrop = true,
  style,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Dialog */}
      <View style={styles.centeredView}>
        <View style={[styles.dialog, style]}>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Custom content */}
          {children}

          {/* Action buttons */}
          {actions && actions.length > 0 && (
            <View style={[
              styles.actions,
              actions.length > 2 && styles.actionsColumn,
            ]}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  label={action.label}
                  onPress={action.onPress}
                  variant={action.variant ?? 'secondary'}
                  loading={action.loading}
                  style={styles.actionBtn}
                  fullWidth={actions.length > 2}
                />
              ))}
            </View>
          )}

        </View>
      </View>
    </RNModal>
  )
}

// ── Confirm Modal shorthand ────────────────────────────────────
interface ConfirmModalProps {
  visible:       boolean
  title:         string
  message?:      string
  confirmLabel?: string
  cancelLabel?:  string
  onConfirm:     () => void
  onCancel:      () => void
  destructive?:  boolean
  loading?:      boolean
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  loading     = false,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      title={title}
      message={message}
      onClose={onCancel}
      actions={[
        { label: cancelLabel,  onPress: onCancel,  variant: 'secondary' },
        { label: confirmLabel, onPress: onConfirm, variant: destructive ? 'danger' : 'primary', loading },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  centeredView: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  dialog: {
    width:           '100%',
    backgroundColor: Colors.bgElevated,
    borderRadius:    Radius.xl,
    padding:         Spacing.xl,
    borderWidth:     1,
    borderColor:     Colors.border,
    gap:             Spacing.md,
    ...Shadows.lg,
  },
  title: {
    fontSize:   Typography.lg,
    fontFamily: Typography.fontBold,
    color:      Colors.textPrimary,
  },
  message: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
    lineHeight: Typography.base * 1.5,
  },
  actions: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    gap:            Spacing.sm,
    marginTop:      Spacing.xs,
  },
  actionsColumn: {
    flexDirection: 'column',
  },
  actionBtn: {
    flex: 1,
  },
})
