import { forwardRef, useRef, useState } from 'react'
import type { JournalPage } from '../types'
import { templateById } from '../data/templates'
import { useJournal } from '../store/journal'
import { ElementView } from './ElementView'
import { readDragPayload } from '../lib/dnd'

interface Props {
  page: JournalPage
  index: number
  journalTemplateId: string
  side: 'left' | 'right'
}

export const PageView = forwardRef<HTMLDivElement, Props>(function PageView({ page, index, journalTemplateId, side }, ref) {
  const tpl = templateById(page.templateId ?? journalTemplateId)
  const mode = useJournal((s) => s.mode)
  const selectedId = useJournal((s) => s.selectedId)
  const pageIndex = useJournal((s) => s.pageIndex)
  const select = useJournal((s) => s.select)
  const addElement = useJournal((s) => s.addElement)
  const innerRef = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState(false)
  const editable = mode === 'edit'
  const isActive = editable && pageIndex === index

  const getRect = () => innerRef.current!.getBoundingClientRect()

  return (
    <div ref={ref} className={`page ${isActive ? 'active-page' : ''} ${over ? 'drop-target' : ''}`}>
      <div
        ref={innerRef}
        className="page-inner"
        style={{ ...tpl.page, color: (tpl.page.color as string) ?? tpl.ink }}
        onPointerDown={() => {
          if (!editable) return
          select(null)
          if (pageIndex !== index) useJournal.setState({ pageIndex: index })
        }}
        onDragOver={(e) => { if (editable) { e.preventDefault(); setOver(true) } }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          setOver(false)
          if (!editable) return
          const payload = readDragPayload(e.dataTransfer)
          if (!payload) return
          e.preventDefault()
          const r = getRect()
          const x = ((e.clientX - r.left) / r.width) * 100
          const y = ((e.clientY - r.top) / r.height) * 100
          addElement({ ...payload, x, y, rotation: 0 }, index)
        }}
      >
        {tpl.decor?.()}
        {[...page.elements].sort((a, b) => a.z - b.z).map((el) => (
          <ElementView key={el.id} el={el} editable={editable} selected={selectedId === el.id} getRect={getRect} />
        ))}
        <div className={`page-shade ${side === 'left' ? 'right' : 'left'}`} />
        <div className={`page-number ${side}`} style={{ color: tpl.ink }}>{index + 1}</div>
      </div>
    </div>
  )
})
