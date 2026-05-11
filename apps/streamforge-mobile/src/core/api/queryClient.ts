// ============================================================
//  React Query — Client setup and shared hooks
// ============================================================

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              2,
      staleTime:          1000 * 60 * 2,    // 2 minutes
      gcTime:             1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// ─── Query Keys — centralised to avoid typos ──────────────────
export const QueryKeys = {
  // Auth
  me:              ['me']                                       as const,
  mySubscription:  ['subscription', 'me']                      as const,
  plans:           ['subscription', 'plans']                   as const,

  // Streams
  streams:         ['streams']                                  as const,
  stream:          (id: string) => ['streams', id]             as const,
  streamKey:       (id: string) => ['streams', id, 'key']      as const,
  scenes:          (id: string) => ['streams', id, 'scenes']   as const,

  // Media
  assets:          (type?: string) => ['assets', type]         as const,
  projects:        ['projects']                                 as const,
  project:         (id: string) => ['projects', id]            as const,
  exportStatus:    (pid: string, eid: string) => ['exports', pid, eid] as const,

  // AI
  aiLanguages:     ['ai', 'languages']                         as const,
  aiPlans:         ['ai', 'plans']                             as const,
} as const
