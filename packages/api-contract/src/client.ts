// ============================================================
//  StreamForge API Contract — Base HTTP Client
//  The mobile app configures this once at startup.
//  All service clients use this under the hood.
// ============================================================

import type { ApiResponse, ApiError } from './types'

export type ApiServiceName =
  | 'auth'
  | 'stream'
  | 'media'
  | 'ai'
  | 'social'
  | 'realtime'
  | 'monetization'

export interface ClientConfig {
  baseUrl:          string   // e.g. 'https://api.streamforge.app'
  /** Optional service hosts (dev: different localhost ports). Falls back to baseUrl. */
  socialBaseUrl?:       string
  realtimeBaseUrl?:     string
  /** WebSocket origin only (no path), e.g. ws://localhost:3006 */
  realtimeWsUrl?:       string
  monetizationBaseUrl?: string
  getAccessToken:   () => string | null
  onTokenExpired:   () => Promise<string | null>  // refresh token callback
  onUnauthorized:   () => void                    // redirect to login
  timeout?:         number   // ms, default 15000
}

let _config: ClientConfig | null = null

// ─── Configure once at app startup ───────────────────────────
export function configureApiClient(config: ClientConfig): void {
  _config = config
}

export function getConfig(): ClientConfig {
  if (!_config) throw new Error('API client not configured. Call configureApiClient() first.')
  return _config
}

function resolveServiceBaseUrl(service?: ApiServiceName): string {
  const config = getConfig()
  const root = config.baseUrl.replace(/\/$/, '')
  if (service === 'social' && config.socialBaseUrl) {
    return config.socialBaseUrl.replace(/\/$/, '')
  }
  if (service === 'realtime' && config.realtimeBaseUrl) {
    return config.realtimeBaseUrl.replace(/\/$/, '')
  }
  if (service === 'monetization' && config.monetizationBaseUrl) {
    return config.monetizationBaseUrl.replace(/\/$/, '')
  }
  return root
}

// ─── Core fetch wrapper ───────────────────────────────────────
export async function apiFetch<T>(
  path:    string,
  options: RequestInit & { service?: ApiServiceName } = {}
): Promise<T> {
  const { service, ...fetchOpts } = options
  const config  = getConfig()
  const token   = config.getAccessToken()
  const base    = resolveServiceBaseUrl(service)
  const pathPart = path.startsWith('/') ? path : `/${path}`
  const url       = `${base}${pathPart}`
  const timeout = config.timeout ?? 15000

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), timeout)

  try {
    let response = await fetch(url, {
      ...fetchOpts,
      headers,
      signal: controller.signal,
    })

    // ── Auto-refresh on 401 ───────────────────────────────────
    if (response.status === 401 && token) {
      const newToken = await config.onTokenExpired()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, { ...fetchOpts, headers })
      } else {
        config.onUnauthorized()
        throw new ApiClientError('Session expired. Please log in again.', 'AUTH_003', 401)
      }
    }

    const body = await response.json() as ApiResponse<T>

    if (!response.ok || !body.success) {
      const err = body.error ?? { code: 'SRV_001', message: 'Unknown error' }
      throw new ApiClientError(err.message, err.code, response.status, err.details)
    }

    return body.data as T

  } catch (err) {
    if (err instanceof ApiClientError) throw err
    if ((err as Error).name === 'AbortError') {
      throw new ApiClientError('Request timed out', 'SRV_001', 408)
    }
    throw new ApiClientError(
      (err as Error).message ?? 'Network error',
      'SRV_001',
      0
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── Typed API Error ──────────────────────────────────────────
export class ApiClientError extends Error {
  constructor(
    message:          string,
    public code:      string,
    public status:    number,
    public details?:  Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiClientError'
  }

  get isUnauthorized()    { return this.status === 401 }
  get isForbidden()       { return this.status === 403 }
  get isNotFound()        { return this.status === 404 }
  get isValidation()      { return this.status === 400 }
  get isRateLimited()     { return this.status === 429 }
  get isPlanLimit()       { return this.code === 'AUTHZ_003' }
  get isNetworkError()    { return this.status === 0 }
}

// ─── Helper: build query string ───────────────────────────────
export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  return filtered.length ? `?${filtered.join('&')}` : ''
}
