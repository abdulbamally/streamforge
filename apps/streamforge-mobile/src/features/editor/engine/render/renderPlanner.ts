import type { ExportSettings } from '../../types/export.types'
import type {
  AudioInstruction,
  RenderInstruction,
  RenderPlan,
  TrimInstruction,
  UnsupportedRenderFeature,
} from '../../types/render.types'
import type { ProjectSnapshot } from '../../types/serialization.types'
import type { TimelineClip } from '../../types/clip.types'
import type { TimelineTrack } from '../../types/track.types'
import { getExportDimensions } from '../export/exportSettings'
import { resolveClipMediaAsset } from '../media/mediaAssetResolver'
import { PHASE_7_RENDER_CAPABILITIES } from './renderCapabilities'

function clipUri(clip: TimelineClip, snapshot: ProjectSnapshot): string {
  const asset = resolveClipMediaAsset(clip, snapshot.mediaAssets)
  return asset?.uri ?? clip.sourceUri ?? ''
}

function clipSourceStart(clip: TimelineClip): number {
  return clip.mediaStartTime ?? clip.trimStart ?? 0
}

function clipSourceEnd(clip: TimelineClip): number {
  return clip.mediaEndTime ?? clip.trimEnd ?? clipSourceStart(clip) + clip.duration
}

function addUnsupportedCreativeFeatures(
  clip: TimelineClip,
  track: TimelineTrack,
  unsupported: UnsupportedRenderFeature[],
) {
  if (clip.type === 'text') {
    unsupported.push({
      type: 'text',
      clipId: clip.id,
      trackId: track.id,
      message: 'Text overlays are saved in the project but not rendered by Phase 7 export.',
    })
  }
  if (clip.type === 'sticker') {
    unsupported.push({
      type: 'sticker',
      clipId: clip.id,
      trackId: track.id,
      message: 'Sticker overlays are saved in the project but not rendered by Phase 7 export.',
    })
  }
  if (clip.filters?.length) {
    unsupported.push({
      type: 'filter',
      clipId: clip.id,
      trackId: track.id,
      message: 'Filter assignments are detected but not rendered by Phase 7 export.',
    })
  }
  if (clip.transitions?.length) {
    unsupported.push({
      type: 'transition',
      clipId: clip.id,
      trackId: track.id,
      message: 'Transition assignments are detected but not rendered by Phase 7 export.',
    })
  }
  if (clip.transform && (clip.transform.x !== 0 || clip.transform.y !== 0 || clip.transform.scale !== 1 || clip.transform.rotation !== 0)) {
    unsupported.push({
      type: 'transform',
      clipId: clip.id,
      trackId: track.id,
      message: 'Transform metadata is preserved but not composited by Phase 7 export.',
    })
  }
  if (clip.opacity !== undefined && clip.opacity < 1) {
    unsupported.push({
      type: 'opacity',
      clipId: clip.id,
      trackId: track.id,
      message: 'Opacity metadata is preserved but not composited by Phase 7 export.',
    })
  }
}

export function createRenderPlan(
  snapshot: ProjectSnapshot,
  settings: ExportSettings,
): RenderPlan {
  const dimensions = getExportDimensions(settings, {
    width: snapshot.width,
    height: snapshot.height,
  })
  const instructions: RenderInstruction[] = []
  const unsupportedFeatures: UnsupportedRenderFeature[] = []

  const visibleVideoTracks = snapshot.tracks.filter(
    (track) => track.isVisible && (track.type === 'video' || track.type === 'image'),
  )
  if (visibleVideoTracks.length > 1 && !PHASE_7_RENDER_CAPABILITIES.multiTrackCompositing) {
    visibleVideoTracks.slice(1).forEach((track) => {
      unsupportedFeatures.push({
        type: 'multi-track',
        trackId: track.id,
        message: 'Only the first visible visual track is included by Phase 7 export.',
      })
    })
  }

  const mainVisualTrack = visibleVideoTracks[0]
  const visualClips = mainVisualTrack
    ? [...mainVisualTrack.clips]
        .filter((clip) => clip.type === 'video' || clip.type === 'image')
        .sort((a, b) => a.startTime - b.startTime)
    : []

  visualClips.forEach((clip) => {
    const inputUri = clipUri(clip, snapshot)
    const instruction: TrimInstruction = {
      id: `trim-${clip.id}`,
      type: 'trim',
      clipId: clip.id,
      trackId: clip.trackId,
      assetId: clip.assetId,
      inputUri,
      timelineStart: clip.startTime,
      sourceStart: clipSourceStart(clip),
      sourceEnd: clipSourceEnd(clip),
      duration: clip.duration,
    }
    instructions.push(instruction)
    addUnsupportedCreativeFeatures(clip, mainVisualTrack, unsupportedFeatures)
  })

  if (visualClips.length > 1) {
    instructions.push({
      id: `concat-${snapshot.id}`,
      type: 'concatenate',
      clipIds: visualClips.map((clip) => clip.id),
      inputUris: visualClips.map((clip) => clipUri(clip, snapshot)).filter(Boolean),
    })
  }

  snapshot.tracks.forEach((track) => {
    if (track !== mainVisualTrack) {
      track.clips.forEach((clip) => addUnsupportedCreativeFeatures(clip, track, unsupportedFeatures))
    }

    if (!settings.includeAudio || track.isMuted || track.type !== 'audio') return
    track.clips
      .filter((clip) => clip.type === 'audio' || clip.type === 'video')
      .sort((a, b) => a.startTime - b.startTime)
      .forEach((clip) => {
        const inputUri = clipUri(clip, snapshot)
        const instruction: AudioInstruction = {
          id: `audio-${clip.id}`,
          type: 'audio',
          clipId: clip.id,
          trackId: track.id,
          assetId: clip.assetId,
          inputUri,
          timelineStart: clip.startTime,
          sourceStart: clipSourceStart(clip),
          sourceEnd: clipSourceEnd(clip),
          volume: clip.volume ?? 1,
          muted: track.isMuted,
        }
        instructions.push(instruction)
      })
  })

  return {
    id: `render-plan-${snapshot.id}`,
    projectId: snapshot.projectId,
    duration: snapshot.duration,
    width: dimensions.width,
    height: dimensions.height,
    fps: settings.fps,
    format: settings.format,
    instructions,
    unsupportedFeatures,
    createdAt: new Date().toISOString(),
  }
}
