// ============================================================
//  Command pattern — undo-ready editing operations
// ============================================================

import type { TimelineClip } from './types'
import {
  splitClipAtPlayhead,
  trimClipLeft,
  trimClipRight,
  reorderClips,
  removeClip,
} from './timelineEngine'

export interface EditorCommand {
  readonly type: string
  apply(clips: TimelineClip[]): TimelineClip[]
}

export class SplitAtPlayheadCommand implements EditorCommand {
  readonly type = 'SPLIT'

  constructor(
    private clipId: string,
    private playhead: number,
  ) {}

  apply(clips: TimelineClip[]): TimelineClip[] {
    return splitClipAtPlayhead(clips, this.clipId, this.playhead)
  }
}

export class TrimLeftCommand implements EditorCommand {
  readonly type = 'TRIM_LEFT'

  constructor(
    private clipId: string,
    private newStart: number,
  ) {}

  apply(clips: TimelineClip[]): TimelineClip[] {
    return clips.map((c) =>
      c.id === this.clipId ? trimClipLeft(c, this.newStart) : c,
    )
  }
}

export class TrimRightCommand implements EditorCommand {
  readonly type = 'TRIM_RIGHT'

  constructor(
    private clipId: string,
    private newEnd: number,
  ) {}

  apply(clips: TimelineClip[]): TimelineClip[] {
    return clips.map((c) =>
      c.id === this.clipId ? trimClipRight(c, this.newEnd) : c,
    )
  }
}

export class ReorderCommand implements EditorCommand {
  readonly type = 'REORDER'

  constructor(
    private fromIndex: number,
    private toIndex: number,
  ) {}

  apply(clips: TimelineClip[]): TimelineClip[] {
    return reorderClips(clips, this.fromIndex, this.toIndex)
  }
}

export class DeleteClipCommand implements EditorCommand {
  readonly type = 'DELETE'

  constructor(private clipId: string) {}

  apply(clips: TimelineClip[]): TimelineClip[] {
    return removeClip(clips, this.clipId)
  }
}

export function applyCommand(
  clips: TimelineClip[],
  command: EditorCommand,
): TimelineClip[] {
  return command.apply(clips)
}
