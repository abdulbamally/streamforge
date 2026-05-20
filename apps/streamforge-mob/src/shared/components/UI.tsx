// ============================================================
//  Shared UI Components — Card, Badge, Avatar, Skeleton, Screen
// ============================================================

import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography, Spacing, Radius, Shadows } from "../theme/tokens";
import type { Plan } from "@streamforge/api-contract";

// ─── Card ─────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.cardPadded, style]}>
      {children}
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────
type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "live"
  | Plan;

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const BADGE_COLORS: Record<string, string> = {
  default: Colors.bgSurface,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
  live: Colors.live,
  FREE: Colors.planFree,
  PRO: Colors.planPro,
  CREATOR: Colors.planCreator,
  ENTERPRISE: Colors.planEnterprise,
};

export function Badge({
  label,
  variant = "default",
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: BADGE_COLORS[variant] ?? Colors.bgSurface },
        style,
      ]}
    >
      {variant === "live" && <View style={styles.liveDot} />}
      <Text style={[styles.badgeText, textStyle]}>{label}</Text>
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ uri, name, size = 40, style }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius = Radius.sm,
  style,
}: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius: radius },
        style,
      ]}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────
interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  padded?: boolean;
  edges?: Array<"top" | "bottom" | "left" | "right">;
}

export function Screen({
  children,
  style,
  scrollable = false,
  padded = true,
  edges = ["top", "bottom"],
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[padded && styles.screenPadded, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenContent, padded && styles.screenPadded, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {content}
    </SafeAreaView>
  );
}

// ─── Divider ──────────────────────────────────────────────────
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardPadded: {
    padding: Spacing.lg,
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    gap: Spacing.xxs,
    alignSelf: "flex-start",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textPrimary,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },

  // Avatar
  avatar: {
    backgroundColor: Colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: {
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },

  // Skeleton
  skeleton: {
    backgroundColor: Colors.bgSurface,
  },

  // Screen
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenContent: {
    flex: 1,
  },
  screenPadded: {
    padding: Spacing.lg,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
});
