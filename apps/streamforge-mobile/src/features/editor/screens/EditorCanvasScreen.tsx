import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@shared/components/Button";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { VideoPreview } from "../components/preview/VideoPreview";
import { SkiaTimeline } from "../components/timeline/SkiaTimeline";
import { EditorToolBar } from "../components/toolbar/EditorToolBar";
import { CutToolPanel } from "../components/tools/CutToolPanel";
import { Toolbar } from "../components/Toolbar";
import { useEditorProject } from "../hooks/useEditorProject";
import { useEditorStore } from "../store/editorStore";
import { useUiStore } from "../store/uiStore";
import { useTimeline } from "../hooks/useTimeline";
import { pickVideoFromGallery } from "../services/importService";
import type { EditorStackParamList } from "@app/navigation/types";
import { isLocalProjectId } from "../services/projectPersistence";

type Props = NativeStackScreenProps<EditorStackParamList, "EditorCanvas">;

export function EditorCanvasScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isLoading, project } = useEditorProject(projectId);
  const clips = useEditorStore((s) => s.clips);
  const addClip = useEditorStore((s) => s.addClip);
  const activeTool = useUiStore((s) => s.activeTool);
  const { activeClip } = useTimeline();

  const previewHeight = height * 0.58;

  const handleImport = useCallback(async () => {
    const result = await pickVideoFromGallery();
    if (!result) return;
    const start = clips.reduce(
      (max, c) => Math.max(max, c.timelineStart + c.duration),
      0,
    );
    addClip({
      ...result.clip,
      timelineStart: start,
    });
  }, [clips, addClip]);

  const handleExport = useCallback(() => {
    if (isLocalProjectId(projectId)) {
      navigation.navigate("ExportProgress", {
        projectId,
        exportId: "local",
      });
    } else {
      navigation.navigate("ExportSettings", { projectId });
    }
  }, [navigation, projectId]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading editor...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          Unable to load project. If this is a cloud project, check your
          connection and try again.
        </Text>
      </View>
    );
  }

  const previewUri = activeClip?.sourceUri ?? clips[0]?.sourceUri ?? null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {project?.title ?? "Editor"}
          </Text>
          <Text style={styles.subtitle}>
            {clips.length} clip{clips.length === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            label="Import"
            size="sm"
            variant="secondary"
            onPress={handleImport}
          />
          <Button
            label="Export"
            size="sm"
            onPress={handleExport}
            disabled={!clips.length}
          />
        </View>
      </View>

      <View style={[styles.preview, { height: previewHeight }]}>
        <VideoPreview sourceUri={previewUri} />
      </View>

      <ScrollView
        style={styles.workspace}
        contentContainerStyle={styles.workspaceContent}
        keyboardShouldPersistTaps="handled"
      >
        <SkiaTimeline />
        {activeTool === "cut" ? <CutToolPanel /> : null}
        <Toolbar onSplit={undefined} onExport={handleExport} />
        <EditorToolBar />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  preview: {
    backgroundColor: Colors.bg,
  },
  workspace: {
    flex: 1,
    minHeight: 200,
  },
  workspaceContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
