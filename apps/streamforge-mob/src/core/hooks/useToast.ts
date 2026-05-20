// ============================================================
//  useToast — Consistent toast notifications
// ============================================================

import { useCallback } from 'react'
import Toast           from 'react-native-toast-message'

export function useToast() {
  const success = useCallback((message: string, title?: string) => {
    Toast.show({
      type:  'success',
      text1: title ?? 'Success',
      text2: message,
      visibilityTime: 3000,
    })
  }, [])

  const error = useCallback((message: string, title?: string) => {
    Toast.show({
      type:  'error',
      text1: title ?? 'Error',
      text2: message,
      visibilityTime: 4000,
    })
  }, [])

  const info = useCallback((message: string, title?: string) => {
    Toast.show({
      type:  'info',
      text1: title ?? 'Info',
      text2: message,
      visibilityTime: 3000,
    })
  }, [])

  const hide = useCallback(() => Toast.hide(), [])

  return { success, error, info, hide }
}
