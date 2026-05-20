// ============================================================
//  Input — Core UI Component
// ============================================================

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Colors, Typography, Spacing, Radius } from "../theme/tokens";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  hint,
  isPassword = false,
  leftIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrapper, hasError && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, ...(leftIcon ? [styles.inputWithLeftIcon] : []), style]}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={Colors.brand}
          cursorColor={Colors.brand}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((p) => !p)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={Colors.textTertiary} />
            ) : (
              <Eye size={18} color={Colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  errorText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.error,
  },
  hintText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textTertiary,
  },
});
