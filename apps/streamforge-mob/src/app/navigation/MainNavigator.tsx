// ============================================================
//  Main Navigator — Bottom Tab Bar + nested stacks
// ============================================================

import React    from 'react'
import { StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Video, Film, FolderOpen, User } from 'lucide-react-native'

// Screens
import {
  StudioHomeScreen,
  StreamSetupScreen,
  LiveStudioScreen,
  DestinationsScreen,
  SceneManagerScreen,
  StreamSummaryScreen,
} from '@features/studio/screens'

import {
  ProjectsListScreen,
  ProjectSetupScreen,
  EditorCanvasScreen,
  ExportSettingsScreen,
  ExportProgressScreen,
  ExportCompleteScreen,
} from '@features/editor/screens'

import { LibraryHomeScreen, AssetDetailScreen } from '@features/library/screens'

import {
  ProfileHomeScreen,
  EditProfileScreen,
  SubscriptionScreen,
  SettingsScreen,
} from '@features/profile/screens'

import { Colors, Spacing, Typography } from '@shared/theme/tokens'
import type {
  MainTabParamList,
  StudioStackParamList,
  EditorStackParamList,
  LibraryStackParamList,
  ProfileStackParamList,
} from './types'

const Tab = createBottomTabNavigator<MainTabParamList>()
const TAB_ICONS: Record<string, React.FC<any>> = {
  Studio:  Video,
  Editor:  Film,
  Library: FolderOpen,
  Profile: User,
}

// ─── Nested stacks ─────────────────────────────────────────────
const StudioStack  = createNativeStackNavigator<StudioStackParamList>()
const EditorStack  = createNativeStackNavigator<EditorStackParamList>()
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>()
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()

function StudioNavigator() {
  return (
    <StudioStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <StudioStack.Screen name="StudioHome"    component={StudioHomeScreen} />
      <StudioStack.Screen name="StreamSetup"   component={StreamSetupScreen} />
      <StudioStack.Screen name="Destinations"  component={DestinationsScreen} />
      <StudioStack.Screen name="SceneManager"  component={SceneManagerScreen} />
      <StudioStack.Screen name="LiveStudio"    component={LiveStudioScreen}   options={{ animation: 'fade' }} />
      <StudioStack.Screen name="StreamSummary" component={StreamSummaryScreen} />
    </StudioStack.Navigator>
  )
}

function EditorNavigator() {
  return (
    <EditorStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <EditorStack.Screen name="ProjectsList"   component={ProjectsListScreen} />
      <EditorStack.Screen name="ProjectSetup"   component={ProjectSetupScreen} />
      <EditorStack.Screen name="EditorCanvas"   component={EditorCanvasScreen} />
      <EditorStack.Screen name="ExportSettings" component={ExportSettingsScreen} />
      <EditorStack.Screen name="ExportProgress" component={ExportProgressScreen} />
      <EditorStack.Screen name="ExportComplete" component={ExportCompleteScreen} />
    </EditorStack.Navigator>
  )
}

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <LibraryStack.Screen name="LibraryHome" component={LibraryHomeScreen} />
      <LibraryStack.Screen name="AssetDetail" component={AssetDetailScreen} />
    </LibraryStack.Navigator>
  )
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <ProfileStack.Screen name="ProfileHome"    component={ProfileHomeScreen} />
      <ProfileStack.Screen name="EditProfile"    component={EditProfileScreen} />
      <ProfileStack.Screen name="Subscription"   component={SubscriptionScreen} />
      <ProfileStack.Screen name="Settings"       component={SettingsScreen} />
    </ProfileStack.Navigator>
  )
}

// ─── Main Tab Bar ─────────────────────────────────────────────
export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:     false,
        tabBarStyle:     styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor:   Colors.brand,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarIcon: ({ color, size }) => {
          const Icon = TAB_ICONS[route.name]
          return Icon ? <Icon color={color} size={size} /> : null
        },
      })}
    >
      <Tab.Screen name="Studio"  component={StudioNavigator}  options={{ tabBarLabel: 'Studio' }} />
      <Tab.Screen name="Editor"  component={EditorNavigator}  options={{ tabBarLabel: 'Editor' }} />
      <Tab.Screen name="Library" component={LibraryNavigator} options={{ tabBarLabel: 'Library' }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  Colors.bgElevated,
    borderTopColor:   Colors.border,
    borderTopWidth:   1,
    paddingTop:       Spacing.xs,
    paddingBottom:    Spacing.sm,
    height:           60,
  },
  tabLabel: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontMedium,
    marginTop:  2,
  },
})
