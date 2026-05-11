import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Screen } from "@shared/components";
import { Input } from "@shared/components/Input";
import { Button } from "@shared/components/Button";
import { ASPECT_RATIOS, EXPORT_FPS_OPTIONS, EXPORT_RESOLUTIONS } from "@shared/constants";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useCreateProject } from "../hooks/useProject";
import type { EditorStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<EditorStackParamList, "ProjectSetup">;

export function ProjectSetupScreen({ navigation }: Props) {
  const createProject = useCreateProject();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState("1920x1080");
  const [fps, setFps] = useState<number>(30);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const cleanedTitle = useMemo(() => title.trim(), [title]);
  const titleError = title.length > 0 && cleanedTitle.length < 3 ? "Use at least 3 characters" : undefined;
  const canSubmit = cleanedTitle.length >= 3 && !createProject.isPending;

  async function handleCreate() {
    if (!canSubmit) return;
    const project = await createProject.mutateAsync({
      title: cleanedTitle,
      description: description.trim() || undefined,
      resolution,
      fps,
      aspectRatio,
    });
    navigation.replace("EditorCanvas", { projectId: project.id });
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Project Setup</Text>
      <Text style={styles.subtitle}>Configure canvas and playback defaults.</Text>

      <Card style={styles.formCard}>
        <Input
          label="Project Title"
          placeholder="Weekend Vlog"
          value={title}
          onChangeText={setTitle}
          error={titleError}
        />
        <Input
          label="Description (optional)"
          placeholder="Quick edit for YouTube upload"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
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
        <Text style={styles.sectionTitle}>Aspect Ratio</Text>
        <View style={styles.chipRow}>
          {ASPECT_RATIOS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.chip, aspectRatio === item.value && styles.chipActive]}
              onPress={() => setAspectRatio(item.value)}
            >
              <Text style={[styles.chipText, aspectRatio === item.value && styles.chipTextActive]}>
                {item.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Button
        label="Create Project"
        onPress={handleCreate}
        loading={createProject.isPending}
        disabled={!canSubmit}
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
  formCard: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
