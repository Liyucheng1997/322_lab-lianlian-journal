import { useEffect } from 'react'
import { Toolbar } from './components/Toolbar'
import { Sidebar } from './components/Sidebar'
import { Book } from './components/Book'
import { useJournal } from './store/journal'

export default function App() {
  const mode = useJournal((s) => s.mode)

  // 全局快捷键：Delete 删除选中元素，方向键微调，Ctrl+D 复制
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      const s = useJournal.getState()
      if (!s.selectedId || s.mode !== 'edit') return
      const j = s.journals.find((x) => x.id === s.currentId)
      const el = j?.pages.flatMap((p) => p.elements).find((x) => x.id === s.selectedId)
      if (!el) return
      if (e.key === 'Delete' || e.key === 'Backspace') { s.removeElement(el.id); e.preventDefault() }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const step = e.shiftKey ? 2 : 0.5
        const d = { ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }[e.key]!
        s.updateElement(el.id, { x: el.x + d[0], y: el.y + d[1] })
        e.preventDefault(); e.stopImmediatePropagation()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { s.duplicateElement(el.id); e.preventDefault() }
      else if (e.key === 'Escape') s.select(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  return (
    <div className="app">
      <Toolbar />
      <div className="main">
        <Sidebar />
        <main className="stage" onPointerDown={(e) => { if (e.target === e.currentTarget) useJournal.getState().select(null) }}>
          <div className="stage-inner">
            <Book />
          </div>
          <div className="stage-tip">
            {mode === 'edit' ? '编辑模式：点击页面选中当前页 · 拖入贴画 · ← → 翻页' : '翻阅模式：拖动页角或点击页面翻页'}
          </div>
        </main>
      </div>
    </div>
  )
}
