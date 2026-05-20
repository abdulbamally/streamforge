import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera, Mic, MicOff, Video, VideoOff } from "lucide-react-native";
import { Badge, Card, ConfirmModal, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import { SceneCard } from "../components/SceneCard";
import { StatsBar } from "../components/StatsBar";
import { useScenes, useSwitchScene } from "../hooks/useScenes";
import { useStream } from "../hooks/useStream";
import { useStreamStore } from "../store/streamStore";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "LiveStudio">;

export function LiveStudioScreen({ route, navigation }: Props) {
  const { streamId } = route.params;
  const { data: stream } = useStream(streamId);
  const { data: scenes = [] } = useScenes(streamId);
  const switchScene = useSwitchScene(streamId);
  const {
    isMicMuted,
    isCameraMuted,
    toggleMic,
    toggleCamera,
    endStream,
    isEnding,
  } = useStreamStore();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const activeSceneId = stream?.liveState?.activeSceneId ?? scenes.find((s) => s.isActive)?.id ?? null;
  const streamStartedAt = stream?.startedAt ?? stream?.liveState?.startedAt;
  const isActuallyLive = stream?.status === "LIVE";

  const durationSeconds = useMemo(() => {
    if (!streamStartedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(streamStartedAt).getTime()) / 1000));
  }, [streamStartedAt]);

  return (
    <Screen padded>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {stream?.title ?? "Live Studio"}
        </Text>
        <Badge label={isActuallyLive ? "LIVE" : stream?.status ?? "IDLE"} variant={isActuallyLive ? "live" : "default"} />
      </View>

      {stream?.liveState ? (
        <View style={styles.statsWrap}>
          <StatsBar
            stats={{
              bitrate: stream.liveState.bitrate,
              fps: stream.liveState.fps,
              droppedFrames: stream.liveState.droppedFrames,
              viewerCount: stream.liveState.viewerCount,
              destinations: stream.liveState.destinations,
              duration: durationSeconds,
            }}
            duration={durationSeconds}
          />
        </View>
      ) : null}

      <Card style={styles.previewCard}>
        <Camera size={48} color={Colors.textSecondary} />
        <Text style={styles.previewLabel}>Camera preview placeholder</Text>
        <Text style={styles.previewHint}>Wire Vision Camera stream output here in next pass.</Text>
      </Card>

      <Card style={styles.scenesCard}>
        <Text style={styles.sectionTitle}>Scene Switcher</Text>
        {scenes.length ? (
          <View style={styles.sceneRow}>
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isActive={activeSceneId === scene.id}
                onPress={() => (isActuallyLive ? switchScene.mutate(scene.id) : undefined)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyScenesWrap}>
            <Text style={styles.emptyScenesText}>No scenes yet. Create scenes before going fully live.</Text>
            <Button
              label="Open Scene Manager"
              variant="secondary"
              onPress={() => navigation.navigate("SceneManager", { streamId })}
              fullWidth
            />
          </View>
        )}
      </Card>

      <View style={styles.controls}>
        <Button
          label={isMicMuted ? "Unmute Mic" : "Mute Mic"}
          variant="secondary"
          icon={isMicMuted ? <MicOff size={IconSize.sm} color={Colors.textPrimary} /> : <Mic size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={toggleMic}
          disabled={!isActuallyLive}
          fullWidth
        />
        <Button
          label={isCameraMuted ? "Enable Camera" : "Disable Camera"}
          variant="secondary"
          icon={isCameraMuted ? <VideoOff size={IconSize.sm} color={Colors.textPrimary} /> : <Video size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={toggleCamera}
          disabled={!isActuallyLive}
          fullWidth
        />
        <Button
          label="End Stream"
          variant="danger"
          loading={isEnding}
          onPress={() => setShowEndConfirm(true)}
          disabled={!isActuallyLive}
          fullWidth
        />
      </View>

      <ConfirmModal
        visible={showEndConfirm}
        title="End live stream?"
        message="Your stream will stop for all destinations and viewers immediately."
        confirmLabel="End stream"
        destructive
        loading={isEnding}
        onCancel={() => setShowEndConfirm(false)}
        onConfirm={async () => {
          await endStream(streamId);
          setShowEndConfirm(false);
          navigation.replace("StreamSummary", { streamId });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  statsWrap: {
    marginBottom: Spacing.md,
  },
  previewCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    minHeight: 220,
    marginBottom: Spacing.md,
  },
  previewLabel: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  previewHint: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  scenesCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sceneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  controls: {
    gap: Spacing.sm,
  },
  emptyScenesWrap: {
    gap: Spacing.sm,
  },
  emptyScenesText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
});
