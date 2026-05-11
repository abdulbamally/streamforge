// ============================================================
//  SourceItem — A single source in a scene's sources list
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Video,
  Monitor,
  Image,
  FileVideo,
  Type,
  Globe,
  Music,
  Eye,
  EyeOff,
} from "lucide-react-native";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  IconSize,
} from "@shared/theme/tokens";
import { SOURCE_TYPE_LABELS } from "@shared/constants";
import type { Source, SourceType } from "@streamforge/api-contract";

const SOURCE_ICONS: Record<SourceType, React.FC<any>> = {
  CAMERA: Video,
  SCREEN: Monitor,
  IMAGE: Image,
  VIDEO: FileVideo,
  TEXT: Type,
  BROWSER: Globe,
  AUDIO: Music,
};

interface SourceItemProps {
  source: Source;
  onToggleVisible: () => void;
  onPress: () => void;
}

export function SourceItem({
  source,
  onToggleVisible,
  onPress,
}: SourceItemProps) {
  const Icon = SOURCE_ICONS[source.type] ?? Video;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.container}
    >
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Icon size={IconSize.md} color={Colors.brand} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>
          {source.label}
        </Text>
        <Text style={styles.type}>{SOURCE_TYPE_LABELS[source.type]}</Text>
      </View>

      {/* Visibility toggle */}
      <TouchableOpacity
        onPress={onToggleVisible}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.visibilityBtn}
      >
        {source.isVisible ? (
          <Eye size={IconSize.sm} color={Colors.textSecondary} />
        ) : (
          <EyeOff size={IconSize.sm} color={Colors.textTertiary} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  type: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textTertiary,
  },
  visibilityBtn: {
    padding: Spacing.xs,
  },
});
