// ============================================================
//  RegisterScreen — Full registration form
// ============================================================

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller }   from 'react-hook-form'
import { ArrowLeft, Mail, User, Lock, AtSign } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'
import { Input }  from '@shared/components/Input'
import { useRegister } from '../hooks/useRegister'
import type { RegisterScreenProps } from '@app/navigation/types'

// ─── Password strength indicator ─────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ]

  const strength = checks.filter(c => c.met).length
  const color    = strength === 0 ? Colors.border
    : strength === 1 ? Colors.error
    : strength === 2 ? Colors.warning
    : Colors.success

  if (!password) return null

  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bars}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[strengthStyles.bar, { backgroundColor: i < strength ? color : Colors.border }]}
          />
        ))}
      </View>
      <View style={strengthStyles.checks}>
        {checks.map(({ label, met }) => (
          <Text key={label} style={[strengthStyles.check, met && strengthStyles.checkMet]}>
            {met ? '✓' : '○'} {label}
          </Text>
        ))}
      </View>
    </View>
  )
}

const strengthStyles = StyleSheet.create({
  container: { gap: Spacing.xs },
  bars: { flexDirection: 'row', gap: Spacing.xs },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  checks: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  check: { fontSize: 11, fontFamily: Typography.fontRegular, color: Colors.textTertiary },
  checkMet: { color: Colors.success },
})

// ─── Main Screen ──────────────────────────────────────────────
export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { form, onSubmit, isLoading, errors } = useRegister()
  const passwordValue = form.watch('password')

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

          {/* Back */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={IconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start streaming and editing for free</Text>
          </View>

          {/* Plan badge */}
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>✓  Free plan — No credit card required</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Display Name */}
            <Controller
              control={form.control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Display Name"
                  placeholder="How you appear to others"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.displayName?.message}
                  returnKeyType="next"
                  leftIcon={<User size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />

            {/* Username */}
            <Controller
              control={form.control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Username"
                  placeholder="your_unique_handle"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.username?.message}
                  hint="Letters, numbers and underscores only"
                  autoCapitalize="none"
                  returnKeyType="next"
                  leftIcon={<AtSign size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />

            {/* Email */}
            <Controller
              control={form.control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  leftIcon={<Mail size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />

            {/* Password */}
            <View style={styles.passwordGroup}>
              <Controller
                control={form.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
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
              <PasswordStrength password={passwordValue ?? ''} />
            </View>

            {/* Confirm Password */}
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
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

          {/* Submit */}
          <Button
            label="Create Account"
            onPress={onSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

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
  },
  backBtn: {
    marginTop:    Spacing.sm,
    marginBottom: Spacing.lg,
    alignSelf:    'flex-start',
    padding:      Spacing.xs,
  },
  heading: {
    gap:          Spacing.xs,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize:      Typography.xxxl,
    fontFamily:    Typography.fontBold,
    color:         Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
  },
  subtitle: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  planBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     'rgba(34,197,94,0.3)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom:    Spacing.xl,
  },
  planBadgeText: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontMedium,
    color:      Colors.success,
  },
  form: {
    gap:          Spacing.lg,
    marginBottom: Spacing.xl,
  },
  passwordGroup: {
    gap: Spacing.sm,
  },
  submitBtn: {
    marginBottom: Spacing.lg,
  },
  loginRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   Spacing.lg,
  },
  loginText: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  loginLink: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.brand,
  },
  terms: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontRegular,
    color:      Colors.textTertiary,
    textAlign:  'center',
    lineHeight: Typography.xs * 1.6,
    paddingHorizontal: Spacing.lg,
  },
  termsLink: {
    color: Colors.brand,
  },
})
