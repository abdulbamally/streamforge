// ============================================================
//  Toolbar — Editor bottom toolbar
// ============================================================

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import {
  Scissors, SplitSquareHorizontal, Music2,
  Sliders, Sparkles, Palette, SkipBack,
  SkipForward, Play, Pause, Upload,
} from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '@shared/theme/tokens'
import { useTimeline }   from '../hooks/useTimeline'
import { useEditorStore } from '../store/editorStore'
import { useTimelineSplit } from './timeline/SkiaTimeline'

interface ToolbarProps {
  onTrim?:        () => void
  onSplit?:       () => void
  onExtractAudio?: () => void
  onColorGrade?:  () => void
  onEffects?:     () => void
  onAI?:          () => void
  onExport?:      () => void
}

interface ToolButtonProps {
  icon:     React.ReactNode
  label:    string
  onPress:  () => void
  active?:  boolean
  disabled?: boolean
}

function ToolButton({ icon, label, onPress, active = false, disabled = false }: ToolButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.toolBtn, active && styles.toolBtnActive, disabled && styles.toolBtnDisabled]}
    >
      {icon}
      <Text style={[styles.toolLabel, active && styles.toolLabelActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

export function Toolbar({
  onTrim,
  onSplit,
  onExtractAudio,
  onColorGrade,
  onEffects,
  onAI,
  onExport,
}: ToolbarProps) {
  const { togglePlay, isPlaying, seekBySeconds, currentTime, duration } = useTimeline()
  const selectedClipId = useEditorStore((s) => s.selectedClipId)
  const splitAtPlayhead = useTimelineSplit()

  const hasSelection = !!selectedClipId

  return (
    <View style={styles.container}>

      {/* Playback controls row */}
      <View style={styles.playbackRow}>
        <TouchableOpacity onPress={() => seekBySeconds(-5)} style={styles.playbackBtn}>
          <SkipBack size={IconSize.md} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          {isPlaying
            ? <Pause size={IconSize.lg} color={Colors.textPrimary} />
            : <Play  size={IconSize.lg} color={Colors.textPrimary} />
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => seekBySeconds(5)} style={styles.playbackBtn}>
          <SkipForward size={IconSize.md} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Timecode */}
        <Text style={styles.timecode}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>

        {/* Export button */}
        <TouchableOpacity onPress={onExport} style={styles.exportBtn}>
          <Upload size={IconSize.sm} color={Colors.textPrimary} />
          <Text style={styles.exportLabel}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Tools row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolsRow}
      >
        <ToolButton
          icon={<Scissors size={IconSize.md} color={hasSelection ? Colors.textPrimary : Colors.textTertiary} />}
          label="Trim"
          onPress={onTrim ?? (() => {})}
          disabled={!hasSelection}
        />
        <ToolButton
          icon={<SplitSquareHorizontal size={IconSize.md} color={hasSelection ? Colors.textPrimary : Colors.textTertiary} />}
          label="Split"
          onPress={onSplit ?? splitAtPlayhead}
          disabled={!hasSelection}
        />
        <ToolButton
          icon={<Music2 size={IconSize.md} color={hasSelection ? Colors.textPrimary : Colors.textTertiary} />}
          label="Audio"
          onPress={onExtractAudio ?? (() => {})}
          disabled={!hasSelection}
        />
        <View style={styles.separator} />
        <ToolButton
          icon={<Palette size={IconSize.md} color={Colors.textTertiary} />}
          label="Color"
          onPress={onColorGrade ?? (() => {})}
          disabled
        />
        <ToolButton
          icon={<Sliders size={IconSize.md} color={Colors.textTertiary} />}
          label="Effects"
          onPress={onEffects ?? (() => {})}
          disabled
        />
        <ToolButton
          icon={<Sparkles size={IconSize.md} color={Colors.textTertiary} />}
          label="AI"
          onPress={onAI ?? (() => {})}
          disabled
        />
      </ScrollView>
    </View>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgElevated,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
    paddingBottom:   Spacing.sm,
  },

  // Playback
  playbackRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap:             Spacing.sm,
  },
  playbackBtn: {
    padding: Spacing.xs,
  },
  playBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.brand,
    alignItems:      'center',
    justifyContent:  'center',
  },
  timecode: {
    flex:       1,
    fontSize:   Typography.sm,
    fontFamily: Typography.fontMedium,
    color:      Colors.textSecondary,
    textAlign:  'center',
  },
  exportBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.xs,
    backgroundColor: Colors.bgSurface,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius:    Radius.full,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  exportLabel: {
    fontSize:   Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },

  // Tools
  toolsRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: Spacing.md,
    gap:             Spacing.xs,
  },
  toolBtn: {
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing.xxs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius:    Radius.sm,
    minWidth:        56,
  },
  toolBtnActive: {
    backgroundColor: Colors.white10,
  },
  toolBtnDisabled: {
    opacity: 0.35,
  },
  toolLabel: {
    fontSize:   10,
    fontFamily: Typography.fontMedium,
    color:      Colors.textSecondary,
  },
  toolLabelActive: {
    color: Colors.brand,
  },
  separator: {
    width:           1,
    height:          32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
})
