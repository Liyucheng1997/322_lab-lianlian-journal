import { forwardRef, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useCurrentJournal, useJournal } from '../store/journal'
import { templateById } from '../data/templates'
import { PageView } from './PageView'

export const PAGE_W = 400
export const PAGE_H = 560

interface CoverProps { title: string; templateId: string; back?: boolean }
const Cover = forwardRef<HTMLDivElement, CoverProps>(function Cover({ title, templateId, back }, ref) {
  const tpl = templateById(templateId)
  return (
    <div ref={ref} className="page --hard" data-density="hard">
      <div className={`cover ${back ? 'back' : ''}`} style={{ ...tpl.cover, fontFamily: tpl.titleFont }}>
        <div className={`cover-spine ${back ? 'right' : 'left'}`} />
        {back ? (
          <>
            <div className="cover-deco">✿</div>
            <div className="cover-title">The End</div>
            <div className="cover-sub">恋恋手账本</div>
          </>
        ) : (
          <>
            <div className="cover-deco">📔</div>
            <div className="cover-title">{title || '我的手账'}</div>
            <div className="cover-sub">{tpl.name} · LIANLIAN JOURNAL</div>
          </>
        )}
      </div>
    </div>
  )
})

// react-pageflip 的实例类型没有导出，这里只声明用到的方法
interface FlipBookHandle {
  pageFlip: () => { flipNext: () => void; flipPrev: () => void; turnToPage: (n: number) => void; getCurrentPageIndex: () => number }
}

export function Book() {
  const journal = useCurrentJournal()
  const mode = useJournal((s) => s.mode)
  const pageIndex = useJournal((s) => s.pageIndex)
  const setPageIndex = useJournal((s) => s.setPageIndex)
  const ref = useRef<FlipBookHandle | null>(null)

  // 书籍页码：0 = 封面，1..n = 内页，n+1 = 封底
  const bookPage = Math.min(journal.pages.length + 1, pageIndex + 1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') ref.current?.pageFlip().flipNext()
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') ref.current?.pageFlip().flipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 外部改变 pageIndex（比如工具栏跳页）时同步翻到对应页
  useEffect(() => {
    const fb = ref.current?.pageFlip()
    if (!fb) return
    const cur = fb.getCurrentPageIndex()
    const spread = (n: number) => (n === 0 ? 0 : Math.floor((n - 1) / 2) * 2 + 1)
    if (spread(cur) !== spread(bookPage)) fb.turnToPage(bookPage)
  }, [bookPage])

  return (
    <div className="book-wrap">
      <HTMLFlipBook
        key={`${journal.id}-${journal.pages.length}-${mode}`}
        ref={ref as never}
        className="book"
        style={{}}
        width={PAGE_W}
        height={PAGE_H}
        size="fixed"
        minWidth={PAGE_W}
        maxWidth={PAGE_W}
        minHeight={PAGE_H}
        maxHeight={PAGE_H}
        startPage={bookPage}
        drawShadow
        maxShadowOpacity={0.4}
        flippingTime={900}
        usePortrait={false}
        startZIndex={0}
        autoSize
        showCover
        mobileScrollSupport={false}
        clickEventForward={false}
        useMouseEvents={mode === 'read'}
        swipeDistance={30}
        showPageCorners={mode === 'read'}
        disableFlipByClick={false}
        onFlip={(e: { data: number }) => {
          const n = e.data
          const idx = Math.max(0, Math.min(journal.pages.length - 1, n - 1))
          if (idx !== useJournal.getState().pageIndex) setPageIndex(idx)
        }}
      >
        <Cover title={journal.title} templateId={journal.templateId} />
        {journal.pages.map((p, i) => (
          <PageView key={p.id} page={p} index={i} journalTemplateId={journal.templateId} side={i % 2 === 0 ? 'left' : 'right'} />
        ))}
        <Cover title={journal.title} templateId={journal.templateId} back />
      </HTMLFlipBook>
      <div className="book-nav">
        <button className="btn" onClick={() => ref.current?.pageFlip().flipPrev()}>‹ 上一页</button>
        <button className="btn" onClick={() => ref.current?.pageFlip().turnToPage(0)}>封面</button>
        <button className="btn" onClick={() => ref.current?.pageFlip().flipNext()}>下一页 ›</button>
      </div>
    </div>
  )
}
