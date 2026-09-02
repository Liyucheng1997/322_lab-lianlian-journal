import { useState } from 'react'
import { TEMPLATES } from '../data/templates'
import { CATEGORY_NAMES, STICKERS, type StickerCategory, type StickerDef } from '../data/stickers'
import { useCurrentJournal, useJournal } from '../store/journal'
import { setDragPayload } from '../lib/dnd'
import { CustomStickerPanel } from './CustomStickerPanel'
import { Inspector, FONTS } from './Inspector'

type Tab = 'templates' | 'stickers' | 'animated' | 'custom' | 'text'

const TABS: { id: Tab; name: string }[] = [
  { id: 'templates', name: '模板' },
  { id: 'stickers', name: '贴画' },
  { id: 'animated', name: '动态' },
  { id: 'custom', name: '自定义' },
  { id: 'text', name: '文字' },
]

function StickerCell({ def }: { def: StickerDef }) {
  const addElement = useJournal((s) => s.addElement)
  const w = def.aspect && def.aspect < 0.5 ? 45 : 22
  const add = () => addElement({ kind: 'sticker', stickerId: def.id, x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, w, rotation: Math.round(Math.random() * 20 - 10), animation: 'none' })
  return (
    <div
      className="sticker-cell"
      title={`${def.name}（点击添加，或拖到页面上）`}
      draggable
      onDragStart={(e) => setDragPayload(e.dataTransfer, { kind: 'sticker', stickerId: def.id, w, animation: 'none' })}
      onClick={add}
    >
      {def.render()}
    </div>
  )
}

function TemplatesTab() {
  const journal = useCurrentJournal()
  const pageIndex = useJournal((s) => s.pageIndex)
  const setTemplate = useJournal((s) => s.setTemplate)
  const [scope, setScope] = useState<'all' | 'page'>('all')
  const currentPageTpl = journal.pages[pageIndex]?.templateId ?? journal.templateId
  return (
    <>
      <div className="row">
        <label>应用到</label>
        <div className="seg">
          <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>整本手账</button>
          <button className={scope === 'page' ? 'active' : ''} onClick={() => setScope('page')}>仅当前页（第 {pageIndex + 1} 页）</button>
        </div>
      </div>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <div key={t.id} className={`template-card ${(scope === 'all' ? journal.templateId : currentPageTpl) === t.id ? 'active' : ''}`} onClick={() => setTemplate(t.id, scope)}>
            <div className="thumb">
              <div className="thumb-cover" style={{ ...t.cover, fontFamily: t.titleFont }}>{t.name.slice(0, 2)}</div>
              <div className="paper" style={{ ...t.page, color: (t.page.color as string) ?? t.ink }}>{t.decor?.()}</div>
            </div>
            <div className="name">{t.name}</div>
            <div className="desc">{t.desc}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function StickersTab() {
  const [cat, setCat] = useState<StickerCategory | 'all'>('all')
  const cats = (Object.keys(CATEGORY_NAMES) as StickerCategory[]).filter((c) => c !== 'animated')
  const list = STICKERS.filter((s) => s.category !== 'animated' && (cat === 'all' || s.category === cat))
  return (
    <>
      <div className="chips">
        <button className={`chip ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>全部</button>
        {cats.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{CATEGORY_NAMES[c]}</button>)}
      </div>
      <div className="sticker-grid">{list.map((s) => <StickerCell key={s.id} def={s} />)}</div>
      <p className="hint" style={{ marginTop: 12 }}>点击添加到当前页，或直接拖到想要的位置。选中后可拖动、缩放（右下角）、旋转（顶部小圆点），<kbd>Delete</kbd> 删除，方向键微调。</p>
    </>
  )
}

function AnimatedTab() {
  const list = STICKERS.filter((s) => s.category === 'animated')
  return (
    <>
      <h4>自带动画的贴画</h4>
      <div className="sticker-grid">{list.map((s) => <StickerCell key={s.id} def={s} />)}</div>
      <p className="hint" style={{ marginTop: 12 }}>任何贴画、文字或自定义贴纸，选中后都能在上方"动效"里加上弹跳、漂浮、心跳、旋转等整体动效，可以和自带动画叠加。</p>
    </>
  )
}

function TextTab() {
  const addElement = useJournal((s) => s.addElement)
  const journal = useCurrentJournal()
  const pageIndex = useJournal((s) => s.pageIndex)
  const [text, setText] = useState('今天也是恋恋的一天 ♡')
  const [font, setFont] = useState(FONTS[0].id)
  const [color, setColor] = useState('#5a3a26')
  const [size, setSize] = useState(22)
  const add = () => {
    void journal; void pageIndex
    addElement({ kind: 'text', text, font, color, fontSize: size, align: 'left', x: 50, y: 30 + Math.random() * 30, w: 60, rotation: 0, animation: 'none' })
  }
  return (
    <>
      <h4>添加文字</h4>
      <div className="row"><textarea className="ctl" value={text} onChange={(e) => setText(e.target.value)} /></div>
      <div className="row">
        <label>字体</label>
        <select className="ctl" style={{ flex: 1, width: 'auto' }} value={font} onChange={(e) => setFont(e.target.value)}>
          {FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div className="row">
        <label>颜色</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label>字号</label><input type="range" min={10} max={64} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ flex: 1 }} /><span className="hint">{size}</span>
      </div>
      <div style={{ padding: 12, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, fontFamily: font, color, fontSize: size, marginBottom: 12, minHeight: 60, whiteSpace: 'pre-wrap' }}>{text}</div>
      <button className="btn primary" onClick={add}>＋ 添加到当前页</button>
      <p className="hint" style={{ marginTop: 12 }}>添加后双击文字可直接在页面上编辑。</p>
    </>
  )
}

export function Sidebar() {
  const [tab, setTab] = useState<Tab>('templates')
  const mode = useJournal((s) => s.mode)
  return (
    <aside className="sidebar">
      <div className="tabs">
        {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.name}</button>)}
      </div>
      {mode === 'edit' && <Inspector />}
      <div className="panel">
        {mode === 'read' && <p className="hint" style={{ background: '#fff7e6', padding: 8, borderRadius: 8, marginTop: 0 }}>当前是翻阅模式：可以用鼠标拖动页角翻页。切回"编辑"才能添加和移动元素。</p>}
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'stickers' && <StickersTab />}
        {tab === 'animated' && <AnimatedTab />}
        {tab === 'custom' && <CustomStickerPanel />}
        {tab === 'text' && <TextTab />}
      </div>
    </aside>
  )
}
