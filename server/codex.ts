/**
 * 通过本地 Codex CLI（订阅额度）调用其内置 image_gen 生成图片。
 * 流程：codex exec --json -i <参考图> "<prompt>"  →  解析 thread_id
 *      → 在 ~/.codex/generated_images/<thread_id>/ 下取新生成的 png。
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), '.codex')
export const GENERATED_DIR = path.join(CODEX_HOME, 'generated_images')

function resolveCodexEntry(): { cmd: string; args: string[] } {
  if (process.env.CODEX_BIN) return { cmd: process.env.CODEX_BIN, args: [] }
  const appData = process.env.APPDATA
  if (appData) {
    const js = path.join(appData, 'npm', 'node_modules', '@openai', 'codex', 'bin', 'codex.js')
    if (fs.existsSync(js)) return { cmd: process.execPath, args: [js] }
  }
  return { cmd: process.platform === 'win32' ? 'codex.cmd' : 'codex', args: [] }
}

export interface CodexImageResult {
  threadId: string
  images: string[]
  lastMessage: string
  log: string
}

export interface GenerateOptions {
  prompt: string
  inputImages?: string[]
  cwd: string
  timeoutMs?: number
  onLog?: (line: string) => void
}

export function codexAvailable(): boolean {
  const { cmd, args } = resolveCodexEntry()
  if (args.length) return fs.existsSync(args[0])
  return true
}

export async function generateWithCodex(opts: GenerateOptions): Promise<CodexImageResult> {
  const { cmd, args: baseArgs } = resolveCodexEntry()
  const args = [
    ...baseArgs,
    'exec',
    '--json',
    '--skip-git-repo-check',
    '-s', 'read-only',
    '-C', opts.cwd,
  ]
  for (const img of opts.inputImages ?? []) args.push('-i', img)
  args.push('-') // prompt 从 stdin 读取，避免命令行转义问题

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, windowsHide: true })
    let stdout = ''
    let stderr = ''
    let threadId = ''
    let lastMessage = ''
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error(`Codex 超时（${(opts.timeoutMs ?? 300000) / 1000}s）`))
    }, opts.timeoutMs ?? 300000)

    child.stdout.on('data', (d) => {
      const text = d.toString()
      stdout += text
      for (const line of text.split(/\r?\n/)) {
        if (!line.trim()) continue
        opts.onLog?.(line)
        try {
          const ev = JSON.parse(line)
          if (ev.type === 'thread.started' && ev.thread_id) threadId = ev.thread_id
          if (ev.type === 'item.completed' && ev.item?.type === 'agent_message') lastMessage = ev.item.text ?? ''
        } catch {
          /* 非 JSON 行忽略 */
        }
      }
    })
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('error', (e) => { clearTimeout(timer); reject(e) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (!threadId) {
        return reject(new Error(`Codex 未返回 thread_id（exit=${code}）\n${stderr.slice(-800)}\n${stdout.slice(-800)}`))
      }
      const dir = path.join(GENERATED_DIR, threadId)
      let images: string[] = []
      if (fs.existsSync(dir)) {
        images = fs.readdirSync(dir)
          .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
          .map((f) => path.join(dir, f))
          .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
      }
      if (!images.length) {
        return reject(new Error(`Codex 完成但没有生成图片（thread ${threadId}）。最后回复：${lastMessage.slice(0, 300)}\n${stderr.slice(-500)}`))
      }
      resolve({ threadId, images, lastMessage, log: stdout })
    })

    child.stdin.write(opts.prompt)
    child.stdin.end()
  })
}
