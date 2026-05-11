// ============================================================
//  StatsBar — Live stream stats overlay bar
// ============================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Wifi, Users, Film, AlertTriangle } from "lucide-react-native";
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  IconSize,
} from "@shared/theme/tokens";
import type { StreamStats } from "@streamforge/api-contract";

interface StatsBarProps {
  stats: StreamStats;
  duration: number; // seconds
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getBitrateColor(bitrate: number): string {
  if (bitrate < 1000) return Colors.error;
  if (bitrate < 3000) return Colors.warning;
  return Colors.success;
}

export function StatsBar({ stats, duration }: StatsBarProps) {
  return (
    <View style={styles.container}>
      {/* LIVE badge + duration */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
      <Text style={styles.duration}>{formatDuration(duration)}</Text>

      <View style={styles.divider} />

      {/* Bitrate */}
      <View style={styles.stat}>
        <Wifi size={IconSize.xs} color={getBitrateColor(stats.bitrate)} />
        <Text
          style={[styles.statValue, { color: getBitrateColor(stats.bitrate) }]}
        >
          {stats.bitrate > 0
            ? `${Math.round(stats.bitrate / 100) / 10}Mbps`
            : "—"}
        </Text>
      </View>

      {/* FPS */}
      <View style={styles.stat}>
        <Film size={IconSize.xs} color={Colors.textSecondary} />
        <Text style={styles.statValue}>
          {stats.fps > 0 ? `${stats.fps}fps` : "—"}
        </Text>
      </View>

      {/* Dropped frames warning */}
      {stats.droppedFrames > 0 && (
        <View style={styles.stat}>
          <AlertTriangle size={IconSize.xs} color={Colors.warning} />
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {stats.droppedFrames}
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Viewers */}
      <View style={styles.stat}>
        <Users size={IconSize.xs} color={Colors.textSecondary} />
        <Text style={styles.statValue}>
          {stats.viewerCount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.overlay70,
    borderRadius: Radius.full,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.live,
  },
  liveText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.live,
    letterSpacing: 1,
  },
  duration: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.white20,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
});
