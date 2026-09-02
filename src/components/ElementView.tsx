import { useEffect, useRef, useState } from 'react'
import type { JournalElement } from '../types'
import { stickerById } from '../data/stickers'
import { useJournal } from '../store/journal'

interface Props {
  el: JournalElement
  editable: boolean
  selected: boolean
  getRect: () => DOMRect
}

export function ElementView({ el, editable, selected, getRect }: Props) {
  const select = useJournal((s) => s.select)
  const updateElement = useJournal((s) => s.updateElement)
  const [editing, setEditing] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!selected) setEditing(false)
  }, [selected])

  useEffect(() => {
    if (editing && taRef.current) {
      const ta = taRef.current
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight}px`
    }
  }, [editing])

  const startDrag = (e: React.PointerEvent) => {
    if (!editable || editing) return
    e.stopPropagation()
    select(el.id)
    const rect = getRect()
    const sx = e.clientX, sy = e.clientY, ox = el.x, oy = el.y
    let moved = false
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - sx) / rect.width) * 100
      const dy = ((ev.clientY - sy) / rect.height) * 100
      if (Math.abs(dx) + Math.abs(dy) > 0.2) moved = true
      updateElement(el.id, { x: Math.max(0, Math.min(100, ox + dx)), y: Math.max(0, Math.min(100, oy + dy)) })
    }
    const onUp = () => {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
      target.removeEventListener('pointercancel', onUp)
      void moved
    }
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
    target.addEventListener('pointercancel', onUp)
  }

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation()
    const rect = getRect()
    const cx = rect.left + (el.x / 100) * rect.width
    const cy = rect.top + (el.y / 100) * rect.height
    const d0 = Math.hypot(e.clientX - cx, e.clientY - cy) || 1
    const w0 = el.w
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    const onMove = (ev: PointerEvent) => {
      const d = Math.hypot(ev.clientX - cx, ev.clientY - cy)
      updateElement(el.id, { w: Math.max(3, Math.min(150, (w0 * d) / d0)) })
    }
    const onUp = () => {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
    }
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
  }

  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation()
    const rect = getRect()
    const cx = rect.left + (el.x / 100) * rect.width
    const cy = rect.top + (el.y / 100) * rect.height
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    const onMove = (ev: PointerEvent) => {
      let deg = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90
      if (ev.shiftKey) deg = Math.round(deg / 15) * 15
      updateElement(el.id, { rotation: Math.round(deg) })
    }
    const onUp = () => {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
    }
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
  }

  const def = el.kind === 'sticker' ? stickerById(el.stickerId ?? '') : undefined
  const aspect = el.kind === 'text' ? undefined : (el.aspect ?? def?.aspect ?? 1)
  const anim = el.animation && el.animation !== 'none' ? `anim-${el.animation}` : ''

  return (
    <div
      className={`el ${editable ? 'editable' : ''} ${selected ? 'selected' : ''} ${anim}`}
      style={{
        left: `${el.x}%`,
        top: `${el.y}%`,
        width: `${el.w}%`,
        aspectRatio: aspect ? `1 / ${aspect}` : undefined,
        transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
        zIndex: el.z,
      }}
      onPointerDown={startDrag}
      onDoubleClick={(e) => {
        if (el.kind === 'text' && editable) { e.stopPropagation(); setEditing(true) }
      }}
    >
      <div className="el-body" style={{ transform: el.flipX ? 'scaleX(-1)' : undefined }}>
        {el.kind === 'sticker' && def?.render()}
        {el.kind === 'custom' && <img src={el.src} alt="" draggable={false} />}
        {el.kind === 'text' && (editing ? (
          <textarea
            ref={taRef}
            className="el-text-edit"
            defaultValue={el.text}
            style={{ fontFamily: el.font, color: el.color, fontSize: el.fontSize, textAlign: el.align }}
            onPointerDown={(e) => e.stopPropagation()}
            onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px` }}
            onBlur={(e) => { updateElement(el.id, { text: e.currentTarget.value }); setEditing(false) }}
            onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); e.stopPropagation() }}
          />
        ) : (
          <div className="el-text" style={{ fontFamily: el.font, color: el.color, fontSize: el.fontSize, textAlign: el.align }}>
            {el.text || '双击编辑文字'}
          </div>
        ))}
      </div>
      {selected && editable && !editing && (
        <>
          <div className="handle rotate" onPointerDown={startRotate} title="拖动旋转（按住 Shift 吸附 15°）" />
          <div className="handle resize" onPointerDown={startResize} title="拖动缩放" />
        </>
      )}
    </div>
  )
}
