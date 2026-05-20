import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Scene, Source } from "@streamforge/api-contract";
import { Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { SceneCard } from "../components/SceneCard";
import { SourceItem } from "../components/SourceItem";
import { useCreateScene, useScenes, useSwitchScene, useUpdateSource } from "../hooks/useScenes";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "SceneManager">;

function SourceRow({ streamId, sceneId, source }: { streamId: string; sceneId: string; source: Source }) {
  const updateSource = useUpdateSource(streamId, sceneId, source.id);

  return (
    <SourceItem
      source={source}
      onPress={() => {}}
      onToggleVisible={() => updateSource.mutate({ isVisible: !source.isVisible })}
    />
  );
}

export function SceneManagerScreen({ route, navigation }: Props) {
  const { streamId } = route.params;
  const { data: scenes = [], isLoading } = useScenes(streamId);
  const createScene = useCreateScene(streamId);
  const switchScene = useSwitchScene(streamId);
  const [newSceneName, setNewSceneName] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const selectedScene: Scene | undefined = useMemo(() => {
    if (!scenes.length) return undefined;
    if (selectedSceneId) return scenes.find((s) => s.id === selectedSceneId);
    return scenes.find((s) => s.isActive) ?? scenes[0];
  }, [scenes, selectedSceneId]);

  async function handleCreateScene() {
    const name = newSceneName.trim();
    if (!name) return;
    await createScene.mutateAsync({ name, order: scenes.length });
    setNewSceneName("");
  }

  function handleSelectScene(scene: Scene) {
    setSelectedSceneId(scene.id);
    if (!scene.isActive) switchScene.mutate(scene.id);
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Scene Manager</Text>
      <Text style={styles.subtitle}>Switch scenes and manage source visibility.</Text>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Create Scene</Text>
        <Input
          value={newSceneName}
          onChangeText={setNewSceneName}
          placeholder="Gaming Overlay"
        />
        <Button
          label="Add Scene"
          onPress={handleCreateScene}
          loading={createScene.isPending}
          disabled={!newSceneName.trim()}
          fullWidth
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Scenes</Text>
        {isLoading ? (
          <Text style={styles.empty}>Loading scenes...</Text>
        ) : scenes.length ? (
          <View style={styles.scenesRow}>
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isActive={selectedScene?.id === scene.id}
                onPress={() => handleSelectScene(scene)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No scenes available yet.</Text>
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Sources</Text>
        {selectedScene ? <Text style={styles.selectedSceneHint}>Selected: {selectedScene.name}</Text> : null}
        {selectedScene?.sources.length ? (
          <View style={styles.sourceList}>
            {selectedScene.sources.map((source) => (
              <SourceRow key={source.id} streamId={streamId} sceneId={selectedScene.id} source={source} />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No sources in selected scene.</Text>
        )}
      </Card>

      <Button
        label="Continue to Live Studio"
        variant="danger"
        onPress={() => navigation.navigate("LiveStudio", { streamId })}
        disabled={!selectedScene}
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
  scenesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sourceList: {
    gap: Spacing.xs,
  },
  selectedSceneHint: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  empty: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
});
