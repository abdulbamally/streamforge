// ============================================================
//  LoginScreen — Full login form
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
import { SafeAreaView }  from 'react-native-safe-area-context'
import { Controller }    from 'react-hook-form'
import { ArrowLeft, Mail, Lock } from 'lucide-react-native'
import { Colors, Typography, Spacing, IconSize } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'
import { Input }  from '@shared/components/Input'
import { useLogin } from '../hooks/useLogin'
import type { LoginScreenProps } from '@app/navigation/types'

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { form, onSubmit, isLoading, errors } = useLogin()

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

          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={IconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Heading */}
          <View style={styles.heading}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your StreamForge account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Identifier */}
            <Controller
              control={form.control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email or Username"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.identifier?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  leftIcon={<Mail size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />

            {/* Password */}
            <Controller
              control={form.control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  leftIcon={<Lock size={IconSize.sm} color={Colors.textTertiary} />}
                />
              )}
            />

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

          </View>

          {/* Submit */}
          <Button
            label="Log In"
            onPress={onSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign up free</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: Colors.bg,
  },
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
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize:   Typography.xxxl,
    fontFamily: Typography.fontBold,
    color:      Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
  },
  subtitle: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  form: {
    gap:          Spacing.lg,
    marginBottom: Spacing.xl,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontMedium,
    color:      Colors.brand,
  },
  submitBtn: {
    marginBottom: Spacing.xl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
    marginBottom:  Spacing.xl,
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontRegular,
    color:      Colors.textTertiary,
  },
  registerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
  },
  registerText: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  registerLink: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.brand,
  },
})
