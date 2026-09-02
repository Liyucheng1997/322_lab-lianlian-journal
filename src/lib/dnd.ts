import type { JournalElement } from '../types'

export type DragPayload = Pick<JournalElement, 'kind' | 'stickerId' | 'src' | 'aspect' | 'w' | 'animation'>

const MIME = 'application/x-lianlian-sticker'

export function setDragPayload(dt: DataTransfer, payload: DragPayload) {
  dt.setData(MIME, JSON.stringify(payload))
  dt.effectAllowed = 'copy'
}

export function readDragPayload(dt: DataTransfer): DragPayload | null {
  const raw = dt.getData(MIME)
  if (!raw) return null
  try { return JSON.parse(raw) as DragPayload } catch { return null }
}
