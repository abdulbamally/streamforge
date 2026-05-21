import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import { useEditorStore } from '../store/editorStore'

const AUTOSAVE_DELAY_MS = 1200

export function useEditorAutosave(enabled = true) {
  const tracks = useEditorStore((state) => state.tracks)
  const media = useEditorStore((state) => state.media)
  const projectId = useEditorStore((state) => state.editorProject.id)
  const saveRecoverySnapshot = useEditorStore((state) => state.saveRecoverySnapshot)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !projectId) return undefined
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveRecoverySnapshot('autosave')
    }, AUTOSAVE_DELAY_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [enabled, media.assetOrder, projectId, saveRecoverySnapshot, tracks])

  useEffect(() => {
    if (!enabled || !projectId) return undefined
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        saveRecoverySnapshot('autosave')
      }
    })
    return () => subscription.remove()
  }, [enabled, projectId, saveRecoverySnapshot])
}
