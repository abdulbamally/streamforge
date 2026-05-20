import { useEffect } from 'react'
import { useProject } from './useProject'
import { useEditorStore } from '../store/editorStore'
import { usePlaybackStore } from '../store/playbackStore'
import {
  isLocalProjectId,
  loadProject,
} from '../services/projectPersistence'
import { timelineClipsFromApi } from '../utils/clipMappers'
import { getTotalDuration } from '../engine/timelineEngine'

export function useEditorProject(projectId: string) {
  const isLocal = isLocalProjectId(projectId)
  const { data: apiProject, isLoading: apiLoading } = useProject(projectId, {
    enabled: !isLocal,
  })
  const loadProjectToStore = useEditorStore((s) => s.loadProject)

  useEffect(() => {
    if (isLocal) {
      const local = loadProject(projectId)
      if (local) loadProjectToStore(local)
      return
    }
    if (apiProject) {
      const clips = timelineClipsFromApi(apiProject.clips ?? [])
      loadProjectToStore({
        id: apiProject.id,
        title: apiProject.title,
        clips,
        createdAt: new Date(apiProject.createdAt).getTime(),
        updatedAt: new Date(apiProject.updatedAt).getTime(),
        fps: apiProject.fps ?? undefined,
        aspectRatio: apiProject.aspectRatio ?? undefined,
      })
      usePlaybackStore.getState().setDuration(getTotalDuration(clips))
    }
  }, [isLocal, projectId, apiProject, loadProjectToStore])

  return {
    isLoading: isLocal ? false : apiLoading,
    isLocal,
    project: useEditorStore((s) => s.project),
  }
}
