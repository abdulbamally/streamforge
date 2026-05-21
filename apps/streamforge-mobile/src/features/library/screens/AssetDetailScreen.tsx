import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Linking, Image } from "react-native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import Video from "react-native-video";
import { Music2 } from "lucide-react-native";
import { Card, ConfirmModal, Screen } from "@shared/components";
import { Button } from "@shared/components/Button";
import { useToast } from "@core/hooks/useToast";
import { Colors, Spacing, Typography } from "@shared/theme/tokens";
import { useAssets, useDeleteAsset } from "../hooks/useAssets";
import type {
  LibraryStackParamList,
  MainShellStackParamList,
} from "@app/navigation/types";

type Props = NativeStackScreenProps<LibraryStackParamList, "AssetDetail">;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function AssetDetailScreen({ route, navigation }: Props) {
  const { assetId } = route.params;
  const { data: allAssets, isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();
  const toast = useToast();
  const [showDelete, setShowDelete] = useState(false);

  const asset = useMemo(() => allAssets?.find((a) => a.id === assetId), [allAssets, assetId]);

  if (isLoading) {
    return (
      <Screen padded>
        <Text style={styles.title}>Asset Detail</Text>
        <Text style={styles.subtitle}>Loading asset...</Text>
      </Screen>
    );
  }

  if (!asset) {
    return (
      <Screen padded>
        <Text style={styles.title}>Asset Detail</Text>
        <Text style={styles.subtitle}>Asset not found.</Text>
      </Screen>
    );
  }

  const isImage = asset.mimeType.startsWith("image/");
  const isVideo = asset.mimeType.startsWith("video/");
  const isAudio = asset.mimeType.startsWith("audio/");

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>Asset Detail</Text>
      <Text style={styles.subtitle}>{asset.originalName}</Text>

      <Card style={styles.previewCard}>
        <Text style={styles.previewLabel}>Preview</Text>
        {isImage ? (
          <Image source={{ uri: asset.url }} style={styles.imagePreview} resizeMode="cover" />
        ) : null}

        {isVideo ? (
          <Video source={{ uri: asset.url }} style={styles.videoPreview} resizeMode="contain" controls paused />
        ) : null}

        {isAudio ? (
          <View style={styles.audioPreview}>
            <Music2 size={22} color={Colors.brandLight} />
            <Text style={styles.audioPreviewText}>Audio file preview</Text>
            <Video source={{ uri: asset.url }} style={styles.audioPlayer} controls paused />
          </View>
        ) : null}

        {!isImage && !isVideo && !isAudio ? (
          <Text style={styles.noPreview}>Preview not available for this file type.</Text>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{asset.mimeType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Size</Text>
          <Text style={styles.value}>{formatSize(asset.sizeBytes)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{asset.duration ? `${Math.round(asset.duration)}s` : "--"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Resolution</Text>
          <Text style={styles.value}>
            {asset.width && asset.height ? `${asset.width}x${asset.height}` : "--"}
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        {isVideo ? (
          <Button
            label="Edit in Editor"
            onPress={() => {
              const shellNavigation = navigation
                .getParent()
                ?.getParent() as NativeStackNavigationProp<MainShellStackParamList> | undefined;
              shellNavigation?.navigate("ProjectSetup", { assetId: asset.id });
            }}
            fullWidth
          />
        ) : null}
        <Button
          label="Open URL"
          variant="secondary"
          onPress={async () => {
            const canOpen = await Linking.canOpenURL(asset.url);
            if (!canOpen) {
              toast.error("Cannot open this URL on device");
              return;
            }
            await Linking.openURL(asset.url);
          }}
          fullWidth
        />
        <Button label="Delete Asset" variant="danger" onPress={() => setShowDelete(true)} fullWidth />
      </View>

      <ConfirmModal
        visible={showDelete}
        title="Delete asset?"
        message="This action removes the file permanently."
        confirmLabel="Delete"
        destructive
        loading={deleteAsset.isPending}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          await deleteAsset.mutateAsync(asset.id);
          setShowDelete(false);
          navigation.goBack();
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
  card: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  previewCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  previewLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textSecondary,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.bgSurface,
  },
  videoPreview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: Colors.bgSurface,
  },
  audioPreview: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
    backgroundColor: Colors.bgSurface,
  },
  audioPreviewText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  audioPlayer: {
    width: "100%",
    height: 54,
    backgroundColor: Colors.bgSurface,
  },
  noPreview: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  actions: {
    gap: Spacing.sm,
  },
});
