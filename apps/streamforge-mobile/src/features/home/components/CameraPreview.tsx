// ============================================================
//  Camera Preview — Vision Camera wrapper
// ============================================================

import React, { useEffect } from 'react'
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraPosition,
} from 'react-native-vision-camera'
import { Colors, Spacing, Typography } from '@shared/theme/tokens'
import { Button } from '@shared/components/Button'

interface CameraPreviewProps {
  position: CameraPosition
  isMuted?: boolean
}

export function CameraPreview({ position, isMuted = false }: CameraPreviewProps) {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice(position)

  useEffect(() => {
    if (!hasPermission) {
      requestPermission()
    }
  }, [hasPermission, requestPermission])

  if (!hasPermission) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Camera access needed</Text>
        <Text style={styles.fallbackBody}>
          StreamForge needs your camera to show the live preview.
        </Text>
        <Button label="Allow camera" onPress={requestPermission} />
      </View>
    )
  }

  if (!device) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator color={Colors.brand} />
        <Text style={styles.fallbackBody}>Starting camera...</Text>
      </View>
    )
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive
      video
      audio={!isMuted}
    />
  )
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  fallbackTitle: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  fallbackBody: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
})
