import { getStorage } from '@core/storage/mmkvStorage'
import type { EditProject } from '../engine/types'

const STORAGE_ID = 'streamforge-editor-projects'
const INDEX_KEY = 'project_index'

function storage() {
  return getStorage(STORAGE_ID)
}

export function saveProject(project: EditProject): void {
  const s = storage()
  s.set(project.id, JSON.stringify(project))
  const index = getProjectIndex()
  if (!index.includes(project.id)) {
    index.unshift(project.id)
    s.set(INDEX_KEY, JSON.stringify(index))
  }
}

export function loadProject(projectId: string): EditProject | null {
  const raw = storage().getString(projectId)
  if (!raw) return null
  try {
    return JSON.parse(raw) as EditProject
  } catch {
    return null
  }
}

export function getProjectIndex(): string[] {
  const raw = storage().getString(INDEX_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function listLocalProjects(): EditProject[] {
  return getProjectIndex()
    .map((id) => loadProject(id))
    .filter((p): p is EditProject => p != null)
}

export function deleteProject(projectId: string): void {
  const s = storage()
  s.delete(projectId)
  const index = getProjectIndex().filter((id) => id !== projectId)
  s.set(INDEX_KEY, JSON.stringify(index))
}

export function isLocalProjectId(projectId: string): boolean {
  return projectId.startsWith('local_')
}

export function createLocalProject(
  partial: Pick<EditProject, 'title'> &
    Partial<Pick<EditProject, 'fps' | 'resolution' | 'aspectRatio'>>,
): EditProject {
  const now = Date.now()
  const project: EditProject = {
    id: `local_${now}_${Math.random().toString(36).slice(2, 7)}`,
    title: partial.title,
    clips: [],
    createdAt: now,
    updatedAt: now,
    fps: partial.fps ?? 30,
    resolution: partial.resolution,
    aspectRatio: partial.aspectRatio,
  }
  saveProject(project)
  return project
}
