import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2 } from "lucide-react-native";
import { Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import type { EditorStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<EditorStackParamList, "ExportComplete">;

export function ExportCompleteScreen({ route, navigation }: Props) {
  const { projectId, outputUrl } = route.params;

  return (
    <Screen padded>
      <Text style={styles.title}>Export Complete</Text>
      <Text style={styles.subtitle}>Your rendered file is ready.</Text>

      <Card style={styles.card}>
        <View style={styles.iconWrap}>
          <CheckCircle2 size={IconSize.xl} color={Colors.success} />
        </View>
        <Text style={styles.doneTitle}>Video generated successfully</Text>
        <Text style={styles.url} numberOfLines={2}>
          {outputUrl}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Back to Editor" onPress={() => navigation.replace("EditorCanvas", { projectId })} fullWidth />
        <Button label="Open Projects" variant="secondary" onPress={() => navigation.navigate("ProjectsList")} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xl,
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
  card: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  doneTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  url: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.sm,
  },
});
