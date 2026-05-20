// ============================================================
//  Settings Hub — Modal root (hamburger menu)
// ============================================================

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  X,
  Eye,
  EyeOff,
  Layers,
  UserRound,
  GitBranch,
  Video,
  Wand2,
  Wifi,
  RefreshCw,
  Bell,
  List,
  MessageSquare,
} from 'lucide-react-native'
import { Avatar, ListItem, ListSeparator } from '@shared/components'
import { UltraBadge } from '../components/UltraBadge'
import { Colors, IconSize, Spacing, Typography } from '@shared/theme/tokens'
import { useMe } from '@features/profile/hooks/useProfile'
import type { SettingsStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHub'>

type SettingsRow =
  | {
      kind: 'navigate'
      key: keyof SettingsStackParamList
      label: string
      icon: React.ReactNode
      ultra?: boolean
    }
  | {
      kind: 'tab'
      label: string
      icon: React.ReactNode
      tab: 'Studio' | 'StreamingSettings'
      screen: string
      ultra?: boolean
    }

const SETTINGS_ROWS: SettingsRow[] = [
  {
    kind: 'tab',
    label: 'Scenes',
    icon: <Layers size={IconSize.sm} color={Colors.textPrimary} />,
    tab: 'Studio',
    screen: 'StudioHome',
  },
  { kind: 'navigate', key: 'AccountSettings', label: 'Account Settings', icon: <UserRound size={IconSize.sm} color={Colors.textPrimary} /> },
  { kind: 'navigate', key: 'Multistream', label: 'Multistream', icon: <GitBranch size={IconSize.sm} color={Colors.textPrimary} />, ultra: true },
  { kind: 'navigate', key: 'StreamingSettingsLink', label: 'Streaming Settings', icon: <Video size={IconSize.sm} color={Colors.textPrimary} /> },
  { kind: 'navigate', key: 'Themes', label: 'Themes', icon: <Wand2 size={IconSize.sm} color={Colors.textPrimary} />, ultra: true },
  { kind: 'navigate', key: 'DisconnectProtection', label: 'Disconnect Protection', icon: <Wifi size={IconSize.sm} color={Colors.textPrimary} />, ultra: true },
  { kind: 'navigate', key: 'StreamShift', label: 'Stream Shift', icon: <RefreshCw size={IconSize.sm} color={Colors.textPrimary} />, ultra: true },
  { kind: 'navigate', key: 'Alerts', label: 'Alerts', icon: <Bell size={IconSize.sm} color={Colors.textPrimary} /> },
  {
    kind: 'tab',
    label: 'Events List',
    icon: <List size={IconSize.sm} color={Colors.textPrimary} />,
    tab: 'Studio',
    screen: 'StudioHome',
  },
  { kind: 'navigate', key: 'ChatSettings', label: 'Chat Settings', icon: <MessageSquare size={IconSize.sm} color={Colors.textPrimary} /> },
]

export function SettingsHubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { data: me } = useMe()
  const [idVisible, setIdVisible] = useState(false)

  const maskedId = me?.id ? `****${me.id.slice(-4)}` : '****'

  const openTab = (tab: 'Studio' | 'StreamingSettings', screen: string) => {
    const shell = navigation.getParent()
    shell?.goBack()
    setTimeout(() => {
      shell?.navigate('Tabs', {
        screen: tab,
        params: { screen },
      })
    }, 100)
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.getParent()?.goBack()}
        hitSlop={12}
      >
        <X size={IconSize.lg} color={Colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarRing}>
            <Avatar
              uri={me?.avatarUrl}
              name={me?.displayName ?? me?.username}
              size={72}
            />
          </View>
          <View style={styles.idRow}>
            <Text style={styles.idLabel}>
              StreamForge ID: {idVisible ? me?.id ?? '—' : maskedId}
            </Text>
            <TouchableOpacity onPress={() => setIdVisible((v) => !v)} hitSlop={8}>
              {idVisible ? (
                <EyeOff size={IconSize.sm} color={Colors.settingsAccent} />
              ) : (
                <Eye size={IconSize.sm} color={Colors.settingsAccent} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.list}>
          {SETTINGS_ROWS.map((row, index) => (
            <React.Fragment key={row.kind === 'navigate' ? row.key : row.label}>
              {index > 0 ? <ListSeparator /> : null}
              <ListItem
                label={row.label}
                icon={row.icon}
                rightElement={row.ultra ? <UltraBadge /> : undefined}
                onPress={() => {
                  if (row.kind === 'tab') {
                    openTab(row.tab, row.screen)
                  } else {
                    navigation.navigate(row.key)
                  }
                }}
              />
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.settingsBg,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Spacing.lg,
  },
  scroll: {
    paddingBottom: Spacing['4xl'],
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: Colors.profileRing,
    borderRadius: 999,
    padding: 3,
    marginBottom: Spacing.md,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  idLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.settingsAccent,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: Colors.settingsBorder,
  },
})
