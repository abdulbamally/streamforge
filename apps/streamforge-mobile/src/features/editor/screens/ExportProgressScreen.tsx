import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Card, ProgressBar, Screen } from '@shared/components'
import { Button } from '@shared/components/Button'
import { Colors, Spacing, Typography } from '@shared/theme/tokens'
import { useExportStatus } from '../hooks/useProject'
import { useEditorStore } from '../store/editorStore'
import { exportProject } from '../services/exportService'
import { isLocalProjectId } from '../services/projectPersistence'
import type { EditorStackParamList } from '@app/navigation/types'

type Props = NativeStackScreenProps<EditorStackParamList, 'ExportProgress'>

export function ExportProgressScreen({ route, navigation }: Props) {
  const { projectId, exportId } = route.params
  const isLocal = isLocalProjectId(projectId) || exportId === 'local'
  const project = useEditorStore((s) => s.project)
  const [localProgress, setLocalProgress] = useState(0)
  const [localStatus, setLocalStatus] = useState<'idle' | 'running' | 'done' | 'failed'>('idle')
  const [localError, setLocalError] = useState<string | null>(null)
  const { data: exp, isLoading, refetch } = useExportStatus(projectId, exportId, {
    enabled: !isLocal,
  })

  useEffect(() => {
    if (!isLocal || !project || localStatus !== 'idle') return
    setLocalStatus('running')
    exportProject(project, setLocalProgress)
      .then((result) => {
        if (result.success) {
          setLocalStatus('done')
          navigation.replace('ExportComplete', {
            projectId,
            exportId: 'local',
            outputUrl: result.outputUri,
          })
        } else {
          setLocalStatus('failed')
          setLocalError(result.error ?? 'Export failed')
        }
      })
      .catch((e) => {
        setLocalStatus('failed')
        setLocalError(e?.message ?? 'Export failed')
      })
  }, [isLocal, project, localStatus, navigation, projectId])

  useEffect(() => {
    if (!isLocal && exp?.status === 'DONE' && exp.outputUrl) {
      navigation.replace('ExportComplete', {
        projectId,
        exportId,
        outputUrl: exp.outputUrl,
      })
    }
  }, [exp, exportId, isLocal, navigation, projectId])

  return (
    <Screen padded>
      <Text style={styles.title}>Export Progress</Text>
      <Text style={styles.subtitle}>
        {isLocal ? 'Preparing export…' : 'Rendering in the cloud…'}
      </Text>

      <Card style={styles.card}>
        {isLocal ? (
          <>
            <Text style={styles.status}>Status: {localStatus}</Text>
            <ProgressBar progress={localProgress / 100} label="Rendering" showPercent style={styles.progress} />
            {localError ? <Text style={styles.error}>{localError}</Text> : null}
          </>
        ) : isLoading ? (
          <Text style={styles.status}>Checking status...</Text>
        ) : (
          <>
            <Text style={styles.status}>Status: {exp?.status ?? 'PENDING'}</Text>
            <ProgressBar
              progress={(exp?.progress ?? 0) / 100}
              label="Rendering"
              showPercent
              style={styles.progress}
            />
            {exp?.error ? <Text style={styles.error}>{exp.error}</Text> : null}
          </>
        )}
      </Card>

      <View style={styles.actions}>
        {!isLocal ? (
          <Button label="Refresh Status" variant="secondary" onPress={() => refetch()} fullWidth />
        ) : null}
        <Button
          label="Back to Editor"
          onPress={() => navigation.navigate('EditorCanvas', { projectId })}
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
  card: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  status: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  progress: {
    marginTop: Spacing.xs,
  },
  error: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.error,
  },
  actions: {
    gap: Spacing.sm,
  },
})
