import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserRound, CreditCard, Settings } from "lucide-react-native";
import { Avatar, Badge, Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import { useMe, useSubscription } from "../hooks/useProfile";
import type { ProfileStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileHome">;

export function ProfileHomeScreen({ navigation }: Props) {
  const { data: me, isLoading } = useMe();
  const { data: subscription } = useSubscription();

  if (isLoading) {
    return (
      <Screen padded>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Loading profile...</Text>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account, plan, and settings</Text>

      <Card style={styles.userCard}>
        <Avatar uri={me?.avatarUrl} name={me?.displayName ?? me?.username} size={64} />
        <View style={styles.userMeta}>
          <Text style={styles.name}>{me?.displayName ?? me?.username ?? "Unknown user"}</Text>
          <Text style={styles.email}>{me?.email ?? "--"}</Text>
          <Badge label={me?.plan ?? "FREE"} variant={me?.plan ?? "FREE"} />
          {subscription?.status ? (
            <Text style={styles.planStatus}>Subscription: {subscription.status}</Text>
          ) : null}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="Edit Profile"
          variant="secondary"
          icon={<UserRound size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={() => navigation.navigate("EditProfile")}
          fullWidth
        />
        <Button
          label="Subscription"
          variant="secondary"
          icon={<CreditCard size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={() => navigation.navigate("Subscription")}
          fullWidth
        />
        <Button
          label="Settings"
          variant="secondary"
          icon={<Settings size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={() => navigation.navigate("Settings")}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xxl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  userCard: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userMeta: {
    flex: 1,
    gap: Spacing.xxs,
  },
  name: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  planStatus: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textTertiary,
  },
  actions: {
    gap: Spacing.sm,
  },
});
