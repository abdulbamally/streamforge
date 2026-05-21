import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExportFormat } from "@streamforge/api-contract";
import { Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { EXPORT_FORMATS, EXPORT_FPS_OPTIONS, EXPORT_RESOLUTIONS } from "@shared/constants";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useExportProject } from "../hooks/useProject";
import type { MainShellStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<MainShellStackParamList, "ExportSettings">;

export function ExportSettingsScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const exportProject = useExportProject(projectId);
  const [format, setFormat] = useState<ExportFormat>("MP4");
  const [resolution, setResolution] = useState("1920x1080");
  const [fps, setFps] = useState<number>(30);
  const [videoBitrate, setVideoBitrate] = useState(8000);

  async function handleExport() {
    const result = await exportProject.mutateAsync({
      format,
      resolution,
      fps,
      videoBitrate,
      audioBitrate: 320,
    });
    navigation.replace("ExportProgress", { projectId, exportId: result.exportId });
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Export Settings</Text>
      <Text style={styles.subtitle}>Choose your output quality and format.</Text>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Format</Text>
        <View style={styles.chipRow}>
          {EXPORT_FORMATS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, format === item && styles.chipActive]}
              onPress={() => setFormat(item)}
            >
              <Text style={[styles.chipText, format === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Resolution</Text>
        <View style={styles.chipRow}>
          {EXPORT_RESOLUTIONS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.chip, resolution === item.value && styles.chipActive]}
              onPress={() => setResolution(item.value)}
            >
              <Text style={[styles.chipText, resolution === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>FPS</Text>
        <View style={styles.chipRow}>
          {EXPORT_FPS_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, fps === item && styles.chipActive]}
              onPress={() => setFps(item)}
            >
              <Text style={[styles.chipText, fps === item && styles.chipTextActive]}>{item}fps</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Bitrate Preset</Text>
        <View style={styles.chipRow}>
          {[4000, 8000, 12000].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, videoBitrate === item && styles.chipActive]}
              onPress={() => setVideoBitrate(item)}
            >
              <Text style={[styles.chipText, videoBitrate === item && styles.chipTextActive]}>
                {item} kbps
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Button
        label="Start Export"
        onPress={handleExport}
        loading={exportProject.isPending}
        fullWidth
      />
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
  sectionCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    borderRadius: 999,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  chipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  chipText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.brandLight,
  },
});
