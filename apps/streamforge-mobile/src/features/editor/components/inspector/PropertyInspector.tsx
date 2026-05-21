import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { usePropertyInspector } from '../../hooks/usePropertyInspector'
import { useSelectedClipProperties } from '../../hooks/useSelectedClipProperties'
import type { PropertyTab } from '../../types/property.types'
import { EditorColors, EditorRadius, EditorShadows, EditorSpacing, EditorTypography } from '../../theme/editorTokens'
import { AudioInspector } from './AudioInspector'
import { FilterInspector } from './FilterInspector'
import { TextInspector } from './TextInspector'
import { TransformInspector } from './TransformInspector'
import { TransitionInspector } from './TransitionInspector'
import { VisualInspector } from './VisualInspector'

const TABS: { id: PropertyTab; label: string }[] = [
  { id: 'transform', label: 'Transform' },
  { id: 'visual', label: 'Visual' },
  { id: 'audio', label: 'Audio' },
  { id: 'text', label: 'Text' },
  { id: 'filters', label: 'Filters' },
  { id: 'transitions', label: 'Transitions' },
]

function supportsTab(type: string, tab: PropertyTab) {
  if (tab === 'transform') return type === 'video' || type === 'image' || type === 'text' || type === 'sticker'
  if (tab === 'visual') return type === 'video' || type === 'image' || type === 'text' || type === 'sticker'
  if (tab === 'audio') return type === 'audio' || type === 'video'
  if (tab === 'text') return type === 'text'
  if (tab === 'filters') return type === 'video' || type === 'image' || type === 'text' || type === 'sticker'
  if (tab === 'transitions') return type !== 'audio'
  return false
}

export function PropertyInspector() {
  const { clip, track } = useSelectedClipProperties()
  const {
    inspectorOpen,
    selectedPropertyTab,
    setSelectedPropertyTab,
    closeInspector,
  } = usePropertyInspector()

  if (!inspectorOpen || !clip) return null

  const visibleTabs = TABS.filter((tab) => supportsTab(clip.type, tab.id))
  const activeTab = supportsTab(clip.type, selectedPropertyTab)
    ? selectedPropertyTab
    : visibleTabs[0]?.id ?? 'transform'

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{clip.name}</Text>
          <Text style={styles.subtitle}>{clip.type} clip properties</Text>
        </View>
        <Pressable style={styles.close} onPress={closeInspector}>
          <X size={16} color={EditorColors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {visibleTabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setSelectedPropertyTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.body}>
        {activeTab === 'transform' ? <TransformInspector clip={clip} /> : null}
        {activeTab === 'visual' ? <VisualInspector clip={clip} /> : null}
        {activeTab === 'audio' ? <AudioInspector clip={clip} muted={track?.isMuted} /> : null}
        {activeTab === 'text' ? <TextInspector clip={clip} /> : null}
        {activeTab === 'filters' ? <FilterInspector clip={clip} /> : null}
        {activeTab === 'transitions' ? <TransitionInspector clip={clip} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    borderRadius: EditorRadius.lg,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    padding: EditorSpacing.md,
    gap: EditorSpacing.md,
    ...EditorShadows.panel,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: EditorSpacing.md,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.md,
    fontWeight: '900',
  },
  subtitle: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EditorColors.surfaceSoft,
  },
  tabs: {
    gap: EditorSpacing.xs,
  },
  tab: {
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  tabActive: {
    backgroundColor: EditorColors.accentSoft,
    borderColor: EditorColors.accent,
  },
  tabText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  tabTextActive: {
    color: EditorColors.accent,
  },
  body: {
    gap: EditorSpacing.md,
  },
})
