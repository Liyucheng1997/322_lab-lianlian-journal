/** 用法：npx tsx server/scripts/resplit.mts <生成的贴纸图.png> <输出目录>  —— 不调用 Codex，只重跑去底 + 拆分 */
import fs from 'node:fs'
import path from 'node:path'
import { keyOutBackground, findComponents, cropToPng } from '../imageproc.js'
const [src, out] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const k = await keyOutBackground(src)
const boxes = findComponents(k)
console.log(`components: ${boxes.length}`)
for (let i = 0; i < boxes.length; i++) {
  const b = boxes[i]
  fs.writeFileSync(path.join(out, `part_${i + 1}.png`), await cropToPng(k, b))
  console.log(i + 1, JSON.stringify(b))
}
