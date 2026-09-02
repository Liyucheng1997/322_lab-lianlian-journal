export type ElementKind = 'sticker' | 'custom' | 'text'

export type AnimationId =
  | 'none' | 'bounce' | 'float' | 'spin' | 'wiggle' | 'pulse' | 'swing' | 'sparkle' | 'shake'

export interface JournalElement {
  id: string
  kind: ElementKind
  /** 中心点，页面宽/高的百分比 */
  x: number
  y: number
  /** 宽度，页面宽度的百分比 */
  w: number
  rotation: number
  z: number
  /** 内置贴画 id */
  stickerId?: string
  /** 自定义贴画图片地址 */
  src?: string
  /** 高/宽 */
  aspect?: number
  text?: string
  font?: string
  color?: string
  fontSize?: number
  align?: 'left' | 'center' | 'right'
  animation?: AnimationId
  flipX?: boolean
}

export interface JournalPage {
  id: string
  /** 覆盖整本的模板 */
  templateId?: string
  elements: JournalElement[]
}

export interface Journal {
  id: string
  title: string
  templateId: string
  pages: JournalPage[]
  createdAt: number
  updatedAt: number
}

export interface CustomSticker {
  id: string
  name: string
  src: string
  width: number
  height: number
  createdAt: number
  source: { mode: string; threadId: string; group: string }
}
