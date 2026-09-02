import { useCurrentJournal, useJournal } from '../store/journal'
import { ANIMATIONS } from '../data/stickers'

export const FONTS = [
  { id: '"Ma Shan Zheng", cursive', name: '马善政毛笔' },
  { id: '"Zhi Mang Xing", cursive', name: '志莽行书' },
  { id: '"Long Cang", cursive', name: '龙藏体' },
  { id: '"ZCOOL KuaiLe", cursive', name: '站酷快乐体' },
  { id: '"ZCOOL XiaoWei", serif', name: '站酷小薇' },
  { id: '"Noto Sans SC", sans-serif', name: '思源黑体' },
]

export function Inspector() {
  const journal = useCurrentJournal()
  const selectedId = useJournal((s) => s.selectedId)
  const updateElement = useJournal((s) => s.updateElement)
  const removeElement = useJournal((s) => s.removeElement)
  const duplicateElement = useJournal((s) => s.duplicateElement)
  const reorderElement = useJournal((s) => s.reorderElement)
  const el = journal.pages.flatMap((p) => p.elements).find((e) => e.id === selectedId)
  if (!el) return null

  return (
    <div className="inspector">
      <h4>已选中：{el.kind === 'text' ? '文字' : el.kind === 'custom' ? '自定义贴画' : '贴画'}</h4>
      {el.kind === 'text' && (
        <>
          <div className="row">
            <textarea className="ctl" value={el.text} rows={2} onChange={(e) => updateElement(el.id, { text: e.target.value })} />
          </div>
          <div className="row">
            <label>字体</label>
            <select className="ctl font-select" style={{ flex: 1, width: 'auto' }} value={el.font} onChange={(e) => updateElement(el.id, { font: e.target.value })}>
              {FONTS.map((f) => <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>{f.name}</option>)}
            </select>
          </div>
          <div className="row">
            <label>颜色</label>
            <input type="color" value={el.color ?? '#333333'} onChange={(e) => updateElement(el.id, { color: e.target.value })} />
            <label>字号</label>
            <input type="range" min={10} max={64} value={el.fontSize ?? 20} onChange={(e) => updateElement(el.id, { fontSize: Number(e.target.value) })} style={{ flex: 1 }} />
            <span className="hint">{el.fontSize ?? 20}</span>
          </div>
          <div className="row">
            <label>对齐</label>
            <div className="seg">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} className={(el.align ?? 'left') === a ? 'active' : ''} onClick={() => updateElement(el.id, { align: a })}>
                  {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="row">
        <label>动效</label>
        <select className="ctl" style={{ flex: 1, width: 'auto' }} value={el.animation ?? 'none'} onChange={(e) => updateElement(el.id, { animation: e.target.value as typeof el.animation })}>
          {ANIMATIONS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label>角度</label>
        <input type="number" className="ctl" style={{ width: 64 }} value={el.rotation} onChange={(e) => updateElement(el.id, { rotation: Number(e.target.value) || 0 })} />
      </div>
      <div className="row">
        <button className="btn small" onClick={() => reorderElement(el.id, 'front')}>置顶</button>
        <button className="btn small" onClick={() => reorderElement(el.id, 'back')}>置底</button>
        {el.kind !== 'text' && <button className="btn small" onClick={() => updateElement(el.id, { flipX: !el.flipX })}>镜像</button>}
        <button className="btn small" onClick={() => duplicateElement(el.id)}>复制</button>
        <button className="btn small danger" onClick={() => removeElement(el.id)}>删除</button>
      </div>
    </div>
  )
}
