/**
 * 图片后处理：把 Codex 生成的"纯白底贴纸图"去底成透明 PNG，并可拆分成多个独立元素。
 * 去底策略：从四边做洪水填充，把与背景色相近且与边缘连通的像素判为背景，
 * 这样贴纸内部的白色（比如白色描边、高光）不会被误删。
 */
import sharp from 'sharp'

export interface Keyed {
  width: number
  height: number
  rgba: Buffer      // 已写入 alpha 的 RGBA 像素
  mask: Uint8Array  // 1 = 前景
}

function colorDist(r: number, g: number, b: number, br: number, bg: number, bb: number) {
  return Math.max(Math.abs(r - br), Math.abs(g - bg), Math.abs(b - bb))
}

/** 估计背景色：取四角小块的中位数 */
function estimateBackground(data: Buffer, w: number, h: number, ch: number) {
  const samples: number[][] = [[], [], []]
  const s = Math.max(4, Math.floor(Math.min(w, h) * 0.02))
  const corners = [[0, 0], [w - s, 0], [0, h - s], [w - s, h - s]]
  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + s; y++) for (let x = cx; x < cx + s; x++) {
      const i = (y * w + x) * ch
      samples[0].push(data[i]); samples[1].push(data[i + 1]); samples[2].push(data[i + 2])
    }
  }
  const med = (a: number[]) => { a.sort((p, q) => p - q); return a[a.length >> 1] }
  return [med(samples[0]), med(samples[1]), med(samples[2])]
}

/** 四角是否基本透明（判断生成图是否自带 alpha） */
function cornersTransparent(data: Buffer, w: number, h: number) {
  const s = Math.max(4, Math.floor(Math.min(w, h) * 0.02))
  let transparent = 0, total = 0
  for (const [cx, cy] of [[0, 0], [w - s, 0], [0, h - s], [w - s, h - s]]) {
    for (let y = cy; y < cy + s; y++) for (let x = cx; x < cx + s; x++) {
      total++
      if (data[(y * w + x) * 4 + 3] < 12) transparent++
    }
  }
  return transparent / total > 0.9
}

export async function keyOutBackground(input: string | Buffer, tolerance = 28): Promise<Keyed> {
  const img = sharp(input).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height, ch = info.channels

  // 情况一：生成图本身就带透明通道（角落是透明的），直接用 alpha 当 mask
  if (ch === 4 && cornersTransparent(data, w, h)) {
    const mask = new Uint8Array(w * h)
    const rgba = Buffer.alloc(w * h * 4)
    for (let p = 0; p < w * h; p++) {
      const i = p * 4
      rgba[i] = data[i]; rgba[i + 1] = data[i + 1]; rgba[i + 2] = data[i + 2]; rgba[i + 3] = data[i + 3]
      if (data[i + 3] > 12) mask[p] = 1
    }
    return { width: w, height: h, rgba, mask }
  }

  // 情况二：纯色（通常是白色）背景，做洪水填充去底
  const [br, bg, bb] = estimateBackground(data, w, h, ch)

  const bgMask = new Uint8Array(w * h) // 1 = 背景
  const stack: number[] = []
  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (bgMask[p]) return
    const i = p * ch
    if (colorDist(data[i], data[i + 1], data[i + 2], br, bg, bb) <= tolerance) {
      bgMask[p] = 1
      stack.push(p)
    }
  }
  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1) }
  for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y) }
  while (stack.length) {
    const p = stack.pop()!
    const x = p % w, y = (p / w) | 0
    tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1)
  }

  // 边缘软化：距离背景色越近 alpha 越低（只对前景边缘 2px 内起作用）
  const mask = new Uint8Array(w * h)
  const rgba = Buffer.alloc(w * h * 4)
  for (let p = 0; p < w * h; p++) {
    const i = p * ch, o = p * 4
    rgba[o] = data[i]; rgba[o + 1] = data[i + 1]; rgba[o + 2] = data[i + 2]
    if (bgMask[p]) { rgba[o + 3] = 0; continue }
    mask[p] = 1
    const x = p % w, y = (p / w) | 0
    let nearBg = false
    for (let dy = -1; dy <= 1 && !nearBg; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && bgMask[ny * w + nx]) { nearBg = true; break }
    }
    if (nearBg) {
      const d = colorDist(data[i], data[i + 1], data[i + 2], br, bg, bb)
      const t = Math.min(1, Math.max(0, (d - tolerance) / (tolerance * 1.5)))
      rgba[o + 3] = Math.round(120 + 135 * t)
    } else {
      rgba[o + 3] = 255
    }
  }
  return { width: w, height: h, rgba, mask }
}

export interface Box { x: number; y: number; w: number; h: number; area: number }

/** 两个外接框之间的最短距离（相交为 0） */
function boxGap(a: Box, b: Box) {
  const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w))
  const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h))
  return Math.hypot(dx, dy)
}

/**
 * 在降采样 mask 上做连通域标记，返回原图坐标下的外接框。
 * 规则：大元素之间绝不合并；小碎片（胡须、飘带、掉落的小点）如果离某个大元素很近，就归并进去，
 * 否则如果面积达标就当作独立小贴纸，过小的直接丢弃。
 */
export function findComponents(keyed: Keyed, opts: { minAreaRatio?: number; mergeGapPx?: number; majorAreaRatio?: number } = {}): Box[] {
  const { width: W, height: H, mask } = keyed
  const scale = Math.max(1, Math.ceil(Math.max(W, H) / 400))
  const w = Math.ceil(W / scale), h = Math.ceil(H / scale)
  const small = new Uint8Array(w * h)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (mask[y * W + x]) small[((y / scale) | 0) * w + ((x / scale) | 0)] = 1
  }
  const label = new Int32Array(w * h)
  const raw: Box[] = []
  let cur = 0
  for (let p0 = 0; p0 < w * h; p0++) {
    if (!small[p0] || label[p0]) continue
    cur++
    let minX = w, minY = h, maxX = 0, maxY = 0, area = 0
    const st = [p0]; label[p0] = cur
    while (st.length) {
      const p = st.pop()!
      const x = p % w, y = (p / w) | 0
      area++
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y
      // 8 邻域
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const q = ny * w + nx
        if (small[q] && !label[q]) { label[q] = cur; st.push(q) }
      }
    }
    raw.push({ x: minX * scale, y: minY * scale, w: (maxX - minX + 1) * scale, h: (maxY - minY + 1) * scale, area: area * scale * scale })
  }

  const total = W * H
  const minArea = (opts.minAreaRatio ?? 0.0008) * total
  const majorArea = (opts.majorAreaRatio ?? 0.012) * total
  const mergeGap = opts.mergeGapPx ?? Math.max(24, W * 0.03)

  const majors = raw.filter((b) => b.area >= majorArea).sort((a, b) => b.area - a.area)
  const minors = raw.filter((b) => b.area < majorArea && b.area >= minArea)
  const extra: Box[] = []
  for (const m of minors) {
    let best: Box | null = null, bestGap = Infinity
    for (const M of majors) {
      const g = boxGap(m, M)
      if (g < bestGap) { bestGap = g; best = M }
    }
    if (best && bestGap <= mergeGap) {
      const x = Math.min(best.x, m.x), y = Math.min(best.y, m.y)
      const x2 = Math.max(best.x + best.w, m.x + m.w), y2 = Math.max(best.y + best.h, m.y + m.h)
      best.x = x; best.y = y; best.w = x2 - x; best.h = y2 - y; best.area += m.area
    } else {
      extra.push(m)
    }
  }
  return [...majors, ...extra]
    .map((b) => ({ ...b, x: Math.max(0, b.x), y: Math.max(0, b.y), w: Math.min(W - Math.max(0, b.x), b.w), h: Math.min(H - Math.max(0, b.y), b.h) }))
    .sort((a, b) => (a.y - b.y) || (a.x - b.x))
}

export async function cropToPng(keyed: Keyed, box: Box, pad = 6, maxSize = 800): Promise<Buffer> {
  const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
  const w = Math.min(keyed.width - x, box.w + pad * 2), h = Math.min(keyed.height - y, box.h + pad * 2)
  let s = sharp(keyed.rgba, { raw: { width: keyed.width, height: keyed.height, channels: 4 } })
    .extract({ left: x, top: y, width: w, height: h })
  if (Math.max(w, h) > maxSize) s = s.resize({ width: w >= h ? maxSize : undefined, height: h > w ? maxSize : undefined })
  return s.png().toBuffer()
}

export async function wholeToPng(keyed: Keyed, maxSize = 800): Promise<Buffer> {
  const boxes = findComponents(keyed, { minAreaRatio: 0.0005 })
  if (!boxes.length) throw new Error('去底后没有找到任何前景内容')
  const minX = Math.min(...boxes.map((b) => b.x)), minY = Math.min(...boxes.map((b) => b.y))
  const maxX = Math.max(...boxes.map((b) => b.x + b.w)), maxY = Math.max(...boxes.map((b) => b.y + b.h))
  return cropToPng(keyed, { x: minX, y: minY, w: maxX - minX, h: maxY - minY, area: 0 }, 6, maxSize)
}
