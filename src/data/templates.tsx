import type { CSSProperties, ReactNode } from 'react'

export interface TemplateDef {
  id: string
  name: string
  desc: string
  /** 封面样式 */
  cover: CSSProperties
  coverTitleStyle?: CSSProperties
  /** 内页背景 */
  page: CSSProperties
  /** 内页附加装饰（计划表格线等） */
  decor?: () => ReactNode
  /** 默认文字颜色 */
  ink: string
  titleFont: string
}

const lineOverlay = (color: string, gap = 28, offset = 40) => ({
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${gap - 1}px, ${color} ${gap - 1}px, ${color} ${gap}px)`,
  backgroundPosition: `0 ${offset}px`,
})
const gridOverlay = (color: string, gap = 24) => ({
  backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
  backgroundSize: `${gap}px ${gap}px`,
})
const dotOverlay = (color: string, gap = 20) => ({
  backgroundImage: `radial-gradient(${color} 1.3px, transparent 1.5px)`,
  backgroundSize: `${gap}px ${gap}px`,
  backgroundPosition: `${gap / 2}px ${gap / 2}px`,
})

const DailyDecor = () => (
  <svg className="page-decor" viewBox="0 0 400 560" preserveAspectRatio="none">
    <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55">
      <rect x="28" y="26" width="344" height="46" rx="8" />
      <line x1="120" y1="26" x2="120" y2="72" />
      <text x="40" y="55" fontSize="13" fill="currentColor" stroke="none" opacity=".8">DATE</text>
      <text x="135" y="55" fontSize="13" fill="currentColor" stroke="none" opacity=".8">TODAY'S MOOD ☺ ☹ ☼</text>
      <rect x="28" y="92" width="200" height="300" rx="8" />
      <text x="40" y="112" fontSize="12" fill="currentColor" stroke="none" opacity=".8">TO DO</text>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x="40" y={126 + i * 28} width="11" height="11" rx="2" />
          <line x1="58" y1={137 + i * 28} x2="216" y2={137 + i * 28} strokeDasharray="2 3" />
        </g>
      ))}
      <rect x="244" y="92" width="128" height="300" rx="8" />
      <text x="256" y="112" fontSize="12" fill="currentColor" stroke="none" opacity=".8">TIME</text>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <text x="254" y={137 + i * 22} fontSize="10" fill="currentColor" stroke="none" opacity=".7">{String(8 + i).padStart(2, '0')}:00</text>
          <line x1="292" y1={133 + i * 22} x2="364" y2={133 + i * 22} />
        </g>
      ))}
      <rect x="28" y="410" width="344" height="122" rx="8" />
      <text x="40" y="430" fontSize="12" fill="currentColor" stroke="none" opacity=".8">NOTES</text>
    </g>
  </svg>
)

const WeeklyDecor = () => (
  <svg className="page-decor" viewBox="0 0 400 560" preserveAspectRatio="none">
    <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55">
      <text x="28" y="44" fontSize="20" fill="currentColor" stroke="none" opacity=".85" fontWeight="bold">WEEKLY PLAN</text>
      <line x1="28" y1="54" x2="372" y2="54" strokeWidth="2" />
      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const x = 28 + col * 176, y = 70 + row * 118
        const w = i === 6 ? 344 : 168
        return (
          <g key={d}>
            <rect x={x} y={y} width={w} height="106" rx="8" />
            <rect x={x} y={y} width="46" height="22" rx="6" fill="currentColor" opacity=".12" stroke="none" />
            <text x={x + 8} y={y + 16} fontSize="11" fill="currentColor" stroke="none" fontWeight="bold">{d}</text>
            {[0, 1, 2].map((k) => <line key={k} x1={x + 10} y1={y + 44 + k * 20} x2={x + w - 10} y2={y + 44 + k * 20} strokeDasharray="2 3" />)}
          </g>
        )
      })}
    </g>
  </svg>
)

const VintageDecor = () => (
  <svg className="page-decor" viewBox="0 0 400 560" preserveAspectRatio="none">
    <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".5">
      <rect x="14" y="14" width="372" height="532" rx="4" />
      <rect x="20" y="20" width="360" height="520" rx="2" strokeWidth=".8" />
      <path d="M14 40 q 14 -14 26 -26 M386 40 q -14 -14 -26 -26 M14 520 q 14 14 26 26 M386 520 q -14 14 -26 26" />
    </g>
  </svg>
)

const PolaroidDecor = () => (
  <svg className="page-decor" viewBox="0 0 400 560" preserveAspectRatio="none">
    <g opacity=".9">
      <g transform="rotate(-4 120 170)">
        <rect x="40" y="70" width="160" height="190" fill="#fff" stroke="#e5ddd0" />
        <rect x="52" y="82" width="136" height="136" fill="#efe9e0" />
      </g>
      <g transform="rotate(3 280 380)">
        <rect x="200" y="280" width="160" height="190" fill="#fff" stroke="#e5ddd0" />
        <rect x="212" y="292" width="136" height="136" fill="#efe9e0" />
      </g>
    </g>
  </svg>
)

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'classic-grid', name: '经典方格', desc: '奶油纸 + 细方格，万能百搭',
    cover: { background: 'linear-gradient(135deg,#f6d365,#fda085)', color: '#5a3b16' },
    page: { background: '#fffdf5', ...gridOverlay('rgba(120,100,60,.14)') },
    ink: '#4a3b2a', titleFont: '"ZCOOL KuaiLe", "Ma Shan Zheng", cursive',
  },
  {
    id: 'dot-grid', name: '点阵手账', desc: '白纸点阵，排版自由',
    cover: { background: 'linear-gradient(160deg,#e0e7ff,#c7d2fe)', color: '#3730a3' },
    page: { background: '#ffffff', ...dotOverlay('rgba(90,90,120,.35)') },
    ink: '#333', titleFont: '"ZCOOL XiaoWei", serif',
  },
  {
    id: 'lined', name: '横线笔记', desc: '淡黄横线纸，适合长文字',
    cover: { background: 'linear-gradient(135deg,#fceabb,#f8b500)', color: '#6b4400' },
    page: { background: '#fffbe6', ...lineOverlay('rgba(150,120,60,.28)') },
    ink: '#5a4630', titleFont: '"Long Cang", cursive',
  },
  {
    id: 'kraft', name: '牛皮纸复古', desc: '牛皮纸质感，配复古贴纸绝了',
    cover: { background: 'linear-gradient(135deg,#8d6e4e,#5d4030)', color: '#f4e4c8' },
    page: {
      background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.18), transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,0,0,.08), transparent 45%), #d9b98a',
    },
    ink: '#4b2e1a', titleFont: '"Zhi Mang Xing", cursive',
  },
  {
    id: 'sakura', name: '樱花粉', desc: '粉嫩少女心，春日限定',
    cover: { background: 'linear-gradient(135deg,#ffd1dc,#ff9eb5)', color: '#8a2c4a' },
    page: { background: '#fff4f7', ...dotOverlay('rgba(240,120,150,.35)', 22) },
    ink: '#8a3b55', titleFont: '"Ma Shan Zheng", cursive',
  },
  {
    id: 'mint', name: '薄荷清新', desc: '薄荷绿方格，夏天的味道',
    cover: { background: 'linear-gradient(135deg,#a8edea,#6fd6c8)', color: '#0f5e57' },
    page: { background: '#f2fffb', ...gridOverlay('rgba(40,160,140,.16)', 26) },
    ink: '#1f5f57', titleFont: '"ZCOOL KuaiLe", cursive',
  },
  {
    id: 'starry', name: '星空夜', desc: '深蓝夜空 + 星点，适合夜记',
    cover: { background: 'radial-gradient(circle at 30% 20%, #4f6bd8, transparent 50%), linear-gradient(160deg,#1b2350,#0b0f2b)', color: '#ffe9a8' },
    page: {
      background:
        'radial-gradient(1.5px 1.5px at 30px 40px, #fff 60%, transparent), radial-gradient(1px 1px at 120px 90px, #fff 60%, transparent), radial-gradient(1.5px 1.5px at 210px 30px, #fff 60%, transparent), radial-gradient(1px 1px at 300px 140px, #fff 60%, transparent), radial-gradient(1.8px 1.8px at 80px 220px, #fff 60%, transparent), radial-gradient(1px 1px at 350px 260px, #fff 60%, transparent), radial-gradient(1.5px 1.5px at 160px 330px, #fff 60%, transparent), radial-gradient(1px 1px at 40px 420px, #fff 60%, transparent), radial-gradient(1.4px 1.4px at 260px 470px, #fff 60%, transparent), radial-gradient(1px 1px at 330px 520px, #fff 60%, transparent), linear-gradient(180deg,#1c2455,#0e1230)',
    },
    ink: '#f3ecd2', titleFont: '"ZCOOL XiaoWei", serif',
  },
  {
    id: 'vintage', name: '复古信笺', desc: '米色信纸配双线边框',
    cover: { background: 'linear-gradient(135deg,#c9b79c,#8f7a5a)', color: '#3b2a17' },
    page: { background: '#f5eddc', ...lineOverlay('rgba(120,90,50,.18)', 26, 60), color: '#7a5a34' },
    decor: VintageDecor,
    ink: '#4b3521', titleFont: '"Long Cang", cursive',
  },
  {
    id: 'daily', name: '每日计划', desc: '日期 / 待办 / 时间轴 / 备注',
    cover: { background: 'linear-gradient(135deg,#ffecd2,#fcb69f)', color: '#7a3a1e' },
    page: { background: '#fffaf3', color: '#b77a4b' },
    decor: DailyDecor,
    ink: '#5a3a26', titleFont: '"ZCOOL KuaiLe", cursive',
  },
  {
    id: 'weekly', name: '周计划', desc: '一周七天方块布局',
    cover: { background: 'linear-gradient(135deg,#d4fc79,#96e6a1)', color: '#22543d' },
    page: { background: '#f7fff2', color: '#5f9f6a' },
    decor: WeeklyDecor,
    ink: '#2f4f3a', titleFont: '"ZCOOL XiaoWei", serif',
  },
  {
    id: 'lavender', name: '薰衣草', desc: '淡紫横线，温柔又安静',
    cover: { background: 'linear-gradient(135deg,#e2d1f9,#b8a1e8)', color: '#4a2d7a' },
    page: { background: '#faf6ff', ...lineOverlay('rgba(150,120,200,.28)', 28) },
    ink: '#4b3a6a', titleFont: '"Ma Shan Zheng", cursive',
  },
  {
    id: 'polaroid', name: '拍立得相册', desc: '自带相框位，贴照片贴纸',
    cover: { background: 'linear-gradient(135deg,#f5f7fa,#c3cfe2)', color: '#2f3b52' },
    page: { background: '#f3efe8', ...dotOverlay('rgba(100,90,80,.2)', 18) },
    decor: PolaroidDecor,
    ink: '#3a3a3a', titleFont: '"Zhi Mang Xing", cursive',
  },
  {
    id: 'blackboard', name: '黑板报', desc: '墨绿黑板，用浅色文字',
    cover: { background: 'linear-gradient(135deg,#355c4a,#1d3a2d)', color: '#ffe8b0' },
    page: {
      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.06), transparent 60%), #2d4b3d',
      ...gridOverlay('rgba(255,255,255,.06)', 30),
    },
    ink: '#f7f1dc', titleFont: '"ZCOOL KuaiLe", cursive',
  },
]

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
