// ============================================================
//  useProject — Project data fetching and mutations
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '@streamforge/api-contract'
import { QueryKeys }            from '@core/api/queryClient'
import { useEditorStore }       from '../store/editorStore'
import { apiClipToTimeline }    from '../utils/clipMappers'
import { useToast }             from '@core/hooks/useToast'
import type { CreateProjectDto, AddClipDto, ExportDto } from '@streamforge/api-contract'

// ── List all projects ─────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: QueryKeys.projects,
    queryFn:  () => projectApi.list(),
  })
}

// ── Single project with full timeline ────────────────────────
export function useProject(projectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QueryKeys.project(projectId),
    queryFn:  () => projectApi.getById(projectId),
    enabled: !!projectId && (options?.enabled ?? true),
  })
}

// ── Create project ────────────────────────────────────────────
export function useCreateProject() {
  const queryClient = useQueryClient()
  const toast       = useToast()

  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.projects })
      toast.success('Project created')
    },
    onError: (err: any) => toast.error(err.message ?? 'Failed to create project'),
  })
}

// ── Add clip to timeline ──────────────────────────────────────
export function useAddClip(projectId: string) {
  const { addClip } = useEditorStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: AddClipDto) => projectApi.addClip(projectId, dto),
    onSuccess: (clip) => {
      addClip(apiClipToTimeline(clip))
      queryClient.invalidateQueries({ queryKey: QueryKeys.project(projectId) })
    },
  })
}

// ── Queue export ──────────────────────────────────────────────
export function useExportProject(projectId: string) {
  const queryClient   = useQueryClient()
  const toast         = useToast()

  return useMutation({
    mutationFn: (dto?: ExportDto) => projectApi.export(projectId, dto),
    onSuccess: () => {
      toast.success('Export started — we\'ll notify you when it\'s ready')
      queryClient.invalidateQueries({ queryKey: QueryKeys.project(projectId) })
    },
    onError: (err: any) => toast.error(err.message ?? 'Export failed'),
  })
}

// ── Poll export status ────────────────────────────────────────
export function useExportStatus(
  projectId: string,
  exportId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: QueryKeys.exportStatus(projectId, exportId),
    queryFn:  () => projectApi.getExport(projectId, exportId),
    enabled: !!projectId && !!exportId && (options?.enabled ?? true),
    refetchInterval: (query) =>
      query.state.data?.status === 'DONE' || query.state.data?.status === 'FAILED' ? false : 3000,
  })
}
