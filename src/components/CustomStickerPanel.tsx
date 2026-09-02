import { useEffect, useRef, useState } from 'react'
import type { CustomSticker } from '../types'
import { api, type GenMode, type GenStyle, type Job } from '../lib/api'
import { useJournal } from '../store/journal'
import { setDragPayload } from '../lib/dnd'

const MODES: { id: GenMode; name: string; desc: string }[] = [
  { id: 'cutout', name: '抠出主体', desc: '把照片主体抠成一张贴纸' },
  { id: 'split', name: '拆分元素', desc: '把照片里的各个元素拆成多张贴纸' },
  { id: 'text', name: '文字生成', desc: '不用照片，按描述生成贴纸' },
]
const STYLES: { id: GenStyle; name: string }[] = [
  { id: 'faithful', name: '写实还原' },
  { id: 'kawaii', name: '可爱卡通' },
  { id: 'watercolor', name: '水彩手绘' },
  { id: 'flat', name: '扁平插画' },
]

export function CustomStickerPanel() {
  const addElement = useJournal((s) => s.addElement)
  const [list, setList] = useState<CustomSticker[]>([])
  const [health, setHealth] = useState<{ ok: boolean; codex: boolean } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [mode, setMode] = useState<GenMode>('cutout')
  const [style, setStyle] = useState<GenStyle>('faithful')
  const [hint, setHint] = useState('')
  const [name, setName] = useState('')
  const [job, setJob] = useState<Job | null>(null)
  const [over, setOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  const refresh = () => api.listCustom().then(setList).catch(() => setList([]))
  useEffect(() => {
    refresh()
    api.health().then(setHealth).catch(() => setHealth({ ok: false, codex: false }))
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [])

  const pick = (f: File | null) => {
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  const running = job?.status === 'running'

  const generate = async () => {
    if (running) return
    const form = new FormData()
    if (file) form.append('photo', file)
    form.append('mode', mode)
    form.append('style', style)
    form.append('hint', hint)
    form.append('name', name)
    try {
      const { jobId } = await api.startGenerate(form)
      setJob({ id: jobId, status: 'running', log: ['已提交…'], startedAt: Date.now() })
      timer.current = window.setInterval(async () => {
        try {
          const j = await api.job(jobId)
          setJob(j)
          if (j.status !== 'running') {
            if (timer.current) window.clearInterval(timer.current)
            timer.current = null
            if (j.status === 'done') refresh()
          }
        } catch (e) {
          if (timer.current) window.clearInterval(timer.current)
          setJob((old) => old ? { ...old, status: 'error', error: (e as Error).message } : old)
        }
      }, 1500)
    } catch (e) {
      setJob({ id: '', status: 'error', log: [], error: (e as Error).message, startedAt: Date.now() })
    }
  }

  const add = (s: CustomSticker) => {
    const aspect = s.height / s.width
    addElement({ kind: 'custom', src: s.src, aspect, x: 35 + Math.random() * 30, y: 35 + Math.random() * 30, w: 32, rotation: Math.round(Math.random() * 16 - 8), animation: 'none' })
  }

  const remove = async (s: CustomSticker) => {
    if (!confirm(`删除贴纸「${s.name}」？`)) return
    await api.deleteCustom(s.id)
    refresh()
  }

  const canRun = !running && (mode === 'text' ? hint.trim().length > 0 : !!file)

  return (
    <div>
      <h4>
        <span className={`status-dot ${health?.codex ? 'ok' : 'bad'}`} />
        自定义贴画 · 由本地 Codex 图片生成驱动
      </h4>
      {health && !health.ok && <p className="hint" style={{ color: '#c0392b' }}>后端未启动，请运行 <kbd>npm run dev</kbd>（会同时启动前端和 API）。</p>}
      {health?.ok && !health.codex && <p className="hint" style={{ color: '#c0392b' }}>没找到本地 Codex CLI，请确认已 <kbd>npm i -g @openai/codex</kbd> 并登录。</p>}

      <div className="chips">
        {MODES.map((m) => (
          <button key={m.id} className={`chip ${mode === m.id ? 'active' : ''}`} title={m.desc} onClick={() => setMode(m.id)}>{m.name}</button>
        ))}
      </div>
      <p className="hint" style={{ marginTop: -6 }}>{MODES.find((m) => m.id === mode)?.desc}</p>

      {mode !== 'text' && (
        <div
          className={`dropzone ${over ? 'over' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) pick(f) }}
        >
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          {preview ? <img src={preview} alt="预览" /> : <>点击或拖入一张照片<br /><span style={{ fontSize: 11 }}>JPG / PNG / WebP，最大 25MB</span></>}
        </div>
      )}

      <div className="row" style={{ marginTop: 10 }}>
        <label>风格</label>
        <select className="ctl" style={{ flex: 1, width: 'auto' }} value={style} onChange={(e) => setStyle(e.target.value as GenStyle)}>
          {STYLES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="row">
        <textarea
          className="ctl"
          placeholder={mode === 'text' ? '描述你想要的贴纸，例如：三只不同表情的小柴犬、一杯冒热气的抹茶拿铁…' : '可选：补充说明，例如"只要左边那只狗"、"把蛋糕和蜡烛分开"'}
          value={hint}
          onChange={(e) => setHint(e.target.value)}
        />
      </div>
      <div className="row">
        <input className="ctl" placeholder="贴纸名称（可选）" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary" disabled={!canRun} onClick={generate} style={{ whiteSpace: 'nowrap' }}>
          {running ? <><span className="spinner" /> 生成中…</> : '✨ 生成贴纸'}
        </button>
      </div>

      {job && (
        <div className="log">
          {job.log.map((l, i) => <div key={i}>{l}</div>)}
          {job.status === 'error' && <div className="err">✖ {job.error}</div>}
          {job.status === 'running' && <div>… 一般需要 30 秒到 2 分钟（{Math.round((Date.now() - job.startedAt) / 1000)}s）</div>}
        </div>
      )}
      {job?.status === 'done' && job.result && (
        <div className="result-strip">
          {job.result.map((s) => (
            <div key={s.id} className="sticker-cell" style={{ width: 64 }} onClick={() => add(s)} title="点击添加到当前页">
              <img src={s.src} alt={s.name} />
            </div>
          ))}
          <p className="hint" style={{ width: '100%' }}>已加入下方贴纸库，点击即可添加到当前页。</p>
        </div>
      )}

      <h4 style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8 }}>我的贴纸库（{list.length}）<button className="btn small" onClick={refresh}>刷新</button></h4>
      {list.length === 0 ? (
        <div className="empty">还没有自定义贴纸，上传一张照片试试吧</div>
      ) : (
        <div className="sticker-grid">
          {list.map((s) => (
            <div
              key={s.id}
              className="sticker-cell"
              title={`${s.name}（点击添加，或拖到页面上）`}
              draggable
              onDragStart={(e) => setDragPayload(e.dataTransfer, { kind: 'custom', src: s.src, aspect: s.height / s.width, w: 32, animation: 'none' })}
              onClick={() => add(s)}
            >
              <img src={s.src} alt={s.name} loading="lazy" />
              <button className="del" title="删除" onClick={(e) => { e.stopPropagation(); remove(s) }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
