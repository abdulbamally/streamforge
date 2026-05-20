// ============================================================
//  Auth Screens — Placeholder implementations
//  Full implementations come in Phase 3
// ============================================================

import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors, Typography, Spacing } from "@shared/theme/tokens";
import { Screen, Card } from "@shared/components/UI";
import { Button } from "@shared/components/Button";
import type {
  WelcomeScreenProps,
  LoginScreenProps,
  RegisterScreenProps,
  VerifyEmailScreenProps,
  ForgotPasswordScreenProps,
} from "@app/navigation/types";

// ─── Splash Screen ────────────────────────────────────────────
export function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>StreamForge ▶</Text>
      <ActivityIndicator
        color={Colors.brand}
        size="large"
        style={{ marginTop: Spacing.xxl }}
      />
    </View>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────
export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <Screen style={styles.center}>
      <Text style={styles.logo}>StreamForge ▶</Text>
      <Text style={styles.tagline}>Stream everywhere. Edit anything.</Text>
      <View style={styles.actions}>
        <Button
          label="Get Started"
          onPress={() => navigation.navigate("Register")}
          fullWidth
        />
        <Button
          label="Log In"
          variant="secondary"
          onPress={() => navigation.navigate("Login")}
          fullWidth
        />
      </View>
    </Screen>
  );
}

// ─── Login Screen ─────────────────────────────────────────────
export function LoginScreen({ navigation }: LoginScreenProps) {
  return (
    <Screen scrollable padded>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.subheading}>Sign in to your StreamForge account</Text>
      <Card style={{ marginTop: Spacing["3xl"] }}>
        <Text style={styles.placeholder}>
          Login form — coming in auth screens phase
        </Text>
      </Card>
      <Button
        label="Don't have an account? Register"
        variant="ghost"
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

// ─── Register Screen ──────────────────────────────────────────
export function RegisterScreen({ navigation }: RegisterScreenProps) {
  return (
    <Screen scrollable padded>
      <Text style={styles.heading}>Create account</Text>
      <Text style={styles.subheading}>
        Start streaming and editing for free
      </Text>
      <Card style={{ marginTop: Spacing["3xl"] }}>
        <Text style={styles.placeholder}>
          Register form — coming in auth screens phase
        </Text>
      </Card>
      <Button
        label="Already have an account? Log in"
        variant="ghost"
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

// ─── Verify Email Screen ──────────────────────────────────────
export function VerifyEmailScreen({
  route,
  navigation,
}: VerifyEmailScreenProps) {
  return (
    <Screen style={styles.center}>
      <Text style={styles.heading}>Check your email</Text>
      <Text style={styles.subheading}>
        We sent a verification link to {route.params.email}
      </Text>
      <Button
        label="Back to Login"
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: Spacing.xxl }}
      />
    </Screen>
  );
}

// ─── Forgot Password Screen ───────────────────────────────────
export function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  return (
    <Screen padded>
      <Text style={styles.heading}>Reset password</Text>
      <Text style={styles.subheading}>
        Enter your email to receive a reset link
      </Text>
      <Card style={{ marginTop: Spacing["3xl"] }}>
        <Text style={styles.placeholder}>
          Forgot password form — coming in auth screens phase
        </Text>
      </Card>
      <Button
        label="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

// ─── Reset Password Screen ────────────────────────────────────
export function ResetPasswordScreen() {
  return (
    <Screen padded>
      <Text style={styles.heading}>Set new password</Text>
      <Card style={{ marginTop: Spacing["3xl"] }}>
        <Text style={styles.placeholder}>
          Reset password form — coming in auth screens phase
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: Typography.xxl,
    fontFamily: Typography.fontBold,
    color: Colors.brand,
    letterSpacing: Typography.trackingTight,
  },
  tagline: {
    fontSize: Typography.md,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  heading: {
    fontSize: Typography.xxl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actions: {
    width: "100%",
    gap: Spacing.sm,
    marginTop: Spacing["4xl"],
    paddingHorizontal: Spacing.lg,
  },
  placeholder: {
    color: Colors.textTertiary,
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    textAlign: "center",
    padding: Spacing.lg,
  },
});
