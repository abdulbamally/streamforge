// ============================================================
//  API endpoints for the mobile app (development & production)
//
//  Auth service env vars live in: services/auth-service/.env
//  (see services/auth-service/.env.example)
//
//  Android emulator cannot use "localhost" — it refers to the emulator
//  itself. Use 10.0.2.2 to reach your Mac's localhost.
//  Physical device: set DEV_MACHINE_HOST to your Mac's LAN IP (e.g. 192.168.1.5)
// ============================================================

import { Platform } from 'react-native'

/**
 * Host that reaches your development machine from the app.
 * - Android emulator: 10.0.2.2
 * - iOS simulator: localhost
 * - Physical device: your Mac's IP on the same Wi‑Fi network
 */
const PHYSICAL_DEVICE_HOST = '10.222.241.105'

export const DEV_MACHINE_HOST =
  PHYSICAL_DEVICE_HOST ||
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost')

const dev = (port: number) => `http://${DEV_MACHINE_HOST}:${port}`

export const apiConfig = {
  authBaseUrl: __DEV__ ? dev(3001) : 'https://api.streamforge.app',
  streamBaseUrl: __DEV__ ? dev(3002) : 'https://api.streamforge.app',
  mediaBaseUrl: __DEV__ ? dev(3003) : 'https://api.streamforge.app',
  aiBaseUrl: __DEV__ ? dev(3004) : 'https://api.streamforge.app',
  socialBaseUrl: __DEV__ ? dev(3005) : 'https://api.streamforge.app',
  realtimeBaseUrl: __DEV__ ? dev(3006) : 'https://api.streamforge.app',
  realtimeWsUrl: __DEV__ ? `ws://${DEV_MACHINE_HOST}:3006` : 'wss://api.streamforge.app',
  monetizationBaseUrl: __DEV__ ? dev(3007) : 'https://api.streamforge.app',
} as const
