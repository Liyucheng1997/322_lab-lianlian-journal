/** 用法：npx tsx server/scripts/rebuild_group.mts <group> [name] —— 用新算法重新拆分 data/custom/<group>_source.png 并重写索引 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { keyOutBackground, findComponents, cropToPng } from '../imageproc.js'
const [group, name = '贴纸'] = process.argv.slice(2)
const DATA = path.resolve('server/data/custom')
const idx = path.join(DATA, 'index.json')
type S = { id: string; name: string; src: string; width: number; height: number; createdAt: number; source: { mode: string; threadId: string; group: string } }
let list: S[] = JSON.parse(fs.readFileSync(idx, 'utf8'))
const old = list.filter((s) => s.source.group === group)
const threadId = old[0]?.source.threadId ?? ''
for (const s of old) fs.rmSync(path.join(DATA, path.basename(s.src)), { force: true })
list = list.filter((s) => s.source.group !== group)
const k = await keyOutBackground(path.join(DATA, `${group}_source.png`))
const boxes = findComponents(k)
for (let i = 0; i < boxes.length; i++) {
  const buf = await cropToPng(k, boxes[i])
  const file = `${group}_${i + 1}.png`
  fs.writeFileSync(path.join(DATA, file), buf)
  const m = await sharp(buf).metadata()
  list.push({ id: `${group}_${i + 1}`, name: boxes.length > 1 ? `${name} ${i + 1}` : name, src: `/custom-stickers/${file}`, width: m.width ?? 0, height: m.height ?? 0, createdAt: Date.now(), source: { mode: 'split', threadId, group } })
}
fs.writeFileSync(idx, JSON.stringify(list, null, 2))
console.log(`${group}: ${old.length} -> ${boxes.length}`)
