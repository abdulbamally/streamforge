import React from 'react'
import { Text, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@shared/components'
import { Header } from '@shared/components/Header'
import { Button } from '@shared/components/Button'
import { Colors, Typography } from '@shared/theme/tokens'
import type { SettingsStackParamList } from '@app/navigation/types'
import type { MainShellStackParamList } from '@app/navigation/types'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, 'StreamingSettingsLink'>,
  NativeStackNavigationProp<MainShellStackParamList>
>

type Props = NativeStackScreenProps<SettingsStackParamList, 'StreamingSettingsLink'> & {
  navigation: Nav
}

export function SettingsStreamingLinkScreen({ navigation }: Props) {
  return (
    <Screen padded>
      <Header title="Streaming Settings" onBack={() => navigation.goBack()} />
      <Text style={styles.body}>
        Open the Stream tab in the bottom bar to configure destinations and go live.
      </Text>
      <Button
        label="Open Streaming Settings"
        onPress={() => {
          const shell = navigation.getParent()
          shell?.goBack()
          setTimeout(() => {
            shell?.navigate('Tabs', {
              screen: 'StreamingSettings',
              params: { screen: 'StreamingSettingsHome' },
            })
          }, 100)
        }}
        fullWidth
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  body: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginVertical: 16,
  },
})
