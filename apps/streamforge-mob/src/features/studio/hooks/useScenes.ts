// ============================================================
//  useScenes — Scene and source management
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { streamApi }      from '@streamforge/api-contract'
import { QueryKeys }      from '@core/api/queryClient'
import { useStreamStore } from '../store/streamStore'
import { useToast }       from '@core/hooks/useToast'
import type { CreateSceneDto, CreateSourceDto, UpdateSourceDto } from '@streamforge/api-contract'

// ── Fetch all scenes for a stream ─────────────────────────────
export function useScenes(streamId: string) {
  const setScenes = useStreamStore(s => s.setScenes)

  return useQuery({
    queryKey: QueryKeys.scenes(streamId),
    queryFn:  async () => {
      const scenes = await streamApi.getScenes(streamId)
      setScenes(scenes)
      return scenes
    },
    enabled: !!streamId,
  })
}

// ── Create a scene ────────────────────────────────────────────
export function useCreateScene(streamId: string) {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (dto: CreateSceneDto) =>
      streamApi.createScene(streamId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.scenes(streamId) })
      toast.success('Scene created')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to create scene'),
  })
}

// ── Switch active scene ───────────────────────────────────────
export function useSwitchScene(streamId: string) {
  const setActiveScene = useStreamStore(s => s.setActiveScene)
  const toast          = useToast()

  return useMutation({
    mutationFn: (sceneId: string) =>
      streamApi.switchScene(streamId, sceneId),
    onMutate: (sceneId) => {
      // Optimistic update — switch instantly in UI
      setActiveScene(sceneId)
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to switch scene'),
  })
}

// ── Add a source to a scene ───────────────────────────────────
export function useAddSource(streamId: string, sceneId: string) {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (dto: CreateSourceDto) =>
      streamApi.addSource(streamId, sceneId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.scenes(streamId) })
      toast.success('Source added')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to add source'),
  })
}

// ── Update a source ───────────────────────────────────────────
export function useUpdateSource(streamId: string, sceneId: string, sourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateSourceDto) =>
      streamApi.updateSource(streamId, sceneId, sourceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.scenes(streamId) })
    },
  })
}
