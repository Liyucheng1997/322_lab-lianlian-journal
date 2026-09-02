import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { generateWithCodex, codexAvailable, GENERATED_DIR } from './codex.js'
import { keyOutBackground, findComponents, cropToPng, wholeToPng } from './imageproc.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data', 'custom')
const TMP_DIR = path.join(__dirname, 'tmp')
const INDEX_FILE = path.join(DATA_DIR, 'index.json')
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(TMP_DIR, { recursive: true })

export interface CustomSticker {
  id: string
  name: string
  src: string
  width: number
  height: number
  createdAt: number
  source: { mode: string; threadId: string; group: string }
}

function readIndex(): CustomSticker[] {
  try { return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')) } catch { return [] }
}
function writeIndex(list: CustomSticker[]) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(list, null, 2))
}

type Mode = 'cutout' | 'split' | 'text'
type Style = 'faithful' | 'kawaii' | 'watercolor' | 'flat'

const STYLE_TEXT: Record<Style, string> = {
  faithful: 'Keep the appearance faithful to the source photo (realistic colors, shapes and details), just cleaned up with crisp edges.',
  kawaii: 'Redraw in a cute kawaii cartoon style with soft rounded shapes, big friendly eyes where appropriate, pastel colors and thin brown outlines.',
  watercolor: 'Redraw in a soft hand-painted watercolor journal style with gentle washes, slight paper texture inside the shapes and no harsh outlines.',
  flat: 'Redraw as clean flat vector illustration with simple shapes, limited palette and thin dark outlines.',
}

const COMMON_RULES = `
Hard requirements for the generated image:
- Solid pure white (#FFFFFF) background, absolutely nothing else in the background (no shadows, no gradients, no paper texture, no text, no watermark).
- Every sticker must have a thick white die-cut border (about 3% of the image width) and a thin light-gray outline at the very outer edge of that border, so the border is visually separated from the white background.
- Leave a generous white margin (at least 8%) between stickers and the image edges.
Do NOT run any shell commands and do NOT write any files. After the image is generated, reply with only the word DONE.`

function buildPrompt(mode: Mode, style: Style, hint: string) {
  const h = hint.trim() ? `\nExtra instructions from the user: ${hint.trim()}` : ''
  if (mode === 'cutout') {
    return `Look at the attached photo. Use your built-in image_gen tool to generate exactly ONE image: extract the main subject of the photo and turn it into a single die-cut sticker for a scrapbook / journal. Remove the original background completely. ${STYLE_TEXT[style]}${h}${COMMON_RULES}`
  }
  if (mode === 'split') {
    return `Look at the attached photo. Use your built-in image_gen tool to generate exactly ONE "sticker sheet" image: identify every distinct element / object / character in the photo (people, animals, food items, objects, plants, decorations, etc., up to about 9 elements) and draw each one as its OWN separate die-cut sticker. Arrange the stickers in a loose grid with large white gaps between them; stickers must NOT touch or overlap each other. Do not add any text labels. Remove the original background completely. ${STYLE_TEXT[style]}${h}${COMMON_RULES}`
  }
  return `Use your built-in image_gen tool to generate exactly ONE image containing die-cut sticker(s) for a scrapbook / journal, based on this description: "${hint.trim()}". If the description asks for multiple items, draw each as its own separate sticker with large white gaps between them, never touching. ${STYLE_TEXT[style]}${COMMON_RULES}`
}

interface Job {
  id: string
  status: 'running' | 'done' | 'error'
  log: string[]
  result?: CustomSticker[]
  error?: string
  startedAt: number
}
const jobs = new Map<string, Job>()
const JOBS_DIR = path.join(__dirname, 'data', 'jobs')
fs.mkdirSync(JOBS_DIR, { recursive: true })
const saveJob = (job: Job) => fs.writeFile(path.join(JOBS_DIR, `${job.id}.json`), JSON.stringify(job), () => {})
// 服务重启时（比如开发模式改了代码），之前还在跑的任务已经丢失，标记为出错
for (const f of fs.readdirSync(JOBS_DIR)) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(JOBS_DIR, f), 'utf8')) as Job
    if (j.status === 'running') { j.status = 'error'; j.error = '服务重启，任务中断，请重新生成'; j.log.push(j.error) }
    jobs.set(j.id, j)
  } catch { /* ignore */ }
}

async function runJob(job: Job, mode: Mode, style: Style, hint: string, photoPath?: string, name?: string) {
  const push = (s: string) => { job.log.push(s); if (job.log.length > 200) job.log.shift(); saveJob(job) }
  try {
    push('调用本地 Codex（订阅额度）生成贴纸图…')
    const res = await generateWithCodex({
      prompt: buildPrompt(mode, style, hint),
      inputImages: photoPath ? [photoPath] : [],
      cwd: TMP_DIR,
      onLog: (line) => {
        try {
          const ev = JSON.parse(line)
          if (ev.type === 'thread.started') push(`Codex 会话 ${ev.thread_id}`)
          else if (ev.type === 'item.completed' && ev.item?.type === 'agent_message') push(`Codex: ${String(ev.item.text).slice(0, 160)}`)
          else if (ev.type === 'item.started' && ev.item?.type) push(`Codex 步骤：${ev.item.type}`)
        } catch { /* ignore */ }
      },
    })
    const src = res.images[res.images.length - 1]
    push(`已生成 ${path.basename(src)}，开始去底…`)
    const keyed = await keyOutBackground(src)
    const group = crypto.randomUUID().slice(0, 8)
    const stickers: CustomSticker[] = []
    const baseName = (name || hint || (mode === 'cutout' ? '抠图贴纸' : mode === 'split' ? '拆分贴纸' : '生成贴纸')).slice(0, 20)

    const buffers: Buffer[] = []
    if (mode === 'cutout') {
      buffers.push(await wholeToPng(keyed))
    } else {
      const boxes = findComponents(keyed)
      push(`识别到 ${boxes.length} 个元素`)
      if (!boxes.length) throw new Error('没有识别到任何元素，可以换一张更清晰的图或调整提示')
      for (const b of boxes) buffers.push(await cropToPng(keyed, b))
    }
    // 同时保存原始生成图，方便追溯
    fs.copyFileSync(src, path.join(DATA_DIR, `${group}_source.png`))

    const list = readIndex()
    for (let i = 0; i < buffers.length; i++) {
      const id = `${group}_${i + 1}`
      const file = `${id}.png`
      fs.writeFileSync(path.join(DATA_DIR, file), buffers[i])
      const meta = await sharp(buffers[i]).metadata()
      const st: CustomSticker = {
        id, name: buffers.length > 1 ? `${baseName} ${i + 1}` : baseName,
        src: `/custom-stickers/${file}`,
        width: meta.width ?? 0, height: meta.height ?? 0,
        createdAt: Date.now(),
        source: { mode, threadId: res.threadId, group },
      }
      list.push(st); stickers.push(st)
    }
    writeIndex(list)
    job.result = stickers
    job.status = 'done'
    push(`完成，得到 ${stickers.length} 张贴纸`)
  } catch (e: unknown) {
    job.status = 'error'
    job.error = e instanceof Error ? e.message : String(e)
    push(`出错：${job.error}`)
  } finally {
    if (photoPath) fs.rm(photoPath, { force: true }, () => {})
  }
}

const upload = multer({ dest: TMP_DIR, limits: { fileSize: 25 * 1024 * 1024 } })
const app = express()
app.use(cors())
app.use(express.json())
app.use('/custom-stickers', express.static(DATA_DIR, { etag: true, maxAge: 0 }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, codex: codexAvailable(), generatedDir: GENERATED_DIR })
})

app.get('/api/custom-stickers', (_req, res) => {
  res.json(readIndex().sort((a, b) => b.createdAt - a.createdAt))
})

app.delete('/api/custom-stickers/:id', (req, res) => {
  const list = readIndex()
  const item = list.find((s) => s.id === req.params.id)
  if (!item) { res.status(404).json({ error: 'not found' }); return }
  fs.rm(path.join(DATA_DIR, path.basename(item.src)), { force: true }, () => {})
  writeIndex(list.filter((s) => s.id !== req.params.id))
  res.json({ ok: true })
})

app.post('/api/custom-stickers/generate', upload.single('photo'), async (req, res) => {
  const mode = (req.body.mode ?? 'cutout') as Mode
  const style = (req.body.style ?? 'faithful') as Style
  const hint = String(req.body.hint ?? '')
  const name = String(req.body.name ?? '')
  if (!['cutout', 'split', 'text'].includes(mode)) { res.status(400).json({ error: 'mode 无效' }); return }
  if (mode !== 'text' && !req.file) { res.status(400).json({ error: '请上传照片' }); return }
  if (mode === 'text' && !hint.trim()) { res.status(400).json({ error: '请填写描述' }); return }

  let photoPath: string | undefined
  if (req.file) {
    // 统一转成 png 并限制尺寸，减少 Codex 输入体积
    photoPath = path.join(TMP_DIR, `${req.file.filename}.png`)
    await sharp(req.file.path).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).png().toFile(photoPath)
    fs.rm(req.file.path, { force: true }, () => {})
  }
  const job: Job = { id: crypto.randomUUID(), status: 'running', log: [], startedAt: Date.now() }
  jobs.set(job.id, job)
  saveJob(job)
  void runJob(job, mode, style, hint, photoPath, name)
  res.json({ jobId: job.id })
})

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id)
  if (!job) { res.status(404).json({ error: 'job not found' }); return }
  res.json(job)
})

const PORT = Number(process.env.API_PORT ?? 3721)
app.listen(PORT, () => {
  console.log(`[api] http://localhost:${PORT}  codex=${codexAvailable() ? 'ok' : 'missing'}`)
})
