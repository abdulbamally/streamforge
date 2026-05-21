import React, { useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TopToolbar } from '../components/controls'
import { MediaBin } from '../components/media'
import { PreviewContainer } from '../components/preview'
import { TimelineContainer } from '../components/timeline/TimelineContainer'
import { BottomToolDock } from '../components/controls/BottomToolDock'
import { useEditorProject } from '../hooks/useEditorProject'
import { useMediaImport } from '../hooks/useMediaImport'
import { useEditorStore } from '../store/editorStore'
import { isLocalProjectId } from '../services/projectPersistence'
import {
  EditorColors,
  EditorSpacing,
  EditorTypography,
} from '../theme/editorTokens'
import type { MainShellStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<MainShellStackParamList, 'EditorCanvas'>

export function EditorCanvasScreen({ route, navigation }: Props) {
  const { projectId } = route.params
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { isLoading, project } = useEditorProject(projectId)
  const clips = useEditorStore((state) => state.clips)
  const tracks = useEditorStore((state) => state.tracks)
  const mediaAssets = useEditorStore((state) => state.media.mediaAssets)
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const { importMedia } = useMediaImport()

  const previewHeight = Math.max(260, Math.min(height * 0.46, 430))
  const timelineClipCount = tracks.reduce((total, track) => total + track.clips.length, 0)

  const previewUri = useMemo(() => {
    const allClips = tracks.flatMap((track) => track.clips)
    const activeClip = allClips.find(
      (clip) =>
        clip.type !== 'audio' &&
        currentTime >= clip.startTime &&
        currentTime <= clip.startTime + clip.duration,
    )
    const clip = activeClip ?? allClips.find((item) => item.type !== 'audio') ?? null
    if (!clip) return clips[0]?.sourceUri ?? null
    return clip.assetId ? mediaAssets[clip.assetId]?.uri ?? clip.sourceUri ?? null : clip.sourceUri ?? null
  }, [clips, currentTime, mediaAssets, tracks])

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    navigation.navigate('Tabs')
  }, [navigation])

  const handleImport = useCallback(async () => {
    await importMedia()
  }, [importMedia])

  const handleExport = useCallback(() => {
    if (isLocalProjectId(projectId)) {
      navigation.navigate('ExportProgress', {
        projectId,
        exportId: 'local',
      })
      return
    }
    navigation.navigate('ExportSettings', { projectId })
  }, [navigation, projectId])

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={EditorColors.accent} />
        <Text style={styles.loadingText}>Loading editor...</Text>
      </View>
    )
  }

  if (!project) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          Unable to load project. Check your connection and try again.
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <TopToolbar
        title={project.title ?? 'Editor'}
        clipCount={timelineClipCount}
        canExport={timelineClipCount > 0}
        onBack={handleBack}
        onImport={handleImport}
        onExport={handleExport}
      />

      <View style={{ height: previewHeight }}>
        <PreviewContainer sourceUri={previewUri} />
      </View>

      <ScrollView
        style={styles.workspace}
        contentContainerStyle={[
          styles.workspaceContent,
          { paddingBottom: insets.bottom + EditorSpacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <MediaBin />
        <TimelineContainer />
        <BottomToolDock />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: EditorColors.canvas,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: EditorSpacing.md,
    padding: EditorSpacing.xl,
    backgroundColor: EditorColors.canvas,
  },
  loadingText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  workspace: {
    flex: 1,
  },
  workspaceContent: {
    gap: EditorSpacing.md,
    paddingHorizontal: EditorSpacing.lg,
    paddingTop: EditorSpacing.md,
  },
})
