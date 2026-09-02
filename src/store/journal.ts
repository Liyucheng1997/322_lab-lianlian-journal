import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Journal, JournalElement, JournalPage } from '../types'

const uid = () => Math.random().toString(36).slice(2, 10)

function makePage(): JournalPage {
  return { id: uid(), elements: [] }
}

function makeJournal(templateId: string, title = '我的恋恋手账'): Journal {
  const now = Date.now()
  return { id: uid(), title, templateId, pages: [makePage(), makePage(), makePage(), makePage()], createdAt: now, updatedAt: now }
}

interface State {
  journals: Journal[]
  currentId: string
  pageIndex: number
  selectedId: string | null
  mode: 'edit' | 'read'
  // ── 手账本 ──
  createJournal: (templateId: string) => void
  deleteJournal: (id: string) => void
  selectJournal: (id: string) => void
  renameJournal: (title: string) => void
  setTemplate: (templateId: string, scope: 'all' | 'page') => void
  // ── 页 ──
  addPage: () => void
  removePage: () => void
  setPageIndex: (i: number) => void
  // ── 元素 ──
  addElement: (el: Omit<JournalElement, 'id' | 'z'>, pageIndex?: number) => string
  updateElement: (id: string, patch: Partial<JournalElement>) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void
  reorderElement: (id: string, dir: 'front' | 'back') => void
  select: (id: string | null) => void
  setMode: (m: 'edit' | 'read') => void
}

const first = makeJournal('classic-grid')

export const useJournal = create<State>()(
  persist(
    (set, get) => {
      const patchJournal = (fn: (j: Journal) => Journal) =>
        set((s) => ({ journals: s.journals.map((j) => (j.id === s.currentId ? { ...fn(j), updatedAt: Date.now() } : j)) }))
      const patchPage = (pageId: string, fn: (p: JournalPage) => JournalPage) =>
        patchJournal((j) => ({ ...j, pages: j.pages.map((p) => (p.id === pageId ? fn(p) : p)) }))
      const findPageOf = (elId: string) => {
        const j = get().journals.find((x) => x.id === get().currentId)
        return j?.pages.find((p) => p.elements.some((e) => e.id === elId))
      }

      return {
        journals: [first],
        currentId: first.id,
        pageIndex: 0,
        selectedId: null,
        mode: 'edit',

        createJournal: (templateId) => {
          const j = makeJournal(templateId)
          set((s) => ({ journals: [...s.journals, j], currentId: j.id, pageIndex: 0, selectedId: null }))
        },
        deleteJournal: (id) =>
          set((s) => {
            const rest = s.journals.filter((j) => j.id !== id)
            const list = rest.length ? rest : [makeJournal('classic-grid')]
            return { journals: list, currentId: s.currentId === id ? list[0].id : s.currentId, pageIndex: 0, selectedId: null }
          }),
        selectJournal: (id) => set({ currentId: id, pageIndex: 0, selectedId: null }),
        renameJournal: (title) => patchJournal((j) => ({ ...j, title })),
        setTemplate: (templateId, scope) => {
          if (scope === 'all') patchJournal((j) => ({ ...j, templateId, pages: j.pages.map((p) => ({ ...p, templateId: undefined })) }))
          else {
            const j = get().journals.find((x) => x.id === get().currentId)
            const page = j?.pages[get().pageIndex]
            if (page) patchPage(page.id, (p) => ({ ...p, templateId }))
          }
        },

        addPage: () => {
          patchJournal((j) => ({ ...j, pages: [...j.pages, makePage(), makePage()] }))
          const j = get().journals.find((x) => x.id === get().currentId)!
          set({ pageIndex: j.pages.length - 2 })
        },
        removePage: () => {
          const j = get().journals.find((x) => x.id === get().currentId)!
          if (j.pages.length <= 2) return
          const idx = get().pageIndex
          patchJournal((jj) => ({ ...jj, pages: jj.pages.filter((_, i) => i !== idx) }))
          set({ pageIndex: Math.max(0, Math.min(idx, j.pages.length - 2)), selectedId: null })
        },
        setPageIndex: (i) => set({ pageIndex: i, selectedId: null }),

        addElement: (el, pageIndex) => {
          const j = get().journals.find((x) => x.id === get().currentId)!
          const page = j.pages[pageIndex ?? get().pageIndex]
          if (!page) return ''
          const id = uid()
          const z = page.elements.reduce((m, e) => Math.max(m, e.z), 0) + 1
          patchPage(page.id, (p) => ({ ...p, elements: [...p.elements, { ...el, id, z }] }))
          set({ selectedId: id })
          return id
        },
        updateElement: (id, patch) => {
          const page = findPageOf(id)
          if (page) patchPage(page.id, (p) => ({ ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
        },
        removeElement: (id) => {
          const page = findPageOf(id)
          if (page) patchPage(page.id, (p) => ({ ...p, elements: p.elements.filter((e) => e.id !== id) }))
          if (get().selectedId === id) set({ selectedId: null })
        },
        duplicateElement: (id) => {
          const page = findPageOf(id)
          const el = page?.elements.find((e) => e.id === id)
          if (!page || !el) return
          const nid = uid()
          const z = page.elements.reduce((m, e) => Math.max(m, e.z), 0) + 1
          patchPage(page.id, (p) => ({ ...p, elements: [...p.elements, { ...el, id: nid, z, x: Math.min(95, el.x + 6), y: Math.min(95, el.y + 6) }] }))
          set({ selectedId: nid })
        },
        reorderElement: (id, dir) => {
          const page = findPageOf(id)
          if (!page) return
          const zs = page.elements.map((e) => e.z)
          const z = dir === 'front' ? Math.max(...zs) + 1 : Math.min(...zs) - 1
          patchPage(page.id, (p) => ({ ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, z } : e)) }))
        },
        select: (id) => set({ selectedId: id }),
        setMode: (mode) => set({ mode, selectedId: null }),
      }
    },
    { name: 'lianlian-journal-v1', partialize: (s) => ({ journals: s.journals, currentId: s.currentId }) },
  ),
)

export const useCurrentJournal = () => useJournal((s) => s.journals.find((j) => j.id === s.currentId) ?? s.journals[0])
