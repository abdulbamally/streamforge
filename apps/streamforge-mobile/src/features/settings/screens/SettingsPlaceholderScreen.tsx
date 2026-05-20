import React from 'react'
import { Text, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@shared/components'
import { Header } from '@shared/components/Header'
import { Colors, Typography } from '@shared/theme/tokens'
import type { SettingsStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<SettingsStackParamList, keyof SettingsStackParamList>

const TITLES: Partial<Record<keyof SettingsStackParamList, string>> = {
  Multistream: 'Multistream',
  Themes: 'Themes',
  DisconnectProtection: 'Disconnect Protection',
  StreamShift: 'Stream Shift',
  Alerts: 'Alerts',
  ChatSettings: 'Chat Settings',
}

export function SettingsPlaceholderScreen({ route, navigation }: Props) {
  const title = TITLES[route.name as keyof typeof TITLES] ?? route.name

  return (
    <Screen padded>
      <Header title={title} onBack={() => navigation.goBack()} />
      <Text style={styles.body}>Coming soon.</Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 16,
  },
})
