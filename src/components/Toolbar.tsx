import { useRef } from 'react'
import { useCurrentJournal, useJournal } from '../store/journal'
import { templateById } from '../data/templates'
import type { Journal } from '../types'

export function Toolbar() {
  const journal = useCurrentJournal()
  const journals = useJournal((s) => s.journals)
  const pageIndex = useJournal((s) => s.pageIndex)
  const mode = useJournal((s) => s.mode)
  const { renameJournal, selectJournal, createJournal, deleteJournal, addPage, removePage, setMode, setPageIndex } = useJournal()
  const fileRef = useRef<HTMLInputElement>(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(journal, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${journal.title || 'journal'}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importJson = async (f: File) => {
    try {
      const j = JSON.parse(await f.text()) as Journal
      if (!j.pages || !j.templateId) throw new Error('格式不对')
      const id = Math.random().toString(36).slice(2, 10)
      useJournal.setState((s) => ({ journals: [...s.journals, { ...j, id, title: `${j.title}（导入）` }], currentId: id, pageIndex: 0, selectedId: null }))
    } catch (e) {
      alert(`导入失败：${(e as Error).message}`)
    }
  }

  return (
    <header className="toolbar">
      <div className="brand">📔 恋恋手账本</div>
      <select className="ctl" style={{ width: 170 }} value={journal.id} onChange={(e) => selectJournal(e.target.value)}>
        {journals.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
      </select>
      <input className="title-input" value={journal.title} onChange={(e) => renameJournal(e.target.value)} placeholder="手账标题" />
      <span className="hint">{templateById(journal.templateId).name}</span>
      <button className="btn small" onClick={() => createJournal(journal.templateId)}>＋ 新建</button>
      <button className="btn small danger" onClick={() => { if (confirm(`删除手账「${journal.title}」？`)) deleteJournal(journal.id) }}>删除</button>
      <div className="sep" />
      <button className="btn small" onClick={exportJson}>导出</button>
      <button className="btn small" onClick={() => fileRef.current?.click()}>导入</button>
      <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
      <div className="spacer" />
      <div className="seg">
        <button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}>✏️ 编辑</button>
        <button className={mode === 'read' ? 'active' : ''} onClick={() => setMode('read')}>📖 翻阅</button>
      </div>
      <div className="sep" />
      <button className="btn small icon" onClick={() => setPageIndex(Math.max(0, pageIndex - 2))} title="上一跨页">‹</button>
      <span className="page-indicator">第 {pageIndex + 1} / {journal.pages.length} 页</span>
      <button className="btn small icon" onClick={() => setPageIndex(Math.min(journal.pages.length - 1, pageIndex + 2))} title="下一跨页">›</button>
      <button className="btn small" onClick={addPage} title="在末尾加一跨页（两页）">＋ 加页</button>
      <button className="btn small danger" disabled={journal.pages.length <= 2} onClick={() => { if (confirm(`删除第 ${pageIndex + 1} 页？`)) removePage() }}>－ 删页</button>
    </header>
  )
}
