// ============================================================
//  WelcomeScreen — Onboarding entry point
// ============================================================

import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Video, Film, Sparkles } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'
import type { WelcomeScreenProps } from '@app/navigation/types'

const FEATURES = [
  {
    icon:  Video,
    title: 'Stream Everywhere',
    desc:  'Go live to YouTube, Twitch, TikTok and more — all at the same time',
  },
  {
    icon:  Film,
    title: 'Edit Like a Pro',
    desc:  'Full timeline editor with effects, color grading and audio mixing',
  },
  {
    icon:  Sparkles,
    title: 'AI-Powered',
    desc:  'Object detection, live OCR, translation and scene descriptions',
  },
]

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(40)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 700, delay: 200, useNativeDriver: true }),
    ]).start()
  }, [opacity, translateY])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.logo}>StreamForge <Text style={styles.logoAccent}>▶</Text></Text>
        <Text style={styles.tagline}>The all-in-one creator studio</Text>
      </Animated.View>

      {/* Feature cards */}
      <Animated.View style={[styles.features, { opacity, transform: [{ translateY }] }]}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <View key={title} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Icon size={IconSize.md} color={Colors.brand} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* CTAs */}
      <Animated.View style={[styles.actions, { opacity }]}>
        <Button
          label="Get Started — It's Free"
          onPress={() => navigation.navigate('Register')}
          fullWidth
          size="lg"
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flex:       1,
    justifyContent: 'center',
    alignItems: 'center',
    gap:        Spacing.sm,
  },
  logo: {
    fontSize:     Typography.xxxl,
    fontFamily:   Typography.fontBold,
    color:        Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
  },
  logoAccent: {
    color: Colors.brand,
  },
  tagline: {
    fontSize:   Typography.md,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
  },
  features: {
    flex: 1.2,
    gap:  Spacing.md,
    justifyContent: 'center',
  },
  featureCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderRadius:    Radius.lg,
    padding:         Spacing.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  featureIcon: {
    width:           44,
    height:          44,
    borderRadius:    Radius.md,
    backgroundColor: Colors.white10,
    alignItems:      'center',
    justifyContent:  'center',
  },
  featureText: {
    flex: 1,
    gap:  4,
  },
  featureTitle: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },
  featureDesc: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
    lineHeight: Typography.sm * 1.5,
  },
  actions: {
    paddingBottom: Spacing.lg,
    gap:           Spacing.md,
  },
  loginRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
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
  },
})
