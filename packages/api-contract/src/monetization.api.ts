// ============================================================
//  StreamForge API Contract — Monetization (creator economy)
// ============================================================

import { apiFetch } from './client'

export interface CreatorWalletDto {
  userId: string
  balanceCents: number
  currency: string
  updatedAt: string
}

export interface CreatorGiftDto {
  id: string
  streamId: string | null
  senderId: string
  receiverId: string
  coinAmount: number
  type: string
  createdAt: string
}

export interface PayoutRequestDto {
  id: string
  userId: string
  amountCents: number
  status: string
  requestedAt: string
  processedAt: string | null
}

export const monetizationApi = {
  getWallet: (userId: string) =>
    apiFetch<CreatorWalletDto>(`/api/v1/wallet/${encodeURIComponent(userId)}`, {
      method: 'GET',
      service: 'monetization',
    }),

  topUp: (body: { amountCents: number }) =>
    apiFetch<CreatorWalletDto>('/api/v1/wallet/top-up', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'monetization',
    }),

  sendGift: (body: {
    receiverId: string
    coinAmount: number
    giftType: string
    streamId?: string
  }) =>
    apiFetch<CreatorGiftDto>('/api/v1/gifts', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'monetization',
    }),

  listReceivedGifts: (receiverId: string) =>
    apiFetch<CreatorGiftDto[]>(
      `/api/v1/gifts/received/${encodeURIComponent(receiverId)}`,
      { method: 'GET', service: 'monetization' },
    ),

  listPayouts: () =>
    apiFetch<PayoutRequestDto[]>('/api/v1/payouts', { method: 'GET', service: 'monetization' }),

  requestPayout: (body: { amountCents: number }) =>
    apiFetch<PayoutRequestDto>('/api/v1/payouts', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'monetization',
    }),
}
