// ============================================================
//  Main Navigator — Custom 5-tab bar + Settings modal shell
// ============================================================

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CustomTabBar } from "./CustomTabBar";
import { Colors } from "@shared/theme/tokens";
import type {
  MainTabParamList,
  MainShellStackParamList,
  StudioStackParamList,
  LiveStackParamList,
  StreamingSettingsStackParamList,
  EditorStackParamList,
  LibraryStackParamList,
  SettingsStackParamList,
} from "./types";

import { CameraHomeScreen } from "@features/home/screens";

import {
  StudioHomeScreen,
  StreamSetupScreen,
  LiveStudioScreen,
  DestinationsScreen,
  SceneManagerScreen,
  StreamSummaryScreen,
  StreamingSettingsHomeScreen,
} from "@features/studio/screens";

import {
  ProjectsListScreen,
  ProjectSetupScreen,
  EditorCanvasScreen,
  ExportSettingsScreen,
  ExportProgressScreen,
  ExportCompleteScreen,
} from "@features/editor/screens";

import {
  LibraryHomeScreen,
  AssetDetailScreen,
} from "@features/library/screens";

import {
  SettingsHubScreen,
  SettingsPlaceholderScreen,
  SettingsStreamingLinkScreen,
} from "@features/settings/screens";

import { AccountSettingsScreen } from "@features/settings/screens/AccountSettingsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const ShellStack = createNativeStackNavigator<MainShellStackParamList>();
const StudioStack = createNativeStackNavigator<StudioStackParamList>();
const LiveStack = createNativeStackNavigator<LiveStackParamList>();
const StreamingStack =
  createNativeStackNavigator<StreamingSettingsStackParamList>();
const EditorStack = createNativeStackNavigator<EditorStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function renderCustomTabBar(props: BottomTabBarProps) {
  return <CustomTabBar {...props} />;
}

function StudioNavigator() {
  return (
    <StudioStack.Navigator
      initialRouteName="StudioHome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <StudioStack.Screen name="CameraHome" component={CameraHomeScreen} />
      <StudioStack.Screen name="StudioHome" component={StudioHomeScreen} />
      <StudioStack.Screen name="StreamSetup" component={StreamSetupScreen} />
      <StudioStack.Screen name="Destinations" component={DestinationsScreen} />
      <StudioStack.Screen name="SceneManager" component={SceneManagerScreen} />
      <StudioStack.Screen
        name="LiveStudio"
        component={LiveStudioScreen}
        options={{ animation: "fade" }}
      />
      <StudioStack.Screen
        name="StreamSummary"
        component={StreamSummaryScreen}
      />
    </StudioStack.Navigator>
  );
}

function StreamingSettingsNavigator() {
  return (
    <StreamingStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <StreamingStack.Screen
        name="StreamingSettingsHome"
        component={StreamingSettingsHomeScreen}
      />
      <StreamingStack.Screen name="StreamSetup" component={StreamSetupScreen} />
      <StreamingStack.Screen
        name="Destinations"
        component={DestinationsScreen}
      />
      <StreamingStack.Screen
        name="SceneManager"
        component={SceneManagerScreen}
      />
    </StreamingStack.Navigator>
  );
}

function LiveNavigator() {
  return (
    <LiveStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <LiveStack.Screen name="CameraHome" component={CameraHomeScreen} />
    </LiveStack.Navigator>
  );
}

function EditorNavigator() {
  return (
    <EditorStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <EditorStack.Screen name="ProjectsList" component={ProjectsListScreen} />
    </EditorStack.Navigator>
  );
}

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <LibraryStack.Screen name="LibraryHome" component={LibraryHomeScreen} />
      <LibraryStack.Screen name="AssetDetail" component={AssetDetailScreen} />
    </LibraryStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.settingsBg },
      }}
    >
      <SettingsStack.Screen name="SettingsHub" component={SettingsHubScreen} />
      <SettingsStack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
      />
      <SettingsStack.Screen
        name="StreamingSettingsLink"
        component={SettingsStreamingLinkScreen}
      />
      <SettingsStack.Screen
        name="Multistream"
        component={SettingsPlaceholderScreen}
      />
      <SettingsStack.Screen
        name="Themes"
        component={SettingsPlaceholderScreen}
      />
      <SettingsStack.Screen
        name="DisconnectProtection"
        component={SettingsPlaceholderScreen}
      />
      <SettingsStack.Screen
        name="StreamShift"
        component={SettingsPlaceholderScreen}
      />
      <SettingsStack.Screen
        name="Alerts"
        component={SettingsPlaceholderScreen}
      />
      <SettingsStack.Screen
        name="ChatSettings"
        component={SettingsPlaceholderScreen}
      />
    </SettingsStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Live"
      tabBar={renderCustomTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Library" component={LibraryNavigator} />
      <Tab.Screen
        name="StreamingSettings"
        component={StreamingSettingsNavigator}
      />
      <Tab.Screen
        name="Live"
        component={LiveNavigator}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen name="Studio" component={StudioNavigator} />
      <Tab.Screen name="Editor" component={EditorNavigator} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <ShellStack.Navigator screenOptions={{ headerShown: false }}>
      <ShellStack.Screen name="Tabs" component={MainTabNavigator} />
      <ShellStack.Screen name="ProjectSetup" component={ProjectSetupScreen} />
      <ShellStack.Screen
        name="EditorCanvas"
        component={EditorCanvasScreen}
        options={{ animation: "fade" }}
      />
      <ShellStack.Screen
        name="ExportSettings"
        component={ExportSettingsScreen}
      />
      <ShellStack.Screen
        name="ExportProgress"
        component={ExportProgressScreen}
      />
      <ShellStack.Screen
        name="ExportComplete"
        component={ExportCompleteScreen}
      />
      <ShellStack.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </ShellStack.Navigator>
  );
}
