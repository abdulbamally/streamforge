import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View, StyleSheet } from 'react-native'
import { Header } from '@shared/components/Header'
import { EditProfileScreen } from '@features/profile/screens/EditProfileScreen'
import type { SettingsStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<SettingsStackParamList, 'AccountSettings'>

export function AccountSettingsScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Header title="Account Settings" onBack={() => navigation.goBack()} />
      <EditProfileScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
