// ============================================================
//  SceneService — Scene and source management
// ============================================================

import { prisma } from '../utils/prisma'
import { streamRedis } from '../utils/redis'
import { logger } from '../utils/logger'
import type { SourceType, SourceTransform } from '../types'

export interface CreateSceneDto {
  name:  string
  order: number
}

export interface CreateSourceDto {
  type:      SourceType
  label:     string
  order:     number
  config:    SourceTransform
  assetUrl?: string
}

export interface UpdateSourceDto {
  label?:    string
  order?:    number
  isVisible?: boolean
  config?:   Partial<SourceTransform>
  assetUrl?: string
}

export class SceneService {

  // ─── Scenes ─────────────────────────────────────────────────
  async createScene(streamId: string, dto: CreateSceneDto) {
    const scene = await prisma.scene.create({
      data: {
        streamId,
        name:  dto.name,
        order: dto.order,
      },
      include: { sources: true },
    })
    logger.debug({ streamId, sceneId: scene.id }, 'Scene created')
    return scene
  }

  async getScenesForStream(streamId: string) {
    return prisma.scene.findMany({
      where:   { streamId },
      include: { sources: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    })
  }

  async updateScene(sceneId: string, userId: string, data: Partial<CreateSceneDto>) {
    // Verify ownership via stream
    const scene = await prisma.scene.findUnique({
      where:   { id: sceneId },
      include: { stream: true },
    })

    if (!scene || scene.stream.userId !== userId) {
      throw new Error('Scene not found or access denied')
    }

    return prisma.scene.update({
      where: { id: sceneId },
      data,
      include: { sources: true },
    })
  }

  async deleteScene(sceneId: string, userId: string): Promise<void> {
    const scene = await prisma.scene.findUnique({
      where:   { id: sceneId },
      include: { stream: true },
    })

    if (!scene || scene.stream.userId !== userId) {
      throw new Error('Scene not found or access denied')
    }

    await prisma.scene.delete({ where: { id: sceneId } })
  }

  /**
   * Switch active scene — updates Redis immediately for low latency,
   * DB updated async. The mobile app receives the switch via WebSocket.
   */
  async switchActiveScene(
    streamId: string,
    userId:   string,
    sceneId:  string
  ): Promise<void> {
    // Validate scene belongs to stream
    const scene = await prisma.scene.findFirst({
      where: { id: sceneId, streamId },
    })

    if (!scene) throw new Error('Scene not found in this stream')

    // Atomic update in Redis (immediate effect)
    await streamRedis.updateLiveState(streamId, { activeSceneId: sceneId })

    // Async DB persistence
    await Promise.all([
      prisma.scene.updateMany({
        where: { streamId },
        data:  { isActive: false },
      }),
      prisma.scene.update({
        where: { id: sceneId },
        data:  { isActive: true },
      }),
    ])

    logger.info({ streamId, sceneId }, 'Active scene switched')
  }

  // ─── Sources ─────────────────────────────────────────────────
  async createSource(sceneId: string, userId: string, dto: CreateSourceDto) {
    const scene = await prisma.scene.findUnique({
      where:   { id: sceneId },
      include: { stream: true },
    })

    if (!scene || scene.stream.userId !== userId) {
      throw new Error('Scene not found or access denied')
    }

    return prisma.source.create({
      data: {
        sceneId,
        type:      dto.type,
        label:     dto.label,
        order:     dto.order,
        isVisible: true,
        config:    dto.config as any,
        assetUrl:  dto.assetUrl,
      },
    })
  }

  async updateSource(sourceId: string, userId: string, dto: UpdateSourceDto) {
    const source = await prisma.source.findUnique({
      where:   { id: sourceId },
      include: { scene: { include: { stream: true } } },
    })

    if (!source || source.scene.stream.userId !== userId) {
      throw new Error('Source not found or access denied')
    }

    const currentConfig = source.config as unknown as SourceTransform
    const mergedConfig  = dto.config
      ? { ...currentConfig, ...dto.config }
      : currentConfig

    return prisma.source.update({
      where: { id: sourceId },
      data: {
        label:     dto.label,
        order:     dto.order,
        isVisible: dto.isVisible,
        config:    mergedConfig as any,
        assetUrl:  dto.assetUrl,
      },
    })
  }

  async deleteSource(sourceId: string, userId: string): Promise<void> {
    const source = await prisma.source.findUnique({
      where:   { id: sourceId },
      include: { scene: { include: { stream: true } } },
    })

    if (!source || source.scene.stream.userId !== userId) {
      throw new Error('Source not found or access denied')
    }

    await prisma.source.delete({ where: { id: sourceId } })
  }

  async reorderSources(
    sceneId: string,
    userId:  string,
    orderedIds: string[]
  ): Promise<void> {
    const scene = await prisma.scene.findUnique({
      where:   { id: sceneId },
      include: { stream: true },
    })

    if (!scene || scene.stream.userId !== userId) {
      throw new Error('Access denied')
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.source.update({
          where: { id },
          data:  { order: index },
        })
      )
    )
  }
}
