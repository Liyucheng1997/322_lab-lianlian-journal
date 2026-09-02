import { keyOutBackground, wholeToPng, findComponents } from '../imageproc.js'
import fs from 'node:fs'
const S = process.argv[2]
const t0 = Date.now()
const k = await keyOutBackground(`${S}/test_cat.png`)
console.log('keyed in', Date.now() - t0, 'ms; fg ratio', (k.mask.reduce((a, b) => a + b, 0) / (k.width * k.height)).toFixed(3))
console.log('components', findComponents(k))
fs.writeFileSync(`${S}/test_cat_out.png`, await wholeToPng(k))
console.log('done', Date.now() - t0, 'ms')
