# 恋恋手账本 — 开发说明

Vite + React 19 + TypeScript 前端，Express + sharp 后端。`npm run dev` 同时起前端（5173）和 API（3721）。

## 关键约束

- 自定义贴画只走本地 `codex exec` 内置 image_gen（用户的 Codex 订阅额度），不要接入其他图片 API 或 Key。
- `codex exec --json` 的 `thread.started` 事件给出 thread_id，生成图固定在 `~/.codex/generated_images/<thread_id>/`；不要靠"取最新文件"定位图片。
- 服务端端口用 `API_PORT`（不能用 `PORT`：开发预览工具会把 `PORT` 设成 5173，导致和 Vite 冲突）。
- react-pageflip 只在初始化时读 props，`useMouseEvents` 等切换必须通过 `key` 重建（Book.tsx 已用 `journal.id-页数-mode` 做 key）。
- 元素坐标存的是页面百分比（x/y 中心点，w 宽度），页面固定 400×560。

## 校验

```bash
npx tsc -b                      # 前端类型检查
npx tsc -p tsconfig.server.json # 后端类型检查
npx tsx server/scripts/test_key.mts <含 test_cat.png 的目录>  # 去底流水线冒烟测试
```
