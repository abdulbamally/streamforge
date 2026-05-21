import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Card, Screen } from '@shared/components'
import { Input } from '@shared/components/Input'
import { Button } from '@shared/components/Button'
import { EXPORT_FPS_OPTIONS, EXPORT_RESOLUTIONS } from '@shared/constants'
import { Colors, Spacing, Typography } from '@shared/theme/tokens'
import { useCreateProject } from '../hooks/useProject'
import { createLocalProject } from '../services/projectPersistence'
import { pickVideoFromGallery } from '../services/importService'
import { useEditorStore } from '../store/editorStore'
import type { MainShellStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<MainShellStackParamList, 'ProjectSetup'>

function parseResolution(res: string): { width: number; height: number } | undefined {
  const [w, h] = res.split('x').map(Number)
  if (w && h) return { width: w, height: h }
  return undefined
}

export function ProjectSetupScreen({ navigation }: Props) {
  const createProject = useCreateProject()
  const loadProject = useEditorStore((s) => s.loadProject)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resolution, setResolution] = useState('1920x1080')
  const [fps, setFps] = useState<number>(30)
  const [aspectRatio] = useState('16:9')
  const [importing, setImporting] = useState(false)

  const cleanedTitle = useMemo(() => title.trim(), [title])
  const titleError = title.length > 0 && cleanedTitle.length < 3 ? 'Use at least 3 characters' : undefined
  const canSubmit = cleanedTitle.length >= 3 && !createProject.isPending

  async function handleCreateLocal() {
    if (!canSubmit) return
    const project = createLocalProject({
      title: cleanedTitle,
      fps,
      resolution: parseResolution(resolution),
      aspectRatio,
    })
    loadProject(project)
    navigation.replace('EditorCanvas', { projectId: project.id })
  }

  async function handleCreateCloud() {
    if (!canSubmit) return
    const project = await createProject.mutateAsync({
      title: cleanedTitle,
      description: description.trim() || undefined,
      resolution,
      fps,
      aspectRatio,
    })
    navigation.replace('EditorCanvas', { projectId: project.id })
  }

  async function handleImportAndEdit() {
    setImporting(true)
    try {
      const result = await pickVideoFromGallery()
      if (!result) return
      const project = createLocalProject({
        title: cleanedTitle.length >= 3 ? cleanedTitle : result.clip.label ?? 'Imported edit',
        fps: result.metadata.fps ?? fps,
        resolution:
          result.metadata.width && result.metadata.height
            ? { width: result.metadata.width, height: result.metadata.height }
            : parseResolution(resolution),
        aspectRatio,
      })
      loadProject({ ...project, clips: [result.clip] })
      navigation.replace('EditorCanvas', { projectId: project.id })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Screen padded scrollable>
      <Text style={styles.title}>New Project</Text>
      <Text style={styles.subtitle}>Create locally (offline) or sync to cloud.</Text>

      <Card style={styles.formCard}>
        <Input
          label="Project Title"
          placeholder="Weekend Vlog"
          value={title}
          onChangeText={setTitle}
          error={titleError}
        />
        <Input
          label="Description (optional, cloud only)"
          placeholder="Quick edit for YouTube"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Resolution</Text>
        <View style={styles.chipRow}>
          {EXPORT_RESOLUTIONS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.chip, resolution === item.value && styles.chipActive]}
              onPress={() => setResolution(item.value)}
            >
              <Text style={[styles.chipText, resolution === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>FPS</Text>
        <View style={styles.chipRow}>
          {EXPORT_FPS_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, fps === item && styles.chipActive]}
              onPress={() => setFps(item)}
            >
              <Text style={[styles.chipText, fps === item && styles.chipTextActive]}>{item}fps</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="Import video & edit"
          onPress={handleImportAndEdit}
          loading={importing}
          fullWidth
        />
        <Button
          label="Create local project"
          variant="secondary"
          onPress={handleCreateLocal}
          disabled={!canSubmit}
          fullWidth
        />
        <Button
          label="Create cloud project"
          variant="ghost"
          onPress={handleCreateCloud}
          loading={createProject.isPending}
          disabled={!canSubmit}
          fullWidth
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  formCard: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
    borderRadius: 999,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  chipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  chipText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.brandLight,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
})
