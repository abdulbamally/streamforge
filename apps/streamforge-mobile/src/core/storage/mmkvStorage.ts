// Lazy MMKV access — must not instantiate at module load (JSI not ready yet).

import { MMKV } from 'react-native-mmkv'

export type AppStorage = Pick<
  MMKV,
  'getString' | 'getNumber' | 'set' | 'delete'
>

const memoryStores = new Map<string, Map<string, string | number | boolean>>()
const mmkvStores = new Map<string, MMKV>()

function memoryAdapter(data: Map<string, string | number | boolean>): AppStorage {
  return {
    getString: (key) => {
      const v = data.get(key)
      return typeof v === 'string' ? v : undefined
    },
    getNumber: (key) => {
      const v = data.get(key)
      return typeof v === 'number' ? v : undefined
    },
    set: (key, value) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        data.set(key, value)
      }
    },
    delete: (key) => data.delete(key),
  }
}

export function getStorage(id: string): AppStorage {
  if (mmkvStores.has(id)) {
    return mmkvStores.get(id)!
  }

  const memKey = `mem:${id}`
  if (memoryStores.has(memKey)) {
    return memoryAdapter(memoryStores.get(memKey)!)
  }

  try {
    const instance = new MMKV({ id })
    mmkvStores.set(id, instance)
    return instance
  } catch (e) {
    if (__DEV__) {
      console.warn(
        `[storage] MMKV unavailable for "${id}", using in-memory fallback.`,
        (e as Error).message,
      )
    }
    const data = new Map<string, string | number | boolean>()
    memoryStores.set(memKey, data)
    return memoryAdapter(data)
  }
}
