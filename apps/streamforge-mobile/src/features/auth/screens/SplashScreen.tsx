// ============================================================
//  SplashScreen — Animated launch screen
// ============================================================

import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native'
import { Colors, Typography } from '@shared/theme/tokens'

export function SplashScreen() {
  const opacity   = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue:         1,
        duration:        600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue:         0,
        duration:        600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.logo}>StreamForge</Text>
        <Text style={styles.icon}>▶</Text>
        <Text style={styles.tagline}>Stream everywhere. Edit anything.</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.bg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  content: {
    alignItems: 'center',
    gap:        8,
  },
  logo: {
    fontSize:     Typography.xxxl,
    fontFamily:   Typography.fontBold,
    color:        Colors.textPrimary,
    letterSpacing: Typography.trackingTight,
  },
  icon: {
    fontSize:  Typography.xxl,
    color:     Colors.brand,
    marginTop: -8,
  },
  tagline: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textTertiary,
    marginTop:  4,
  },
})
