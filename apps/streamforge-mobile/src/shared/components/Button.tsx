// ============================================================
//  Button — Core UI Component
// ============================================================

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Typography, Spacing, Radius } from "../theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? Colors.textPrimary
              : Colors.brand
          }
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.label,
              styles[`${variant}Label`],
              styles[`${size}Label`],
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.xxs,
  },

  // Variants
  primary: {
    backgroundColor: Colors.brand,
  },
  secondary: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // Sizes
  sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  md: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    minHeight: 48,
  },
  lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    minHeight: 56,
  },

  fullWidth: { width: "100%" },
  disabled: { opacity: 0.4 },

  // Labels
  label: { fontFamily: Typography.fontSemiBold, color: Colors.textPrimary },
  primaryLabel: { color: Colors.textPrimary },
  secondaryLabel: { color: Colors.textPrimary },
  ghostLabel: { color: Colors.brand },
  dangerLabel: { color: Colors.textPrimary },

  smLabel: { fontSize: Typography.sm },
  mdLabel: { fontSize: Typography.base },
  lgLabel: { fontSize: Typography.md },
});
