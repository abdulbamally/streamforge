// ============================================================
//  useAssets — Media library data fetching and upload flow
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mediaApi }   from '@streamforge/api-contract'
import { QueryKeys }  from '@core/api/queryClient'
import { useToast }   from '@core/hooks/useToast'

type AssetType = 'video' | 'audio' | 'image' | undefined

// ── List assets (optionally filtered by type) ─────────────────
export function useAssets(type?: AssetType) {
  return useQuery({
    queryKey: QueryKeys.assets(type),
    queryFn:  () => mediaApi.listAssets({ type, page: 1, limit: 50 }),
  })
}

// ── Delete an asset ───────────────────────────────────────────
export function useDeleteAsset() {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (assetId: string) => mediaApi.deleteAsset(assetId),
    onSuccess: () => {
      // Invalidate all asset queries regardless of type filter
      queryClient.invalidateQueries({ queryKey: QueryKeys.assets() })
      toast.success('Asset deleted')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to delete asset'),
  })
}

// ── Full upload flow ──────────────────────────────────────────
// Step 1: Get presigned URL
// Step 2: PUT file directly to R2
// Step 3: Confirm upload to trigger post-processing
export function useUploadAsset() {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: async ({
      uri,
      filename,
      contentType,
      size,
      onProgress,
    }: {
      uri:          string
      filename:     string
      contentType:  string
      size:         number
      onProgress?:  (pct: number) => void
    }) => {
      // Step 1 — Get presigned URL
      const { presignedUrl, assetId, publicUrl } =
        await mediaApi.getPresignedUploadUrl({ filename, contentType, size })

      onProgress?.(10)

      // Step 2 — PUT file directly to R2
      // In React Native, fetch with blob upload:
      const response = await fetch(presignedUrl, {
        method:  'PUT',
        headers: { 'Content-Type': contentType },
        body:    { uri } as any,  // React Native file body
      })

      if (!response.ok) {
        throw new Error('Upload to storage failed')
      }

      onProgress?.(90)

      // Step 3 — Confirm upload (triggers thumbnail gen)
      await mediaApi.confirmUpload(assetId)

      onProgress?.(100)

      return { assetId, publicUrl }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.assets() })
      toast.success('Upload complete')
    },
    onError: (err: any) => toast.error(err.message ?? 'Upload failed'),
  })
}
