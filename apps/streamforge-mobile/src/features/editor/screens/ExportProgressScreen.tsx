import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, ProgressBar, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useExportStatus } from "../hooks/useProject";
import type { EditorStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<EditorStackParamList, "ExportProgress">;

export function ExportProgressScreen({ route, navigation }: Props) {
  const { projectId, exportId } = route.params;
  const { data: exp, isLoading, refetch } = useExportStatus(projectId, exportId);

  useEffect(() => {
    if (exp?.status === "DONE" && exp.outputUrl) {
      navigation.replace("ExportComplete", { projectId, exportId, outputUrl: exp.outputUrl });
    }
  }, [exp, exportId, navigation, projectId]);

  return (
    <Screen padded>
      <Text style={styles.title}>Export Progress</Text>
      <Text style={styles.subtitle}>We are rendering your video in the background.</Text>

      <Card style={styles.card}>
        {isLoading ? (
          <Text style={styles.status}>Checking status...</Text>
        ) : (
          <>
            <Text style={styles.status}>Status: {exp?.status ?? "PENDING"}</Text>
            <ProgressBar
              progress={(exp?.progress ?? 0) / 100}
              label="Rendering"
              showPercent
              style={styles.progress}
            />
            {exp?.error ? <Text style={styles.error}>{exp.error}</Text> : null}
          </>
        )}
      </Card>

      <View style={styles.actions}>
        <Button label="Refresh Status" variant="secondary" onPress={() => refetch()} fullWidth />
        <Button label="Back to Editor" onPress={() => navigation.navigate("EditorCanvas", { projectId })} fullWidth />
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
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  status: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  progress: {
    marginTop: Spacing.xs,
  },
  error: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.error,
  },
  actions: {
    gap: Spacing.sm,
  },
});
