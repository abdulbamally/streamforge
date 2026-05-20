// ============================================================
//  Streaming Settings Home — Dedicated tab for stream setup
// ============================================================

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Badge, Card, Screen } from '@shared/components'
import { Button } from '@shared/components/Button'
import { Colors, Spacing, Typography } from '@shared/theme/tokens'
import {
  getConfiguredStreamId,
  getConfiguredStreamTitle,
  isStreamConfigured,
} from '../store/streamConfigStore'
import type { StreamingSettingsStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<StreamingSettingsStackParamList, 'StreamingSettingsHome'>

export function StreamingSettingsHomeScreen({ route, navigation }: Props) {
  const fromLiveGate = route.params?.fromLiveGate ?? false
  const configured = isStreamConfigured()
  const streamId = getConfiguredStreamId()
  const streamTitle = getConfiguredStreamTitle()

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Streaming Settings</Text>
      <Text style={styles.subtitle}>
        {fromLiveGate && !configured
          ? 'Complete setup before going live.'
          : 'Configure destinations, scenes, and stream details.'}
      </Text>

      {fromLiveGate && !configured ? (
        <Card style={styles.banner}>
          <Badge label="Setup required" variant="warning" />
          <Text style={styles.bannerText}>
            Add at least one destination to enable the Live button.
          </Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionLabel}>Status</Text>
        <Text style={styles.status}>
          {configured ? 'Ready to go live' : 'Not configured'}
        </Text>
        {streamTitle ? <Text style={styles.meta}>Stream: {streamTitle}</Text> : null}
      </Card>

      <View style={styles.actions}>
        <Button
          label={streamId ? 'Edit stream setup' : 'Create stream'}
          onPress={() =>
            navigation.navigate('StreamSetup', streamId ? { streamId } : {})
          }
          fullWidth
        />
        {streamId ? (
          <>
            <Button
              label="Manage destinations"
              variant="secondary"
              onPress={() => navigation.navigate('Destinations', { streamId })}
              fullWidth
            />
            <Button
              label="Manage scenes"
              variant="secondary"
              onPress={() => navigation.navigate('SceneManager', { streamId })}
              fullWidth
            />
          </>
        ) : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  banner: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  bannerText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  sectionLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  status: {
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
})
