import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Image as ImageIcon,
  Film,
  Music,
  RefreshCw,
  Upload,
} from "lucide-react-native";
import DocumentPicker, {
  types as pickerTypes,
} from "react-native-document-picker";
import { Card, EmptyState, Screen, Skeleton } from "@shared/components";
import { Button } from "@shared/components/Button";
import { Colors, IconSize, Spacing, Typography } from "@shared/theme/tokens";
import { useAssets, useUploadAsset } from "../hooks/useAssets";
import { useToast } from "@core/hooks/useToast";
import type { LibraryStackParamList } from "@app/navigation/types";

type Tab = "video" | "image" | "audio" | "recording";
type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;

const TAB_META: Record<Tab, { label: string; icon: React.ReactNode }> = {
  video: {
    label: "Videos",
    icon: <Film size={IconSize.sm} color={Colors.textSecondary} />,
  },
  image: {
    label: "Images",
    icon: <ImageIcon size={IconSize.sm} color={Colors.textSecondary} />,
  },
  audio: {
    label: "Audio",
    icon: <Music size={IconSize.sm} color={Colors.textSecondary} />,
  },
  recording: {
    label: "Recordings",
    icon: <RefreshCw size={IconSize.sm} color={Colors.textSecondary} />,
  },
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function LibraryHomeScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>("video");
  const toast = useToast();
  const uploadAsset = useUploadAsset();
  const assetTypeFilter = tab === "recording" ? undefined : tab;
  const {
    data: fetchedAssets,
    isLoading,
    isFetching,
    refetch,
  } = useAssets(assetTypeFilter);

  const assets = useMemo(() => {
    if (!fetchedAssets) return [];
    if (tab !== "recording") return fetchedAssets;

    return fetchedAssets.filter((asset) => {
      const source = `${asset.originalName} ${asset.filename}`.toLowerCase();
      return source.includes("record") || source.includes("stream");
    });
  }, [fetchedAssets, tab]);

  const pickUploadType =
    tab === "video"
      ? [pickerTypes.video]
      : tab === "image"
        ? [pickerTypes.images]
        : tab === "audio"
          ? [pickerTypes.audio]
          : [pickerTypes.video];

  const handleUpload = async () => {
    try {
      const picked = await DocumentPicker.pickSingle({
        type: pickUploadType,
        copyTo: "cachesDirectory",
      });

      const filename = picked.name ?? `asset-${Date.now()}`;
      const contentType = picked.type ?? "application/octet-stream";
      const size = picked.size ?? 0;

      await uploadAsset.mutateAsync({
        uri: picked.fileCopyUri ?? picked.uri,
        filename,
        contentType,
        size,
      });
    } catch (error: any) {
      if (DocumentPicker.isCancel(error)) return;
      toast.error(error?.message ?? "Failed to pick file");
    }
  };

  return (
    <Screen padded>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>Manage all your media assets</Text>
        </View>
        <Button
          label="Upload"
          size="sm"
          icon={<Upload size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={handleUpload}
          loading={uploadAsset.isPending}
        />
      </View>

      <View style={styles.toolbar}>
        <Button
          label="Refresh"
          size="sm"
          variant="secondary"
          icon={<RefreshCw size={IconSize.sm} color={Colors.textPrimary} />}
          onPress={() => refetch()}
          loading={isFetching && !isLoading}
        />
      </View>

      <View style={styles.tabRow}>
        {(Object.keys(TAB_META) as Tab[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabChip, tab === key && styles.tabChipActive]}
            onPress={() => setTab(key)}
          >
            {TAB_META[key].icon}
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {TAB_META[key].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <Skeleton height={78} />
          <Skeleton height={78} />
          <Skeleton height={78} />
        </View>
      ) : assets.length ? (
        <View style={styles.list}>
          {assets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() =>
                navigation.navigate("AssetDetail", { assetId: asset.id })
              }
              activeOpacity={0.8}
            >
              <Card style={styles.assetCard}>
                <Text style={styles.assetTitle} numberOfLines={1}>
                  {asset.originalName}
                </Text>
                <Text style={styles.assetMeta}>
                  {asset.mimeType} · {formatSize(asset.sizeBytes)}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <EmptyState title="No assets" message="Upload media to start editing" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  tabRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    flexWrap: "wrap",
  },
  toolbar: {
    marginBottom: Spacing.md,
  },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    borderRadius: 999,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  tabChipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  tabText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.brandLight,
  },
  list: {
    gap: Spacing.sm,
  },
  assetCard: {
    gap: Spacing.xxs,
  },
  assetTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  assetMeta: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
});
