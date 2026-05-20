import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { Timeline } from "../components/Timeline";
import { Toolbar } from "../components/Toolbar";
import { useAddClip, useProject } from "../hooks/useProject";
import { useEditorStore } from "../store/editorStore";
import type { EditorStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<EditorStackParamList, "EditorCanvas">;

export function EditorCanvasScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const { data: project, isLoading } = useProject(projectId);
  const addClip = useAddClip(projectId);
  const clips = useEditorStore((s) => s.clips);
  const duration = useEditorStore((s) => s.duration);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  async function handleAddDemoClip() {
    const start = duration;
    const end = start + 8;
    await addClip.mutateAsync({
      assetUrl: "https://cdn.streamforge.app/demo/sample.mp4",
      startTime: start,
      endTime: end,
      trackIndex: 0,
      trimIn: 0,
      trimOut: 8,
    });
  }

  if (isLoading) {
    return (
      <Screen padded>
        <Text style={styles.title}>Loading editor...</Text>
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]} padded={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {project?.title ?? "Editor"}
            </Text>
            <Text style={styles.subtitle}>
              {project?.resolution ?? "--"} · {project?.fps ?? "--"}fps · {clips.length} clips
            </Text>
          </View>
          <Button
            label="Export"
            onPress={() => navigation.navigate("ExportSettings", { projectId })}
            disabled={!clips.length}
            size="sm"
          />
        </View>

        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview Canvas</Text>
          <Text style={styles.previewMeta}>
            Playhead preview area. Selected clip: {selectedClipId ? "Yes" : "None"}
          </Text>
          <Button
            label="Add Demo Clip"
            variant="secondary"
            onPress={handleAddDemoClip}
            loading={addClip.isPending}
            fullWidth
          />
        </Card>

        <View style={styles.timelineWrap}>
          <Timeline />
        </View>

        <Toolbar
          onColorGrade={() => setActivePanel("color")}
          onEffects={() => setActivePanel("effects")}
          onExtractAudio={() => setActivePanel("audio")}
          onAI={() => setActivePanel("ai")}
          onExport={() => navigation.navigate("ExportSettings", { projectId })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    maxWidth: 240,
  },
  subtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  previewCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    minHeight: 160,
    justifyContent: "center",
  },
  previewTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  previewMeta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  timelineWrap: {
    flex: 1,
    minHeight: 320,
  },
});
