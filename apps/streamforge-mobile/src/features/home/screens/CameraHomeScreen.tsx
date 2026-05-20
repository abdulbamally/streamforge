// ============================================================
//  Camera Home — Studio tab root (full-screen camera feed)
// ============================================================

import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { CameraPosition } from "react-native-vision-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Menu,
  Smartphone,
  SwitchCamera,
  Mic,
  MicOff,
  MessageCircle,
  CalendarDays,
  CircleDot,
} from "lucide-react-native";
import { CameraPreview } from "../components/CameraPreview";
import { handleGoLive } from "@app/navigation/goLive";
import {
  Colors,
  IconSize,
  Spacing,
  Typography,
  Radius,
} from "@shared/theme/tokens";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "CameraHome">;

export function CameraHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>("front");
  const [isMuted, setIsMuted] = useState(false);

  const openSettings = useCallback(() => {
    const shell = navigation.getParent()?.getParent()?.getParent();
    shell?.navigate("Settings", { screen: "SettingsHub" });
  }, [navigation]);

  const flipCamera = useCallback(() => {
    setCameraPosition((p) => (p === "front" ? "back" : "front"));
  }, []);

  const onGoLive = useCallback(() => {
    const tabNav = navigation.getParent()?.getParent();
    if (tabNav) {
      handleGoLive(tabNav);
    }
  }, [navigation]);

  return (
    <View style={styles.root}>
      <CameraPreview position={cameraPosition} isMuted={isMuted} />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={openSettings}
          style={styles.iconBtn}
          hitSlop={12}
          accessibilityLabel="Settings"
        >
          <Menu size={IconSize.lg} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} hitSlop={12}>
          <Smartphone size={IconSize.lg} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.blurPill, { top: insets.top + 56 }]}>
        <CircleDot size={IconSize.sm} color={Colors.textPrimary} />
        <Text style={styles.blurLabel}>Blur</Text>
      </View>

      {/* <View style={[styles.actionBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <ActionItem
          icon={<SwitchCamera size={IconSize.md} color={Colors.textPrimary} />}
          label="Flip camera"
          onPress={flipCamera}
        />
        <ActionItem
          icon={
            isMuted ? (
              <MicOff size={IconSize.md} color={Colors.textPrimary} />
            ) : (
              <Mic size={IconSize.md} color={Colors.textPrimary} />
            )
          }
          label="Mute"
          onPress={() => setIsMuted((m) => !m)}
        />
        <TouchableOpacity style={styles.goLiveBtn} onPress={onGoLive} activeOpacity={0.85}>
          <Text style={styles.goLiveText}>GO LIVE</Text>
        </TouchableOpacity>
        <ActionItem
          icon={<MessageCircle size={IconSize.md} color={Colors.textPrimary} />}
          label="Chat"
          onPress={() => {}}
        />
        <ActionItem
          icon={<CalendarDays size={IconSize.md} color={Colors.textPrimary} />}
          label="Event list"
          onPress={() => {}}
        />
      </View> */}
    </View>
  );
}

function ActionItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  blurPill: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: Colors.overlay50,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  blurLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    backgroundColor: Colors.overlay70,
    zIndex: 10,
  },
  actionItem: {
    alignItems: "center",
    width: 56,
    paddingBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
    marginTop: 4,
    textAlign: "center",
  },
  goLiveBtn: {
    flex: 1,
    maxWidth: 140,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.liveCta,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  goLiveText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.bg,
    letterSpacing: 0.5,
  },
});
