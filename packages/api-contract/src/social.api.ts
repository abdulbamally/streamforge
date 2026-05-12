// ============================================================
//  StreamForge API Contract — Social service (StreamForge Live)
//  Base URL: configure socialBaseUrl or falls back to baseUrl
// ============================================================

import { apiFetch } from './client'

export interface SocialFeedItem {
  id: string
  title: string
  creatorName: string
  viewers: number
  category: string
  isLive?: boolean
  thumbnailUrl: string | null
}

export interface SocialProfile {
  id: string
  userId: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface SocialFollow {
  id: string
  followerId: string
  followeeId: string
  createdAt: string
}

export interface StreamComment {
  id: string
  streamId: string
  userId: string
  content: string
  createdAt: string
}

export interface StreamReaction {
  id: string
  streamId: string
  userId: string
  type: string
  createdAt: string
}

export const socialApi = {
  listProfiles: () =>
    apiFetch<SocialProfile[]>('/api/v1/profiles', { method: 'GET', service: 'social' }),

  getProfile: (userId: string) =>
    apiFetch<SocialProfile>(`/api/v1/profiles/${encodeURIComponent(userId)}`, {
      method: 'GET',
      service: 'social',
    }),

  getFeed: () =>
    apiFetch<SocialFeedItem[]>('/api/v1/feed', { method: 'GET', service: 'social' }),

  getTrending: () =>
    apiFetch<SocialFeedItem[]>('/api/v1/feed/trending', { method: 'GET', service: 'social' }),

  getRecommended: () =>
    apiFetch<SocialFeedItem[]>('/api/v1/feed/recommended', { method: 'GET', service: 'social' }),

  followCreator: (creatorId: string) =>
    apiFetch<SocialFollow>(`/api/v1/follow/${encodeURIComponent(creatorId)}`, {
      method: 'POST',
      service: 'social',
    }),

  unfollowCreator: (creatorId: string) =>
    apiFetch<SocialFollow>(`/api/v1/follow/${encodeURIComponent(creatorId)}`, {
      method: 'DELETE',
      service: 'social',
    }),

  createComment: (body: { streamId: string; content: string }) =>
    apiFetch<StreamComment>('/api/v1/comments', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'social',
    }),

  listComments: (streamId: string) =>
    apiFetch<StreamComment[]>(`/api/v1/comments/${encodeURIComponent(streamId)}`, {
      method: 'GET',
      service: 'social',
    }),

  createReaction: (body: { streamId: string; type: string }) =>
    apiFetch<StreamReaction>('/api/v1/reactions', {
      method: 'POST',
      body: JSON.stringify(body),
      service: 'social',
    }),

  listReactions: (streamId: string) =>
    apiFetch<StreamReaction[]>(`/api/v1/reactions/${encodeURIComponent(streamId)}`, {
      method: 'GET',
      service: 'social',
    }),
}
