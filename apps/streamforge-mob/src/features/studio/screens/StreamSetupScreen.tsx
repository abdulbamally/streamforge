import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useCreateStream, useStream } from "../hooks/useStream";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "StreamSetup">;

export function StreamSetupScreen({ route, navigation }: Props) {
  const streamId = route.params?.streamId;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { data: stream, isLoading } = useStream(streamId ?? "");
  const createStream = useCreateStream();

  const resolvedTitle = useMemo(() => title.trim(), [title]);
  const titleError = !stream && title.length > 0 && resolvedTitle.length < 3 ? "At least 3 characters" : undefined;

  async function handleContinue() {
    if (stream?.id) {
      navigation.navigate("Destinations", { streamId: stream.id });
      return;
    }

    if (!resolvedTitle || resolvedTitle.length < 3) return;
    const created = await createStream.mutateAsync({
      title: resolvedTitle,
      description: description.trim() || undefined,
    });
    navigation.replace("StreamSetup", { streamId: created.id });
  }

  if (isLoading) {
    return (
      <Screen padded>
        <Text style={styles.title}>Loading stream setup...</Text>
      </Screen>
    );
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Stream Setup</Text>
      <Text style={styles.subtitle}>Set details, then configure destinations and scenes.</Text>

      {stream ? (
        <Card>
          <View style={styles.row}>
            <Text style={styles.streamName}>{stream.title}</Text>
            <Badge label={stream.status} variant={stream.status === "LIVE" ? "live" : "default"} />
          </View>
          <Text style={styles.hint}>{stream.description ?? "No description provided."}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{stream.destinations.length} destinations</Text>
            <Text style={styles.meta}>{stream.scenes.length} scenes</Text>
          </View>
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <Input
            label="Stream Title"
            placeholder="Weekly Creator Session"
            value={title}
            onChangeText={setTitle}
            error={titleError}
          />
          <Input
            label="Description (optional)"
            placeholder="What are you streaming today?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          label={stream ? "Manage Destinations" : "Create Stream"}
          onPress={handleContinue}
          loading={createStream.isPending}
          disabled={!stream && (!resolvedTitle || resolvedTitle.length < 3)}
          fullWidth
        />
        {stream ? (
          <>
            <Button
              label="Manage Scenes"
              variant="secondary"
              onPress={() => navigation.navigate("SceneManager", { streamId: stream.id })}
              fullWidth
            />
            <Button
              label="Go Live"
              variant="danger"
              onPress={() => navigation.navigate("LiveStudio", { streamId: stream.id })}
              fullWidth
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  formCard: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  streamName: {
    flex: 1,
    fontSize: Typography.lg,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  meta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textTertiary,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
});
