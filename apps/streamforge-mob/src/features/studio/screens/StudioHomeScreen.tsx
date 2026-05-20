import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Radio, Plus, ChevronRight } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStreams } from "../hooks/useStream";
import { Badge, Card, EmptyState, Screen, Skeleton } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import type { StudioStackParamList } from "@app/navigation/types";

type Props = NativeStackScreenProps<StudioStackParamList, "StudioHome">;

function statusVariant(status: string): "default" | "success" | "warning" | "error" | "live" {
  if (status === "LIVE") return "live";
  if (status === "IDLE") return "default";
  if (status === "ENDED") return "success";
  return "error";
}

export function StudioHomeScreen({ navigation }: Props) {
  const { data: streams, isLoading, isFetching, error, refetch } = useStreams();

  return (
    <Screen padded>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Studio</Text>
          <Text style={styles.subtitle}>Manage streams and go live</Text>
        </View>
        <Button
          label="New"
          size="sm"
          onPress={() => navigation.navigate("StreamSetup", {})}
          icon={<Plus size={IconSize.sm} color={Colors.textPrimary} />}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <Skeleton height={92} />
          <Skeleton height={92} />
          <Skeleton height={92} />
        </View>
      ) : error ? (
        <Card>
          <Text style={styles.errorTitle}>Unable to load streams</Text>
          <Text style={styles.errorBody}>Check your connection and try again.</Text>
          <Button label="Try again" onPress={() => refetch()} variant="secondary" />
        </Card>
      ) : streams?.length ? (
        <View style={styles.list}>
          {streams.map((stream) => (
            <TouchableOpacity
              key={stream.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("StreamSetup", { streamId: stream.id })}
            >
              <Card style={styles.streamCard}>
                <View style={styles.streamHeader}>
                  <Text style={styles.streamTitle} numberOfLines={1}>
                    {stream.title}
                  </Text>
                  <ChevronRight size={IconSize.sm} color={Colors.textTertiary} />
                </View>

                <View style={styles.metaRow}>
                  <Badge label={stream.status} variant={statusVariant(stream.status)} />
                  <Text style={styles.metaText}>{stream.destinations.length} destinations</Text>
                  <Text style={styles.metaText}>{stream.scenes.length} scenes</Text>
                </View>

                {stream.status === "LIVE" ? (
                  <View style={styles.liveRow}>
                    <Radio size={IconSize.xs} color={Colors.live} />
                    <Text style={styles.liveText}>
                      Live now - {stream.liveState?.viewerCount ?? stream.viewerCount} viewers
                    </Text>
                  </View>
                ) : null}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No streams yet"
          message="Create your first stream to start broadcasting."
          action={{ label: "Create stream", onPress: () => navigation.navigate("StreamSetup", {}) }}
        />
      )}

      <Button label="Refresh" variant="ghost" onPress={() => refetch()} loading={isFetching && !isLoading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.xxl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  list: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  streamCard: {
    gap: Spacing.sm,
  },
  streamHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  streamTitle: {
    flex: 1,
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  metaText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  liveText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.live,
  },
  errorTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  errorBody: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
});
