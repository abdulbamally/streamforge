import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Platform, StreamDestination } from "@streamforge/api-contract";
import { Badge, Card, ConfirmModal, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { PLATFORM_LABELS, PLATFORM_RTMP_URLS } from "@shared/constants";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useAddDestination, useRemoveDestination, useStream } from "../hooks/useStream";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "Destinations">;

const PLATFORM_OPTIONS: Platform[] = ["YOUTUBE", "TWITCH", "FACEBOOK", "TIKTOK", "INSTAGRAM", "CUSTOM"];
const RTMP_URL_REGEX = /^rtmps?:\/\/.+/i;

export function DestinationsScreen({ route, navigation }: Props) {
  const { streamId } = route.params;
  const { data: stream, isLoading } = useStream(streamId);
  const addDestination = useAddDestination(streamId);
  const removeDestination = useRemoveDestination(streamId);

  const [platform, setPlatform] = useState<Platform>("YOUTUBE");
  const [label, setLabel] = useState("");
  const [rtmpUrl, setRtmpUrl] = useState(PLATFORM_RTMP_URLS.YOUTUBE);
  const [streamKey, setStreamKey] = useState("");
  const [pendingDelete, setPendingDelete] = useState<StreamDestination | null>(null);

  const labelValue = label.trim();
  const rtmpUrlValue = rtmpUrl.trim();
  const streamKeyValue = streamKey.trim();
  const labelError = label.length > 0 && labelValue.length < 3 ? "Use at least 3 characters" : undefined;
  const rtmpError =
    rtmpUrl.length > 0 && !RTMP_URL_REGEX.test(rtmpUrlValue)
      ? "Use a valid RTMP/RTMPS URL"
      : undefined;
  const streamKeyError =
    streamKey.length > 0 && streamKeyValue.length < 6 ? "Stream key looks too short" : undefined;

  const canSubmit = useMemo(
    () =>
      labelValue.length >= 3 &&
      RTMP_URL_REGEX.test(rtmpUrlValue) &&
      streamKeyValue.length >= 6 &&
      !addDestination.isPending,
    [labelValue, rtmpUrlValue, streamKeyValue, addDestination.isPending],
  );

  async function handleAdd() {
    if (!canSubmit) return;
    await addDestination.mutateAsync({
      platform,
      label: label.trim(),
      rtmpUrl: rtmpUrlValue,
      streamKey: streamKeyValue,
    });
    setLabel("");
    setStreamKey("");
  }

  function handlePrefillFromDestination(item: StreamDestination) {
    setPlatform(item.destination.platform);
    setLabel(item.destination.label);
    setRtmpUrl(item.destination.rtmpUrl);
    setStreamKey(item.destination.streamKey);
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Destinations</Text>
      <Text style={styles.subtitle}>Add where this stream should broadcast.</Text>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Platform</Text>
        <View style={styles.platformRow}>
          {PLATFORM_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.platformChip, platform === option && styles.platformChipActive]}
              onPress={() => {
                setPlatform(option);
                const presetUrl = PLATFORM_RTMP_URLS[option];
                setRtmpUrl(presetUrl ?? "");
              }}
            >
              <Text style={[styles.platformChipText, platform === option && styles.platformChipTextActive]}>
                {PLATFORM_LABELS[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Label"
          placeholder="My YouTube Channel"
          value={label}
          onChangeText={setLabel}
          error={labelError}
        />
        <Input label="RTMP URL" value={rtmpUrl} onChangeText={setRtmpUrl} error={rtmpError} />
        <Input
          label="Stream Key"
          placeholder="Paste stream key"
          value={streamKey}
          onChangeText={setStreamKey}
          error={streamKeyError}
        />

        <Button label="Add Destination" onPress={handleAdd} loading={addDestination.isPending} disabled={!canSubmit} fullWidth />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected</Text>
        {isLoading ? (
          <Text style={styles.empty}>Loading destinations...</Text>
        ) : stream?.destinations.length ? (
          <View style={styles.list}>
            {stream.destinations.map((item) => (
              <Card key={item.destinationId}>
                <View style={styles.destinationRow}>
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationTitle}>{item.destination.label}</Text>
                    <Text style={styles.destinationMeta}>{PLATFORM_LABELS[item.destination.platform]}</Text>
                  </View>
                  <Badge label={item.status.toUpperCase()} variant={item.status === "live" ? "live" : "default"} />
                </View>
                <Button
                  label="Edit copy"
                  variant="secondary"
                  onPress={() => handlePrefillFromDestination(item)}
                />
                <Button
                  label="Remove"
                  variant="ghost"
                  onPress={() => setPendingDelete(item)}
                />
              </Card>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No destinations added yet.</Text>
        )}
      </View>

      <Button
        label="Continue to Scene Manager"
        variant="secondary"
        onPress={() => navigation.navigate("SceneManager", { streamId })}
        disabled={!stream?.destinations.length}
        fullWidth
      />

      <ConfirmModal
        visible={!!pendingDelete}
        title="Remove destination?"
        message={
          pendingDelete
            ? `This will remove ${pendingDelete.destination.label} from the stream.`
            : undefined
        }
        confirmLabel="Remove"
        destructive
        loading={removeDestination.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await removeDestination.mutateAsync(pendingDelete.destinationId);
          setPendingDelete(null);
        }}
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
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  platformRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  platformChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  platformChipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  platformChipText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  platformChipTextActive: {
    color: Colors.brandLight,
  },
  list: {
    gap: Spacing.sm,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  destinationMeta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  empty: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
});
