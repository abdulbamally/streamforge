import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Card, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useStream } from "../hooks/useStream";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "StreamSummary">;

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return "--";
  const sec = Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export function StreamSummaryScreen({ route, navigation }: Props) {
  const { streamId } = route.params;
  const { data: stream, isLoading } = useStream(streamId);

  if (isLoading) {
    return (
      <Screen padded>
        <Text style={styles.title}>Stream Summary</Text>
        <Text style={styles.subtitle}>Loading metrics...</Text>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Text style={styles.title}>Stream Summary</Text>
      <Text style={styles.subtitle}>Performance snapshot after your live session.</Text>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.streamTitle}>{stream?.title ?? "Untitled stream"}</Text>
          <Badge label={stream?.status ?? "ENDED"} variant="success" />
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>{formatDuration(stream?.startedAt ?? null, stream?.endedAt ?? null)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Peak viewers</Text>
            <Text style={styles.metricValue}>{stream?.peakViewers ?? 0}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Final viewers</Text>
            <Text style={styles.metricValue}>{stream?.viewerCount ?? 0}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Destinations</Text>
            <Text style={styles.metricValue}>{stream?.destinations.length ?? 0}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="Back to Studio"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "StudioHome" }],
            })
          }
          fullWidth
        />
        <Button
          label="Edit Stream Setup"
          variant="secondary"
          onPress={() => navigation.navigate("StreamSetup", { streamId })}
          fullWidth
        />
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
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  streamTitle: {
    flex: 1,
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  metrics: {
    gap: Spacing.sm,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bgSurface,
  },
  metricLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  actions: {
    gap: Spacing.sm,
  },
});
