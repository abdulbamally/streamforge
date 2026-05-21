import type { MediaAsset, WaveformData } from '../types/media.types'

export type MediaSlice = {
  mediaAssets: Record<string, MediaAsset>
  assetOrder: string[]
  selectedAssetId: string | null
  isImporting: boolean
  importError: string | null
}

export const initialMediaSlice: MediaSlice = {
  mediaAssets: {},
  assetOrder: [],
  selectedAssetId: null,
  isImporting: false,
  importError: null,
}

export function addAssetToSlice(media: MediaSlice, asset: MediaAsset): MediaSlice {
  const exists = Boolean(media.mediaAssets[asset.id])
  return {
    ...media,
    mediaAssets: {
      ...media.mediaAssets,
      [asset.id]: asset,
    },
    assetOrder: exists ? media.assetOrder : [...media.assetOrder, asset.id],
    selectedAssetId: asset.id,
  }
}

export function removeAssetFromSlice(media: MediaSlice, assetId: string): MediaSlice {
  const mediaAssets = { ...media.mediaAssets }
  delete mediaAssets[assetId]
  return {
    ...media,
    mediaAssets,
    assetOrder: media.assetOrder.filter((id) => id !== assetId),
    selectedAssetId: media.selectedAssetId === assetId ? null : media.selectedAssetId,
  }
}

export function attachWaveformToSlice(
  media: MediaSlice,
  assetId: string,
  waveformData: WaveformData,
): MediaSlice {
  const asset = media.mediaAssets[assetId]
  if (!asset) return media
  return {
    ...media,
    mediaAssets: {
      ...media.mediaAssets,
      [assetId]: {
        ...asset,
        waveformData,
      },
    },
  }
}
