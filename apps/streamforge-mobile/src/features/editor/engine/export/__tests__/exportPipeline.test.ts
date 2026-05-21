import { describe, expect, it } from '@jest/globals'
import { DEFAULT_EXPORT_SETTINGS } from '../../../types/export.types'
import type { ProjectSnapshot } from '../../../types/serialization.types'
import { validateProjectForExport } from '../exportValidation'
import { buildFFmpegCommand } from '../../render/ffmpegCommandBuilder'
import { createRenderPlan } from '../../render/renderPlanner'
import { serializeProject } from '../../serialization/projectSerializer'

const snapshot: ProjectSnapshot = {
  id: 'snapshot-test',
  projectId: 'project-test',
  version: '1.0.0',
  title: 'Export Test',
  duration: 8,
  width: 1920,
  height: 1080,
  fps: 30,
  settings: {
    aspectRatio: '16:9',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    backgroundColor: '#000000',
  },
  exportSettings: DEFAULT_EXPORT_SETTINGS,
  mediaAssets: {
    asset_video: {
      id: 'asset_video',
      type: 'video',
      uri: 'file:///tmp/source.mp4',
      name: 'source',
      duration: 8,
      createdAt: '2026-01-01T00:00:00.000Z',
      metadataStatus: 'ready',
    },
  },
  tracks: [
    {
      id: 'track-video',
      name: 'Video',
      type: 'video',
      height: 72,
      isLocked: false,
      isMuted: false,
      isVisible: true,
      clips: [
        {
          id: 'clip-video',
          trackId: 'track-video',
          assetId: 'asset_video',
          type: 'video',
          name: 'Video',
          startTime: 0,
          duration: 8,
          trimStart: 1,
          trimEnd: 9,
          mediaStartTime: 1,
          mediaEndTime: 9,
          opacity: 0.8,
          transform: {
            x: 0.2,
            y: 0,
            scale: 1,
            rotation: 0,
          },
        },
      ],
    },
    {
      id: 'track-text',
      name: 'Text',
      type: 'text',
      height: 48,
      isLocked: false,
      isMuted: false,
      isVisible: true,
      clips: [
        {
          id: 'clip-text',
          trackId: 'track-text',
          type: 'text',
          name: 'Title',
          startTime: 0,
          duration: 4,
          trimStart: 0,
          trimEnd: 4,
          text: {
            content: 'Title',
            fontSize: 32,
            color: '#ffffff',
            alignment: 'center',
            shadowEnabled: true,
          },
        },
      ],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('Phase 7 export pipeline', () => {
  it('serializes project snapshots as JSON-safe data', () => {
    const serialized = serializeProject({
      project: {
        id: snapshot.projectId,
        title: snapshot.title,
        duration: snapshot.duration,
        width: snapshot.width,
        height: snapshot.height,
        fps: snapshot.fps,
        tracks: snapshot.tracks,
        mediaAssetIds: Object.keys(snapshot.mediaAssets),
        projectSettings: snapshot.settings,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.createdAt,
      },
      tracks: snapshot.tracks,
      mediaAssets: snapshot.mediaAssets,
      exportSettings: DEFAULT_EXPORT_SETTINGS,
    })

    expect(JSON.parse(serialized.json).projectId).toBe(snapshot.projectId)
  })

  it('validates missing media references before export', () => {
    const invalid = {
      ...snapshot,
      mediaAssets: {},
    }
    const result = validateProjectForExport(invalid, DEFAULT_EXPORT_SETTINGS)

    expect(result.valid).toBe(false)
    expect(result.errors.some((error) => error.code === 'MISSING_MEDIA_ASSET')).toBe(true)
  })

  it('creates render instructions and reports unsupported creative features', () => {
    const plan = createRenderPlan(snapshot, DEFAULT_EXPORT_SETTINGS)

    expect(plan.instructions.some((instruction) => instruction.type === 'trim')).toBe(true)
    expect(plan.unsupportedFeatures.some((feature) => feature.type === 'text')).toBe(true)
    expect(plan.unsupportedFeatures.some((feature) => feature.type === 'opacity')).toBe(true)
    expect(plan.unsupportedFeatures.some((feature) => feature.type === 'transform')).toBe(true)
  })

  it('builds an ffmpeg command plan without executing it', () => {
    const plan = createRenderPlan(snapshot, DEFAULT_EXPORT_SETTINGS)
    const commandPlan = buildFFmpegCommand(plan, DEFAULT_EXPORT_SETTINGS, snapshot.title)

    expect(commandPlan.command).toContain('-ss 1')
    expect(commandPlan.command).toContain('-to 9')
    expect(commandPlan.outputFile).toContain('StreamForge_Export_Test')
  })
})
