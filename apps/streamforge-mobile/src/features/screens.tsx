// ============================================================
//  Feature Screen Placeholders
//  These will be fully built out in subsequent phases.
//  They exist now so navigation compiles without errors.
// ============================================================

import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { Colors, Typography, Spacing } from '@shared/theme/tokens'
import { Screen } from '@shared/components/UI'
import { Button } from '@shared/components/Button'

function PlaceholderScreen({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Screen style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Screen>
  )
}

// ─── Studio Screens ───────────────────────────────────────────
export function StudioHomeScreen({ navigation }: any) {
  return (
    <Screen padded>
      <Text style={styles.title}>Studio</Text>
      <Text style={styles.subtitle}>Your streaming dashboard</Text>
      <Button
        label="New Stream"
        onPress={() => navigation.navigate('StreamSetup')}
        style={{ marginTop: Spacing.xxl }}
        fullWidth
      />
    </Screen>
  )
}

export function StreamSetupScreen({ navigation }: any) {
  return (
    <Screen padded>
      <Text style={styles.title}>Stream Setup</Text>
      <Button label="Go Live" onPress={() => navigation.navigate('LiveStudio', { streamId: 'demo' })} fullWidth style={{ marginTop: Spacing.xxl }} />
      <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: Spacing.sm }} fullWidth />
    </Screen>
  )
}

export function LiveStudioScreen({ navigation }: any) {
  return (
    <Screen padded style={styles.center}>
      <Text style={styles.title}>🔴 Live Studio</Text>
      <Text style={styles.subtitle}>Full implementation coming in Phase 4</Text>
      <Button label="End Stream" variant="danger" onPress={() => navigation.navigate('StreamSummary', { streamId: 'demo' })} style={{ marginTop: Spacing.xxl }} fullWidth />
    </Screen>
  )
}

export const DestinationsScreen  = () => <PlaceholderScreen title="Destinations"   subtitle="Manage streaming platforms" />
export const SceneManagerScreen   = () => <PlaceholderScreen title="Scene Manager"  subtitle="Scenes and sources" />
export const StreamSummaryScreen  = () => <PlaceholderScreen title="Stream Summary" subtitle="Your stream stats" />

// ─── Editor Screens ───────────────────────────────────────────
export function ProjectsListScreen({ navigation }: any) {
  return (
    <Screen padded>
      <Text style={styles.title}>Editor</Text>
      <Text style={styles.subtitle}>Your video projects</Text>
      <Button
        label="New Project"
        onPress={() => navigation.navigate('ProjectSetup')}
        style={{ marginTop: Spacing.xxl }}
        fullWidth
      />
    </Screen>
  )
}

export function EditorCanvasScreen({ navigation }: any) {
  return (
    <Screen padded style={styles.center}>
      <Text style={styles.title}>Video Editor</Text>
      <Text style={styles.subtitle}>Full timeline — coming in Phase 5</Text>
      <Button label="Export" onPress={() => navigation.navigate('ExportSettings', { projectId: 'demo' })} style={{ marginTop: Spacing.xxl }} fullWidth />
    </Screen>
  )
}

export const ProjectSetupScreen   = () => <PlaceholderScreen title="Project Setup"    subtitle="Configure resolution & fps" />
export const ExportSettingsScreen  = () => <PlaceholderScreen title="Export Settings"  subtitle="Choose format & quality" />
export const ExportProgressScreen  = () => <PlaceholderScreen title="Exporting..."     subtitle="This may take a few minutes" />
export const ExportCompleteScreen  = () => <PlaceholderScreen title="Export Complete!" subtitle="Your video is ready" />

// ─── Library Screens ──────────────────────────────────────────
export const LibraryHomeScreen = () => <PlaceholderScreen title="Library"      subtitle="Your media files" />
export const AssetDetailScreen = () => <PlaceholderScreen title="Asset Detail" subtitle="Preview and manage" />

// ─── Profile Screens ──────────────────────────────────────────
export function ProfileHomeScreen({ navigation }: any) {
  return (
    <Screen padded>
      <Text style={styles.title}>Profile</Text>
      <Button label="Edit Profile"  variant="secondary" onPress={() => navigation.navigate('EditProfile')}  fullWidth style={{ marginTop: Spacing.xl }} />
      <Button label="Subscription"  variant="secondary" onPress={() => navigation.navigate('Subscription')} fullWidth style={{ marginTop: Spacing.sm }} />
      <Button label="Settings"      variant="secondary" onPress={() => navigation.navigate('Settings')}     fullWidth style={{ marginTop: Spacing.sm }} />
    </Screen>
  )
}

export const EditProfileScreen  = () => <PlaceholderScreen title="Edit Profile"  />
export const SubscriptionScreen = () => <PlaceholderScreen title="Subscription" subtitle="Manage your plan" />
export const SettingsScreen     = () => <PlaceholderScreen title="Settings" />

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  title: {
    fontSize:   Typography.xxl,
    fontFamily: Typography.fontBold,
    color:      Colors.textPrimary,
  },
  subtitle: {
    fontSize:   Typography.base,
    fontFamily: Typography.fontRegular,
    color:      Colors.textSecondary,
    marginTop:  Spacing.xs,
  },
})
