# 恋恋手账本

一个网页版手账本：多套手账模板、带 3D 翻页动画的书本、内置静态/动态贴画、可自由拖拽排版，以及用本地 Codex 图片生成把照片抠成贴纸 / 拆分成多张贴纸的"自定义贴画"功能。

## 快速开始

```bash
npm install
npm run dev
```

- 前端：http://localhost:5173（Vite）
- API：http://localhost:3721（Express，前端通过 Vite 代理访问 `/api` 和 `/custom-stickers`）

`npm run dev` 会同时启动两者。只要前端不需要自定义贴画，也可以单独 `npm run dev:web`。

## 自定义贴画依赖：本地 Codex

自定义贴画走本地 `codex` CLI 的内置 `image_gen`，消耗的是你的 Codex 订阅额度，不需要配置任何 API Key。

- 需要全局安装并登录：`npm i -g @openai/codex`，然后 `codex login`
- 服务端会自动找 `%APPDATA%\npm\node_modules\@openai\codex\bin\codex.js`，找不到时退回 PATH 里的 `codex`；也可以用环境变量 `CODEX_BIN` 指定
- 每次生成 = 一次 `codex exec --json -i <照片> "<提示词>"`，生成图会落到 `~/.codex/generated_images/<thread_id>/`，服务端据此取图

三种模式：

| 模式 | 输入 | 产出 |
| --- | --- | --- |
| 抠出主体 | 一张照片 | 1 张透明底贴纸 |
| 拆分元素 | 一张照片 | N 张贴纸（照片里每个元素一张） |
| 文字生成 | 一段描述 | 1 张或多张贴纸 |

流程：Codex 生成"纯白底 + 白色模切边"的贴纸图 → 服务端用 sharp 从四边洪水填充去底成透明 PNG → 拆分模式再做连通域切分 → 存到 `server/data/custom/`，索引在 `index.json`。

## 目录结构

```
server/
  index.ts       Express API：生成任务、贴纸库 CRUD、静态文件
  codex.ts       调用 codex exec 并定位生成的图片
  imageproc.ts   去底（洪水填充）、连通域拆分、裁剪
  data/custom/   自定义贴纸（png + index.json）
src/
  data/templates.tsx   手账模板（封面 + 内页样式 + 装饰）
  data/stickers.tsx    内置 SVG 贴画（静态 + 自带动画）
  store/journal.ts     zustand 状态（localStorage 持久化）
  components/Book.tsx  react-pageflip 翻页书
  components/PageView.tsx / ElementView.tsx   页面与可拖拽元素
  components/Sidebar.tsx / CustomStickerPanel.tsx / Toolbar.tsx / Inspector.tsx
```

## 操作提示

- 编辑模式：点击页面选中"当前页"，点击/拖拽贴画进页面；选中元素后可拖动、右下角缩放、顶部圆点旋转（按 Shift 吸附 15°）；`Delete` 删除，方向键微调，`Ctrl+D` 复制
- 翻阅模式：拖动页角或点击页面翻页；任何模式下 `←` `→` 也能翻页
- 模板可以应用到整本，也可以只给当前页换模板
- 任何元素都能加整体动效（弹跳 / 漂浮 / 心跳 / 旋转…），和贴画自带动画可叠加
- 手账数据保存在浏览器 localStorage，可用工具栏"导出 / 导入"备份 JSON

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `API_PORT` | API 端口，默认 3721 |
| `CODEX_BIN` | 自定义 codex 可执行文件路径 |
| `CODEX_HOME` | Codex 数据目录，默认 `~/.codex` |
