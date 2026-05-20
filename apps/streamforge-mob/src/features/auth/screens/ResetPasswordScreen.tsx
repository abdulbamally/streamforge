// ============================================================
//  ResetPasswordScreen — Set new password via email token
// ============================================================

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, CheckCircle } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'
import { Input }  from '@shared/components/Input'
import { authApi } from '@streamforge/api-contract'
import { useToast } from '@core/hooks/useToast'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OnboardingStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ResetPassword'>

const schema = z.object({
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { token }    = route.params
  const toast        = useToast()
  const [done, setDone] = useState(false)

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ password, confirmPassword }) => {
    try {
      await authApi.resetPassword({ token, password, confirmPassword })
      setDone(true)
    } catch (err: any) {
      toast.error(err.message ?? 'Reset failed. The link may have expired.')
    }
  })

  // ── Success state ──────────────────────────────────────────
  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Password updated!</Text>
          <Text style={styles.successBody}>
            Your password has been reset successfully. All existing sessions have been signed out.
          </Text>
          <Button
            label="Log In with New Password"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            size="lg"
          />
        </View>
      </SafeAreaView>
    )
  }

  // ── Form ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Lock size={48} color={Colors.brand} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Choose a strong password for your StreamForge account
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="New Password"
                  placeholder="Create a strong password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword
                  returnKeyType="next"
                  leftIcon={<Lock size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm New Password"
                  placeholder="Repeat your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  isPassword
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  leftIcon={<Lock size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />
          </View>

          <Button
            label="Reset Password"
            onPress={onSubmit}
            loading={isSubmitting}
            fullWidth
            size="lg"
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: Spacing.lg,
    paddingBottom:     Spacing['3xl'],
    paddingTop:        Spacing.xxl,
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
    gap:          Spacing.lg,
    marginBottom: Spacing.xl,
  },
  // Success
  successContainer: {
    flex:              1,
    paddingHorizontal: Spacing.lg,
    alignItems:        'center',
    justifyContent:    'center',
    gap:               Spacing.md,
  },
  successIcon: {
    width:           88,
    height:          88,
    borderRadius:    Radius.xl,
    backgroundColor: 'rgba(34,197,94,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing.lg,
    borderWidth:     1,
    borderColor:     'rgba(34,197,94,0.3)',
  },
  successTitle: {
    fontSize:   Typography.xxl,
    fontFamily: Typography.fontBold,
    color:      Colors.textPrimary,
  },
  successBody: {
    fontSize:     Typography.base,
    fontFamily:   Typography.fontRegular,
    color:        Colors.textSecondary,
    textAlign:    'center',
    lineHeight:   Typography.base * 1.6,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
})
