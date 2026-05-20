// ============================================================
//  BottomSheet — Slide-up panel
//  Wraps @gorhom/bottom-sheet for consistent usage
//  Usage:
//    const sheetRef = useRef<BottomSheetRef>(null)
//    <BottomSheet ref={sheetRef} snapPoints={['40%', '80%']} title="Add Source">
//      <YourContent />
//    </BottomSheet>
//    sheetRef.current?.open()
//    sheetRef.current?.close()
// ============================================================

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { X } from 'lucide-react-native'
import { Colors, Typography, Spacing, Radius, IconSize } from '../theme/tokens'

export interface BottomSheetRef {
  open:  () => void
  close: () => void
}

interface BottomSheetProps {
  snapPoints?:  string[]
  title?:       string
  children:     React.ReactNode
  onClose?:     () => void
  scrollable?:  boolean
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      snapPoints  = ['50%'],
      title,
      children,
      onClose,
      scrollable  = false,
    },
    ref
  ) => {
    const sheetRef = useRef<GorhomBottomSheet>(null)

    useImperativeHandle(ref, () => ({
      open:  () => sheetRef.current?.snapToIndex(0),
      close: () => sheetRef.current?.close(),
    }))

    const handleClose = useCallback(() => {
      sheetRef.current?.close()
      onClose?.()
    }, [onClose])

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
          pressBehavior="close"
        />
      ),
      []
    )

    const ContentWrapper = scrollable ? BottomSheetScrollView : View

    return (
      <GorhomBottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}
        onClose={onClose}
      >
        <ContentWrapper style={scrollable ? styles.scrollContent : styles.content}>

          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={IconSize.md} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {children}

        </ContentWrapper>
      </GorhomBottomSheet>
    )
  }
)

BottomSheet.displayName = 'BottomSheet'

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius:  Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth:          1,
    borderColor:          Colors.border,
  },
  handle: {
    backgroundColor: Colors.border,
    width:           40,
  },
  content: {
    flex:              1,
    paddingHorizontal: Spacing.lg,
    paddingBottom:     Spacing['3xl'],
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom:     Spacing['3xl'],
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: Spacing.md,
    marginBottom:    Spacing.sm,
  },
  title: {
    fontSize:   Typography.md,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },
})
