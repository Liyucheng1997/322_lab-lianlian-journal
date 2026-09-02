import type { CustomSticker } from '../types'

export type GenMode = 'cutout' | 'split' | 'text'
export type GenStyle = 'faithful' | 'kawaii' | 'watercolor' | 'flat'

export interface Job {
  id: string
  status: 'running' | 'done' | 'error'
  log: string[]
  result?: CustomSticker[]
  error?: string
  startedAt: number
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  return data as T
}

export const api = {
  health: () => fetch('/api/health').then((r) => json<{ ok: boolean; codex: boolean }>(r)),
  listCustom: () => fetch('/api/custom-stickers').then((r) => json<CustomSticker[]>(r)),
  deleteCustom: (id: string) => fetch(`/api/custom-stickers/${id}`, { method: 'DELETE' }).then((r) => json<{ ok: boolean }>(r)),
  startGenerate: (form: FormData) => fetch('/api/custom-stickers/generate', { method: 'POST', body: form }).then((r) => json<{ jobId: string }>(r)),
  job: (id: string) => fetch(`/api/jobs/${id}`).then((r) => json<Job>(r)),
}
