// ============================================================
//  SceneCard — Scene in the live studio scene switcher
// ============================================================

import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";
import { Colors, Typography, Spacing, Radius } from "@shared/theme/tokens";
import type { Scene } from "@streamforge/api-contract";

interface SceneCardProps {
  scene: Scene;
  isActive: boolean;
  onPress: () => void;
}

export function SceneCard({ scene, isActive, onPress }: SceneCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, isActive && styles.cardActive]}
    >
      {/* Thumbnail or placeholder */}
      <View style={styles.thumbnail}>
        {scene.thumbnail ? (
          <Image
            source={{ uri: scene.thumbnail }}
            style={styles.thumbnailImage}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailPlaceholderText}>
              {scene.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        {isActive && <View style={styles.activeDot} />}
      </View>

      {/* Name */}
      <Text
        style={[styles.name, isActive && styles.nameActive]}
        numberOfLines={1}
      >
        {scene.name}
      </Text>

      {/* Source count */}
      <Text style={styles.sourceCount}>
        {scene.sources.length}{" "}
        {scene.sources.length === 1 ? "source" : "sources"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 90,
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  thumbnail: {
    width: 80,
    height: 45,
    borderRadius: Radius.sm,
    overflow: "hidden",
    backgroundColor: Colors.bgSurface,
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgOverlay,
  },
  thumbnailPlaceholderText: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
  },
  activeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  name: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  nameActive: {
    color: Colors.textPrimary,
  },
  sourceCount: {
    fontSize: 10,
    fontFamily: Typography.fontRegular,
    color: Colors.textTertiary,
  },
});
