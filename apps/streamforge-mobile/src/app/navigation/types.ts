// ============================================================
//  Navigation Types — Full param list for all screens
// ============================================================

import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";

// ─── Root Stack ───────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

// ─── Onboarding Stack ─────────────────────────────────────────
export type OnboardingStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// ─── Main shell (tabs + settings modal) ───────────────────────
export type MainShellStackParamList = {
  Tabs: undefined;
  Settings: undefined;
};

// ─── Main Tab Bar ─────────────────────────────────────────────
export type MainTabParamList = {
  Library: undefined;
  StreamingSettings: undefined;
  Live: undefined;
  Studio: undefined;
  Editor: undefined;
};

export type LiveStackParamList = {
  CameraHome: undefined;
};

// ─── Studio Stack ─────────────────────────────────────────────
export type StudioStackParamList = {
  CameraHome: undefined;
  StudioHome: undefined;
  StreamSetup: { streamId?: string };
  Destinations: { streamId: string };
  SceneManager: { streamId: string };
  SourceEditor: { streamId: string; sceneId: string; sourceId?: string };
  LiveStudio: { streamId: string };
  StreamSummary: { streamId: string };
};

// ─── Streaming Settings Stack ─────────────────────────────────
export type StreamingSettingsStackParamList = {
  StreamingSettingsHome: { fromLiveGate?: boolean } | undefined;
  StreamSetup: { streamId?: string };
  Destinations: { streamId: string };
  SceneManager: { streamId: string };
};

// ─── Editor Stack ─────────────────────────────────────────────
export type EditorStackParamList = {
  ProjectsList: undefined;
  ProjectSetup: { projectId?: string; assetId?: string };
  EditorCanvas: { projectId: string };
  ColorGrading: { projectId: string; clipId: string };
  AudioMixer: { projectId: string };
  ExportSettings: { projectId: string };
  ExportProgress: { projectId: string; exportId: string };
  ExportComplete: { projectId: string; exportId: string; outputUrl: string };
};

// ─── Library Stack ────────────────────────────────────────────
export type LibraryStackParamList = {
  LibraryHome: undefined;
  AssetDetail: { assetId: string };
};

// ─── Settings Stack (modal) ───────────────────────────────────
export type SettingsStackParamList = {
  SettingsHub: undefined;
  AccountSettings: undefined;
  Multistream: undefined;
  StreamingSettingsLink: undefined;
  Themes: undefined;
  DisconnectProtection: undefined;
  StreamShift: undefined;
  Alerts: undefined;
  ChatSettings: undefined;
};

// ─── Profile Stack (legacy — accessed from settings) ──────────
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Subscription: undefined;
  StreamKeys: undefined;
  Settings: undefined;
  ChangePassword: undefined;
};

// ─── Typed navigation props helpers ───────────────────────────
export type OnboardingNavProp =
  NativeStackNavigationProp<OnboardingStackParamList>;
export type StudioNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<StudioStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;
export type EditorNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<EditorStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

// Screen props
export type WelcomeScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "Welcome"
>;
export type LoginScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "Login"
>;
export type RegisterScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "Register"
>;
export type VerifyEmailScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "VerifyEmail"
>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "ForgotPassword"
>;
export type LiveStudioScreenProps = NativeStackScreenProps<
  StudioStackParamList,
  "LiveStudio"
>;
export type EditorCanvasScreenProps = NativeStackScreenProps<
  EditorStackParamList,
  "EditorCanvas"
>;
export type ExportProgressScreenProps = NativeStackScreenProps<
  EditorStackParamList,
  "ExportProgress"
>;
