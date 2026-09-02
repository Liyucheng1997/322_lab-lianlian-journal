import { keyOutBackground } from '../imageproc.js'
const src = process.argv[2]
const k = await keyOutBackground(src)
const { width: W, height: H, mask } = k
const scale = Math.max(1, Math.ceil(Math.max(W, H) / 400))
const w = Math.ceil(W / scale), h = Math.ceil(H / scale)
const small = new Uint8Array(w * h)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y * W + x]) small[((y / scale) | 0) * w + ((x / scale) | 0)] = 1
const label = new Int32Array(w * h); const areas: number[] = []
for (let p0 = 0; p0 < w * h; p0++) {
  if (!small[p0] || label[p0]) continue
  const id = areas.length + 1; let a = 0; const st = [p0]; label[p0] = id
  while (st.length) { const p = st.pop()!; a++; const x = p % w
    for (const q of [x < w - 1 ? p + 1 : -1, x > 0 ? p - 1 : -1, p + w, p - w]) if (q >= 0 && q < w * h && small[q] && !label[q]) { label[q] = id; st.push(q) } }
  areas.push(a)
}
areas.sort((a, b) => b - a)
console.log('scale', scale, 'small', w, h, 'components(before dilation):', areas.length)
console.log('largest areas', areas.slice(0, 12), 'tiny(<=3px):', areas.filter((a) => a <= 3).length)
