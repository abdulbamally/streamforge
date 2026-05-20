// ============================================================
//  Custom Tab Bar — Library | Streaming Settings | LIVE | Studio | Editor
// ============================================================

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import {
  FolderOpen,
  Settings2,
  Video,
  Film,
  Radio,
} from 'lucide-react-native'
import { handleGoLive } from './goLive'
import { Colors, IconSize, Spacing, Typography, Radius, Shadows } from '@shared/theme/tokens'
import type { MainTabParamList } from './types'

const TAB_CONFIG: Record<
  keyof MainTabParamList,
  { label: string; Icon: typeof FolderOpen }
> = {
  Library: { label: 'Library', Icon: FolderOpen },
  StreamingSettings: { label: 'Stream', Icon: Settings2 },
  Live: { label: 'Live', Icon: Radio },
  Studio: { label: 'Studio', Icon: Video },
  Editor: { label: 'Editor', Icon: Film },
}

const TAB_ORDER: (keyof MainTabParamList)[] = [
  'Library',
  'StreamingSettings',
  'Live',
  'Studio',
  'Editor',
]

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      {TAB_ORDER.map((routeName) => {
        const route = state.routes.find((r) => r.name === routeName)
        if (!route) return null

        const index = state.routes.indexOf(route)
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        if (routeName === 'Live') {
          return (
            <View key="Live" style={styles.liveSlot}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Go live"
                onPress={() => handleGoLive(navigation)}
                style={styles.liveFab}
                activeOpacity={0.9}
              >
                <Radio size={IconSize.lg} color={Colors.bg} />
                <Text style={styles.liveFabLabel}>LIVE</Text>
              </TouchableOpacity>
            </View>
          )
        }

        const config = TAB_CONFIG[routeName]
        const color = isFocused ? Colors.brand : Colors.textTertiary

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={routeName}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <config.Icon color={color} size={IconSize.md} />
            <Text style={[styles.tabLabel, { color }]}>{config.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    minHeight: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  tabLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    marginTop: 2,
  },
  liveSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -20,
  },
  liveFab: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.liveCta,
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    ...Shadows.md,
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  liveFabLabel: {
    fontSize: 9,
    fontFamily: Typography.fontBold,
    color: Colors.bg,
    marginTop: 2,
    letterSpacing: 0.5,
  },
})
