import { useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'

export function useMediaAssets() {
  const media = useEditorStore((state) => state.media)
  return useMemo(
    () => ({
      ...media,
      assets: media.assetOrder
        .map((assetId) => media.mediaAssets[assetId])
        .filter(Boolean),
      selectedAsset: media.selectedAssetId
        ? media.mediaAssets[media.selectedAssetId] ?? null
        : null,
    }),
    [media],
  )
}
