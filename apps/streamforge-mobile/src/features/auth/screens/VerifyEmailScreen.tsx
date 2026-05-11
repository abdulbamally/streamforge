// ============================================================
//  VerifyEmailScreen — Email verification with resend
// ============================================================

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'
import { authApi } from '@streamforge/api-contract'
import { useToast }  from '@core/hooks/useToast'
import type { VerifyEmailScreenProps } from '@app/navigation/types'

const RESEND_COOLDOWN = 60  // seconds

export function VerifyEmailScreen({ route, navigation }: VerifyEmailScreenProps) {
  const { email } = route.params
  const toast     = useToast()

  const [isResending, setIsResending]   = useState(false)
  const [cooldown,    setCooldown]      = useState(0)

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authApi.resendVerification()
      setCooldown(RESEND_COOLDOWN)
      toast.success('Verification email sent!')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to resend. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  // Mask email for display: jo***@example.com
  const maskedEmail = email.replace(/^(.{2}).*(@.*)$/, '$1***$2')

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={IconSize.md} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Mail size={48} color={Colors.brand} />
        </View>

        {/* Content */}
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a verification link to
        </Text>
        <Text style={styles.email}>{maskedEmail}</Text>
        <Text style={styles.instructions}>
          Click the link in the email to verify your account. Check your spam folder if you don't see it.
        </Text>

        {/* Resend */}
        <View style={styles.resendBlock}>
          {cooldown > 0 ? (
            <View style={styles.cooldownRow}>
              <RefreshCw size={IconSize.sm} color={Colors.textTertiary} />
              <Text style={styles.cooldownText}>
                Resend available in {cooldown}s
              </Text>
            </View>
          ) : (
            <Button
              label={isResending ? 'Sending...' : 'Resend verification email'}
              variant="secondary"
              onPress={handleResend}
              loading={isResending}
              fullWidth
            />
          )}
        </View>

        {/* Already verified */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginBtn}
        >
          <Text style={styles.loginText}>
            Already verified? <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex:              1,
    paddingHorizontal: Spacing.lg,
    alignItems:        'center',
  },
  backBtn: {
    alignSelf:    'flex-start',
    marginTop:    Spacing.sm,
    marginBottom: Spacing['4xl'],
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
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  title: {
    fontSize:      Typography.xxl,
    fontFamily:    Typography.fontBold,
    color:         Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
    marginBottom:  Spacing.sm,
    textAlign:     'center',
  },
  subtitle: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
    textAlign:  'center',
  },
  email: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  instructions: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontRegular,
    color:      Colors.textTertiary,
    textAlign:  'center',
    lineHeight: Typography.sm * 1.6,
    marginBottom: Spacing['4xl'],
    paddingHorizontal: Spacing.md,
  },
  resendBlock: {
    width:        '100%',
    marginBottom: Spacing.xl,
  },
  cooldownRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.xs,
    paddingVertical: Spacing.md,
  },
  cooldownText: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontRegular,
    color:      Colors.textTertiary,
  },
  loginBtn: {
    padding: Spacing.sm,
  },
  loginText: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  loginLink: {
    fontFamily: Typography.fontSemiBold,
    color:      Colors.brand,
  },
})
