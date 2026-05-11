// ============================================================
//  useStream — Stream data fetching with TanStack Query
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { streamApi } from '@streamforge/api-contract'
import { QueryKeys } from '@core/api/queryClient'
import { useToast }  from '@core/hooks/useToast'
import type { CreateStreamDto, CreateDestinationDto } from '@streamforge/api-contract'

// ── List all streams ──────────────────────────────────────────
export function useStreams() {
  return useQuery({
    queryKey: QueryKeys.streams,
    queryFn:  () => streamApi.list(),
  })
}

// ── Single stream with live state ─────────────────────────────
export function useStream(streamId: string) {
  return useQuery({
    queryKey: QueryKeys.stream(streamId),
    queryFn:  () => streamApi.getById(streamId),
    enabled:  !!streamId,
    refetchInterval: 10000,   // Refresh every 10s when viewing stream
  })
}

// ── Stream ingest key ─────────────────────────────────────────
export function useStreamKey(streamId: string) {
  return useQuery({
    queryKey: QueryKeys.streamKey(streamId),
    queryFn:  () => streamApi.getStreamKey(streamId),
    enabled:  !!streamId,
    staleTime: Infinity,    // Key never changes — no need to refetch
  })
}

// ── Create stream ─────────────────────────────────────────────
export function useCreateStream() {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (dto: CreateStreamDto) => streamApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.streams })
      toast.success('Stream created')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to create stream')
    },
  })
}

// ── Add destination ───────────────────────────────────────────
export function useAddDestination(streamId: string) {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (dto: CreateDestinationDto) =>
      streamApi.addDestination(streamId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stream(streamId) })
      toast.success('Destination added')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to add destination')
    },
  })
}

// ── Remove destination ────────────────────────────────────────
export function useRemoveDestination(streamId: string) {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (destinationId: string) =>
      streamApi.removeDestination(streamId, destinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stream(streamId) })
      toast.success('Destination removed')
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Failed to remove destination')
    },
  })
}
