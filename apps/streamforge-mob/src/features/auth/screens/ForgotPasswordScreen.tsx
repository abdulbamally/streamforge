// ============================================================
//  ForgotPasswordScreen — Request password reset
// ============================================================

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'
import { Input }  from '@shared/components/Input'
import { authApi } from '@streamforge/api-contract'
import { useToast }  from '@core/hooks/useToast'
import type { ForgotPasswordScreenProps } from '@app/navigation/types'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})
type FormValues = z.infer<typeof schema>

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const toast         = useToast()
  const [sent, setSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await authApi.forgotPassword({ email })
      setSubmittedEmail(email)
      setSent(true)
    } catch (err: any) {
      // Always show success to prevent email enumeration
      // but show toast if it's clearly a network error
      if (err.status === 0) {
        toast.error('Network error. Check your connection.')
      } else {
        setSubmittedEmail(email)
        setSent(true)
      }
    }
  })

  // ── Success state ──────────────────────────────────────────
  if (sent) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Email sent!</Text>
          <Text style={styles.successBody}>
            If <Text style={styles.bold}>{submittedEmail}</Text> is registered, you'll receive a reset link shortly.
            Check your spam folder if it doesn't arrive.
          </Text>
          <Button
            label="Back to Login"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            style={styles.backToLoginBtn}
          />
          <TouchableOpacity onPress={() => setSent(false)} style={styles.tryAgainBtn}>
            <Text style={styles.tryAgainText}>Didn't get it? Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ── Form state ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>

          {/* Back */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={IconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Mail size={48} color={Colors.brand} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email address"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  leftIcon={<Mail size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />
          </View>

          <Button
            label="Send Reset Link"
            onPress={onSubmit}
            loading={isSubmitting}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>Back to Login</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  flex:      { flex: 1 },
  container: {
    flex:              1,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    alignSelf:    'flex-start',
    marginTop:    Spacing.sm,
    marginBottom: Spacing['3xl'],
    padding:      Spacing.xs,
  },
  iconWrapper: {
    width:           88,
    height:          88,
    borderRadius:    Radius.xl,
    backgroundColor: Colors.white10,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing.xxl,
    alignSelf:       'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  title: {
    fontSize:      Typography.xxl,
    fontFamily:    Typography.fontBold,
    color:         Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
    marginBottom:  Spacing.sm,
  },
  subtitle: {
    fontSize:     Typography.base,
    fontFamily:   Typography.fontRegular,
    color:        Colors.textSecondary,
    lineHeight:   Typography.base * 1.5,
    marginBottom: Spacing.xxl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  cancelBtn: {
    alignItems:  'center',
    marginTop:   Spacing.lg,
    padding:     Spacing.sm,
  },
  cancelText: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontMedium,
    color:      Colors.textSecondary,
  },
  // Success
  successContainer: {
    flex:              1,
    paddingHorizontal: Spacing.lg,
    alignItems:        'center',
    justifyContent:    'center',
  },
  successIcon: {
    width:           88,
    height:          88,
    borderRadius:    Radius.xl,
    backgroundColor: 'rgba(34,197,94,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing.xxl,
    borderWidth:     1,
    borderColor:     'rgba(34,197,94,0.3)',
  },
  successTitle: {
    fontSize:     Typography.xxl,
    fontFamily:   Typography.fontBold,
    color:        Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  successBody: {
    fontSize:     Typography.base,
    fontFamily:   Typography.fontRegular,
    color:        Colors.textSecondary,
    textAlign:    'center',
    lineHeight:   Typography.base * 1.6,
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.md,
  },
  bold: {
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },
  backToLoginBtn: {
    marginBottom: Spacing.md,
  },
  tryAgainBtn: {
    padding: Spacing.sm,
  },
  tryAgainText: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontMedium,
    color:      Colors.brand,
  },
})
