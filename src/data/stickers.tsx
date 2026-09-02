import type { ReactNode } from 'react'
import type { AnimationId } from '../types'

export type StickerCategory = 'basic' | 'nature' | 'food' | 'tape' | 'deco' | 'animated'

export interface StickerDef {
  id: string
  name: string
  category: StickerCategory
  /** 高/宽 */
  aspect?: number
  /** 自带动效（贴画内部动画） */
  animated?: boolean
  render: () => ReactNode
}

export const CATEGORY_NAMES: Record<StickerCategory, string> = {
  basic: '基础',
  nature: '自然',
  food: '美食',
  tape: '胶带',
  deco: '装饰',
  animated: '动态',
}

export const ANIMATIONS: { id: AnimationId; name: string }[] = [
  { id: 'none', name: '无' },
  { id: 'bounce', name: '弹跳' },
  { id: 'float', name: '漂浮' },
  { id: 'pulse', name: '心跳' },
  { id: 'wiggle', name: '摇摆' },
  { id: 'swing', name: '钟摆' },
  { id: 'spin', name: '旋转' },
  { id: 'shake', name: '抖动' },
  { id: 'sparkle', name: '闪烁' },
]

const S = (props: { children: ReactNode; vb?: string }) => (
  <svg viewBox={props.vb ?? '0 0 100 100'} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">{props.children}</svg>
)

export const STICKERS: StickerDef[] = [
  // ───── 基础 ─────
  {
    id: 'heart', name: '爱心', category: 'basic',
    render: () => <S><path d="M50 88 C20 65 8 50 8 34 A18 18 0 0 1 50 26 A18 18 0 0 1 92 34 C92 50 80 65 50 88Z" fill="#ff6b8a" stroke="#fff" strokeWidth="5" /><ellipse cx="30" cy="34" rx="6" ry="4" fill="#fff" opacity=".7" /></S>,
  },
  {
    id: 'star', name: '星星', category: 'basic',
    render: () => <S><path d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36Z" fill="#ffd23f" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></S>,
  },
  {
    id: 'cloud', name: '云朵', category: 'basic',
    aspect: .65,
    render: () => <S vb="0 0 100 65"><path d="M25 55 a15 15 0 0 1 3 -29 a20 20 0 0 1 38 -8 a14 14 0 0 1 24 12 a12 12 0 0 1 -2 25Z" fill="#fff" stroke="#c9dff5" strokeWidth="4" /></S>,
  },
  {
    id: 'bubble', name: '对话框', category: 'basic',
    aspect: .8,
    render: () => <S vb="0 0 100 80"><path d="M12 8 h76 a8 8 0 0 1 8 8 v40 a8 8 0 0 1 -8 8 h-42 l-16 14 v-14 h-18 a8 8 0 0 1 -8 -8 v-40 a8 8 0 0 1 8 -8Z" fill="#fff" stroke="#f5a3b8" strokeWidth="4" /><circle cx="35" cy="36" r="4" fill="#f5a3b8" /><circle cx="50" cy="36" r="4" fill="#f5a3b8" /><circle cx="65" cy="36" r="4" fill="#f5a3b8" /></S>,
  },
  {
    id: 'arrow', name: '箭头', category: 'basic',
    aspect: .5,
    render: () => <S vb="0 0 100 50"><path d="M6 25 H70 M52 8 L74 25 L52 42" fill="none" stroke="#ff8a5b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></S>,
  },
  {
    id: 'check', name: '打勾', category: 'basic',
    render: () => <S><rect x="8" y="8" width="84" height="84" rx="18" fill="#a5e8b4" stroke="#fff" strokeWidth="5" /><path d="M28 52 L44 68 L74 34" fill="none" stroke="#1f7a3a" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></S>,
  },
  {
    id: 'pin', name: '图钉', category: 'basic',
    render: () => <S><circle cx="50" cy="38" r="22" fill="#ff5e6c" stroke="#fff" strokeWidth="4" /><circle cx="42" cy="30" r="6" fill="#fff" opacity=".6" /><path d="M50 60 v34" stroke="#555" strokeWidth="4" strokeLinecap="round" /></S>,
  },
  {
    id: 'clip', name: '回形针', category: 'basic',
    aspect: 1.8,
    render: () => <S vb="0 0 50 90"><path d="M14 20 v50 a11 11 0 0 0 22 0 v-58 a7 7 0 0 0 -14 0 v52 a3 3 0 0 0 6 0 v-44" fill="none" stroke="#8fa8c8" strokeWidth="4" strokeLinecap="round" /></S>,
  },
  {
    id: 'tag', name: '标签', category: 'basic',
    aspect: .55,
    render: () => <S vb="0 0 100 55"><path d="M4 27 L22 6 h72 v42 h-72Z" fill="#ffe08a" stroke="#d9a73a" strokeWidth="3" strokeLinejoin="round" /><circle cx="24" cy="27" r="4" fill="#fff" stroke="#d9a73a" strokeWidth="2" /></S>,
  },
  {
    id: 'envelope', name: '信封', category: 'basic',
    aspect: .7,
    render: () => <S vb="0 0 100 70"><rect x="5" y="8" width="90" height="56" rx="6" fill="#fff5d6" stroke="#e0b96b" strokeWidth="3" /><path d="M5 14 L50 42 L95 14" fill="none" stroke="#e0b96b" strokeWidth="3" /><circle cx="50" cy="44" r="8" fill="#ff6b8a" /></S>,
  },
  {
    id: 'camera', name: '相机', category: 'basic',
    aspect: .8,
    render: () => <S vb="0 0 100 80"><rect x="6" y="20" width="88" height="54" rx="10" fill="#6c8ebf" stroke="#fff" strokeWidth="4" /><rect x="30" y="8" width="26" height="16" rx="4" fill="#6c8ebf" /><circle cx="50" cy="47" r="17" fill="#fff" /><circle cx="50" cy="47" r="11" fill="#2f3b52" /><circle cx="46" cy="43" r="3" fill="#fff" /><circle cx="80" cy="32" r="4" fill="#ffd23f" /></S>,
  },
  {
    id: 'music', name: '音符', category: 'basic',
    render: () => <S><path d="M40 78 V22 l40 -10 v50" fill="none" stroke="#7b5cff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx="30" cy="78" rx="12" ry="9" fill="#7b5cff" /><ellipse cx="70" cy="66" rx="12" ry="9" fill="#7b5cff" /></S>,
  },
  // ───── 自然 ─────
  {
    id: 'flower', name: '小花', category: 'nature',
    render: () => <S>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="50" cy="28" rx="13" ry="20" fill="#ffb3c6" stroke="#fff" strokeWidth="3" transform={`rotate(${a} 50 50)`} />)}<circle cx="50" cy="50" r="12" fill="#ffd23f" stroke="#fff" strokeWidth="3" /></S>,
  },
  {
    id: 'leaf', name: '叶子', category: 'nature',
    render: () => <S><path d="M15 85 C15 40 50 12 88 12 C88 55 55 85 15 85Z" fill="#7cc47f" stroke="#fff" strokeWidth="4" /><path d="M20 80 L80 20 M40 65 L45 40 M55 52 L70 45" fill="none" stroke="#3f8a45" strokeWidth="3" strokeLinecap="round" /></S>,
  },
  {
    id: 'rainbow', name: '彩虹', category: 'nature',
    aspect: .55,
    render: () => <S vb="0 0 100 55">{['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'].map((c, i) => <path key={c} d={`M${8 + i * 6} 52 A${42 - i * 6} ${42 - i * 6} 0 0 1 ${92 - i * 6} 52`} fill="none" stroke={c} strokeWidth="6" />)}</S>,
  },
  {
    id: 'moon', name: '月亮', category: 'nature',
    render: () => <S><path d="M62 8 A40 40 0 1 0 92 60 A30 30 0 0 1 62 8Z" fill="#ffe27a" stroke="#fff" strokeWidth="4" /><circle cx="40" cy="30" r="4" fill="#f5c542" /><circle cx="30" cy="55" r="6" fill="#f5c542" /></S>,
  },
  {
    id: 'cherry', name: '樱桃', category: 'nature',
    render: () => <S><path d="M36 60 C40 30 50 18 70 10 M64 60 C62 35 66 22 70 10" fill="none" stroke="#5c9a3a" strokeWidth="4" strokeLinecap="round" /><circle cx="34" cy="70" r="18" fill="#e63950" stroke="#fff" strokeWidth="3" /><circle cx="66" cy="72" r="18" fill="#e63950" stroke="#fff" strokeWidth="3" /><circle cx="28" cy="64" r="4" fill="#fff" opacity=".6" /><circle cx="60" cy="66" r="4" fill="#fff" opacity=".6" /></S>,
  },
  {
    id: 'plant', name: '盆栽', category: 'nature',
    render: () => <S><path d="M30 62 h40 l-5 32 h-30Z" fill="#d98c5f" stroke="#fff" strokeWidth="3" /><rect x="26" y="56" width="48" height="10" rx="3" fill="#c26f45" stroke="#fff" strokeWidth="3" /><path d="M50 56 V30" stroke="#4a8a3c" strokeWidth="4" /><ellipse cx="36" cy="36" rx="14" ry="8" fill="#6cc070" transform="rotate(-30 36 36)" /><ellipse cx="64" cy="36" rx="14" ry="8" fill="#6cc070" transform="rotate(30 64 36)" /><ellipse cx="50" cy="20" rx="8" ry="14" fill="#8bd88e" /></S>,
  },
  {
    id: 'cat', name: '猫咪', category: 'nature',
    render: () => <S><path d="M22 40 L18 12 L40 26Z M78 40 L82 12 L60 26Z" fill="#f4b183" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><circle cx="50" cy="52" r="34" fill="#f4b183" stroke="#fff" strokeWidth="4" /><circle cx="38" cy="48" r="4" fill="#333" /><circle cx="62" cy="48" r="4" fill="#333" /><path d="M46 60 l4 4 l4 -4" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" /><path d="M12 56 h20 M12 64 h20 M68 56 h20 M68 64 h20" stroke="#333" strokeWidth="2" strokeLinecap="round" /><circle cx="30" cy="62" r="5" fill="#ff9aa2" opacity=".7" /><circle cx="70" cy="62" r="5" fill="#ff9aa2" opacity=".7" /></S>,
  },
  // ───── 美食 ─────
  {
    id: 'coffee', name: '咖啡', category: 'food',
    render: () => <S><path d="M18 36 h54 v28 a20 20 0 0 1 -20 20 h-14 a20 20 0 0 1 -20 -20Z" fill="#fff" stroke="#8a5a3a" strokeWidth="4" /><path d="M72 42 h8 a10 10 0 0 1 0 20 h-8" fill="none" stroke="#8a5a3a" strokeWidth="4" /><path d="M32 30 c-4 -8 4 -10 0 -18 M45 30 c-4 -8 4 -10 0 -18 M58 30 c-4 -8 4 -10 0 -18" fill="none" stroke="#b08968" strokeWidth="3" strokeLinecap="round" /><path d="M22 44 h46" stroke="#c8a27a" strokeWidth="6" /></S>,
  },
  {
    id: 'cake', name: '蛋糕', category: 'food',
    render: () => <S><path d="M14 58 h72 v26 a6 6 0 0 1 -6 6 h-60 a6 6 0 0 1 -6 -6Z" fill="#ffd6e0" stroke="#fff" strokeWidth="3" /><path d="M14 58 c10 -10 20 10 30 0 s20 10 30 0 s12 0 12 0 v-10 h-72Z" fill="#ff8fab" stroke="#fff" strokeWidth="3" /><rect x="47" y="20" width="6" height="26" rx="3" fill="#ffe08a" /><ellipse cx="50" cy="16" rx="5" ry="8" fill="#ff9f43" /></S>,
  },
  {
    id: 'strawberry', name: '草莓', category: 'food',
    render: () => <S><path d="M50 92 C22 80 14 58 20 40 C30 28 70 28 80 40 C86 58 78 80 50 92Z" fill="#ff4d6d" stroke="#fff" strokeWidth="4" /><path d="M32 30 l18 -18 l18 18 c-10 -4 -26 -4 -36 0Z" fill="#5fbf6a" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />{[[38, 50], [50, 62], [62, 50], [44, 74], [58, 74], [50, 44]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="2.5" ry="3.5" fill="#fff5c0" />)}</S>,
  },
  {
    id: 'icecream', name: '冰淇淋', category: 'food',
    render: () => <S><path d="M30 46 L50 94 L70 46Z" fill="#e8b16b" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><path d="M36 60 l28 -12 M40 70 l22 -10" stroke="#c98a44" strokeWidth="2" /><circle cx="50" cy="34" r="20" fill="#ffb3c6" stroke="#fff" strokeWidth="3" /><circle cx="36" cy="44" r="12" fill="#c8e6c9" stroke="#fff" strokeWidth="3" /><circle cx="64" cy="44" r="12" fill="#fff3b0" stroke="#fff" strokeWidth="3" /><circle cx="52" cy="16" r="5" fill="#e63950" /></S>,
  },
  {
    id: 'boba', name: '奶茶', category: 'food',
    render: () => <S><path d="M28 30 h44 l-6 60 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6Z" fill="#f2d7b6" stroke="#fff" strokeWidth="3" /><rect x="24" y="24" width="52" height="10" rx="4" fill="#fff" stroke="#c8a27a" strokeWidth="2" /><path d="M56 26 L66 4" stroke="#ff8fab" strokeWidth="6" strokeLinecap="round" />{[[38, 82], [48, 86], [58, 82], [43, 74], [54, 74]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#4a2e1e" />)}</S>,
  },
  // ───── 胶带 ─────
  {
    id: 'tape-pink', name: '粉色胶带', category: 'tape', aspect: .22,
    render: () => <S vb="0 0 200 44"><path d="M4 6 l6 -4 v8 l6 -4 v8 l-6 4 v-8 l-6 4Z" fill="none" /><rect x="6" y="4" width="188" height="36" fill="#ffb3c6" opacity=".85" /><path d="M6 4 l4 4 l-4 4 l4 4 l-4 4 l4 4 l-4 4 l4 4 l-4 4 M194 4 l-4 4 l4 4 l-4 4 l4 4 l-4 4 l4 4 l-4 4 l4 4" fill="#fff" stroke="#fff" strokeWidth="1" /><g fill="#fff" opacity=".7">{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={22 + i * 20} cy="22" r="4" />)}</g></S>,
  },
  {
    id: 'tape-blue', name: '蓝色条纹胶带', category: 'tape', aspect: .22,
    render: () => <S vb="0 0 200 44"><rect x="6" y="4" width="188" height="36" fill="#9ed0ff" opacity=".85" /><g stroke="#fff" strokeWidth="5" opacity=".8">{Array.from({ length: 12 }, (_, i) => <line key={i} x1={10 + i * 16} y1="40" x2={22 + i * 16} y2="4" />)}</g></S>,
  },
  {
    id: 'tape-yellow', name: '黄色格子胶带', category: 'tape', aspect: .22,
    render: () => <S vb="0 0 200 44"><rect x="6" y="4" width="188" height="36" fill="#ffe08a" opacity=".85" /><g stroke="#f0b429" strokeWidth="1.5" opacity=".7">{Array.from({ length: 16 }, (_, i) => <line key={i} x1={12 + i * 12} y1="4" x2={12 + i * 12} y2="40" />)}<line x1="6" y1="14" x2="194" y2="14" /><line x1="6" y1="30" x2="194" y2="30" /></g></S>,
  },
  {
    id: 'tape-kraft', name: '牛皮纸胶带', category: 'tape', aspect: .22,
    render: () => <S vb="0 0 200 44"><rect x="6" y="4" width="188" height="36" fill="#d9b98a" opacity=".9" /><text x="100" y="28" textAnchor="middle" fontSize="14" fontFamily="serif" fill="#7a5230" letterSpacing="3">HELLO · LOVELY · DAY</text></S>,
  },
  // ───── 装饰 ─────
  {
    id: 'frame', name: '相框', category: 'deco', aspect: 1.2,
    render: () => <S vb="0 0 100 120"><rect x="4" y="4" width="92" height="112" fill="#fff" stroke="#e5ddd0" strokeWidth="2" /><rect x="12" y="12" width="76" height="76" fill="#efe9e0" /><text x="50" y="106" textAnchor="middle" fontSize="9" fill="#999" fontFamily="cursive">memory ♡</text></S>,
  },
  {
    id: 'stamp', name: '邮票', category: 'deco', aspect: 1.2,
    render: () => <S vb="0 0 100 120"><rect x="6" y="6" width="88" height="108" fill="#fff" stroke="#bbb" strokeWidth="2" strokeDasharray="6 4" /><rect x="14" y="14" width="72" height="92" fill="#b8d8f5" /><circle cx="50" cy="52" r="20" fill="#ffd23f" /><path d="M14 106 c20 -20 40 -20 72 0Z" fill="#7cc47f" /><text x="50" y="100" textAnchor="middle" fontSize="8" fill="#333">POST</text></S>,
  },
  {
    id: 'ribbon', name: '缎带', category: 'deco', aspect: .4,
    render: () => <S vb="0 0 100 40"><path d="M4 8 h92 l-8 12 l8 12 h-92 l8 -12Z" fill="#ff8fab" stroke="#fff" strokeWidth="2" /><text x="50" y="25" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold" letterSpacing="2">LOVE</text></S>,
  },
  {
    id: 'dots', name: '装饰圆点', category: 'deco', aspect: .3,
    render: () => <S vb="0 0 100 30">{['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'].map((c, i) => <circle key={c} cx={10 + i * 16} cy="15" r="6" fill={c} />)}</S>,
  },
  {
    id: 'sparkles-static', name: '星芒', category: 'deco',
    render: () => <S><path d="M50 10 C52 35 65 48 90 50 C65 52 52 65 50 90 C48 65 35 52 10 50 C35 48 48 35 50 10Z" fill="#ffd23f" /><path d="M20 15 C21 22 24 25 30 26 C24 27 21 30 20 37 C19 30 16 27 10 26 C16 25 19 22 20 15Z" fill="#ffe27a" /><path d="M80 70 C81 77 84 80 90 81 C84 82 81 85 80 92 C79 85 76 82 70 81 C76 80 79 77 80 70Z" fill="#ffe27a" /></S>,
  },
  // ───── 动态贴画（自带动画） ─────
  {
    id: 'anim-sun', name: '转动太阳', category: 'animated', animated: true,
    render: () => <S><g className="sk-spin-slow">{Array.from({ length: 12 }, (_, i) => <rect key={i} x="47" y="4" width="6" height="16" rx="3" fill="#ffb347" transform={`rotate(${i * 30} 50 50)`} />)}</g><circle cx="50" cy="50" r="24" fill="#ffd23f" stroke="#fff" strokeWidth="4" /><circle cx="42" cy="46" r="3" fill="#7a5230" /><circle cx="58" cy="46" r="3" fill="#7a5230" /><path d="M42 56 q8 8 16 0" fill="none" stroke="#7a5230" strokeWidth="3" strokeLinecap="round" /></S>,
  },
  {
    id: 'anim-heart', name: '跳动爱心', category: 'animated', animated: true,
    render: () => <S><g className="sk-pulse"><path d="M50 88 C20 65 8 50 8 34 A18 18 0 0 1 50 26 A18 18 0 0 1 92 34 C92 50 80 65 50 88Z" fill="#ff4d6d" stroke="#fff" strokeWidth="5" /><ellipse cx="30" cy="34" rx="6" ry="4" fill="#fff" opacity=".7" /></g></S>,
  },
  {
    id: 'anim-balloon', name: '飘浮气球', category: 'animated', animated: true, aspect: 1.4,
    render: () => <S vb="0 0 100 140"><g className="sk-float"><ellipse cx="50" cy="45" rx="32" ry="40" fill="#7ec8ff" stroke="#fff" strokeWidth="4" /><ellipse cx="36" cy="30" rx="8" ry="12" fill="#fff" opacity=".5" /><path d="M46 84 l4 6 l4 -6Z" fill="#7ec8ff" /><path d="M50 90 c-10 15 10 25 0 45" fill="none" stroke="#888" strokeWidth="2" /></g></S>,
  },
  {
    id: 'anim-star', name: '闪烁星星', category: 'animated', animated: true,
    render: () => <S><g className="sk-twinkle"><path d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36Z" fill="#ffd23f" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></g><g className="sk-twinkle-delay"><path d="M15 10 C16 17 19 20 25 21 C19 22 16 25 15 32 C14 25 11 22 5 21 C11 20 14 17 15 10Z" fill="#fff" /></g><g className="sk-twinkle-delay2"><path d="M85 68 C86 75 89 78 95 79 C89 80 86 83 85 90 C84 83 81 80 75 79 C81 78 84 75 85 68Z" fill="#fff" /></g></S>,
  },
  {
    id: 'anim-butterfly', name: '扑翅蝴蝶', category: 'animated', animated: true,
    render: () => <S><g className="sk-flap-left"><path d="M48 50 C30 20 5 20 8 45 C10 60 30 62 48 50Z M48 52 C30 70 10 80 18 88 C28 94 42 70 48 52Z" fill="#ff9aa2" stroke="#fff" strokeWidth="3" /><circle cx="24" cy="42" r="5" fill="#fff" opacity=".7" /></g><g className="sk-flap-right"><path d="M52 50 C70 20 95 20 92 45 C90 60 70 62 52 50Z M52 52 C70 70 90 80 82 88 C72 94 58 70 52 52Z" fill="#ff9aa2" stroke="#fff" strokeWidth="3" /><circle cx="76" cy="42" r="5" fill="#fff" opacity=".7" /></g><rect x="46" y="34" width="8" height="46" rx="4" fill="#5a3b2a" /><path d="M48 34 l-6 -10 M52 34 l6 -10" stroke="#5a3b2a" strokeWidth="2" strokeLinecap="round" /></S>,
  },
  {
    id: 'anim-cat', name: '摇尾猫', category: 'animated', animated: true,
    render: () => <S><path className="sk-tail" d="M72 78 c18 -4 22 -20 14 -30" fill="none" stroke="#f4b183" strokeWidth="9" strokeLinecap="round" /><ellipse cx="50" cy="74" rx="30" ry="20" fill="#f4b183" stroke="#fff" strokeWidth="3" /><path d="M24 44 L20 16 L42 30Z M76 44 L80 16 L58 30Z" fill="#f4b183" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><circle cx="50" cy="50" r="28" fill="#f4b183" stroke="#fff" strokeWidth="4" /><g className="sk-blink"><ellipse cx="40" cy="48" rx="4" ry="5" fill="#333" /><ellipse cx="60" cy="48" rx="4" ry="5" fill="#333" /></g><path d="M46 58 l4 4 l4 -4" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" /><path d="M18 54 h16 M18 60 h16 M66 54 h16 M66 60 h16" stroke="#333" strokeWidth="2" strokeLinecap="round" /></S>,
  },
  {
    id: 'anim-flower', name: '摇曳小花', category: 'animated', animated: true,
    render: () => <S><path d="M50 95 V60" stroke="#5fbf6a" strokeWidth="5" strokeLinecap="round" /><ellipse cx="40" cy="80" rx="10" ry="5" fill="#7cc47f" transform="rotate(-30 40 80)" /><g className="sk-sway">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="50" cy="20" rx="11" ry="17" fill="#ffb3c6" stroke="#fff" strokeWidth="3" transform={`rotate(${a} 50 38)`} />)}<circle cx="50" cy="38" r="10" fill="#ffd23f" stroke="#fff" strokeWidth="3" /></g></S>,
  },
  {
    id: 'anim-rain', name: '下雨云', category: 'animated', animated: true,
    render: () => <S><path d="M25 52 a15 15 0 0 1 3 -29 a20 20 0 0 1 38 -8 a14 14 0 0 1 24 12 a12 12 0 0 1 -2 25Z" fill="#dfe9f5" stroke="#b8cce4" strokeWidth="4" /><g className="sk-drop" style={{ animationDelay: '0s' }}><path d="M32 62 q-5 8 0 12 q5 -4 0 -12Z" fill="#6fb1ff" /></g><g className="sk-drop" style={{ animationDelay: '.4s' }}><path d="M50 62 q-5 8 0 12 q5 -4 0 -12Z" fill="#6fb1ff" /></g><g className="sk-drop" style={{ animationDelay: '.8s' }}><path d="M68 62 q-5 8 0 12 q5 -4 0 -12Z" fill="#6fb1ff" /></g></S>,
  },
  {
    id: 'anim-fish', name: '游动小鱼', category: 'animated', animated: true, aspect: .6,
    render: () => <S vb="0 0 100 60"><g className="sk-swim"><path d="M20 30 C35 8 65 8 82 30 C65 52 35 52 20 30Z" fill="#ffa94d" stroke="#fff" strokeWidth="3" /><path className="sk-tail-fish" d="M82 30 L98 16 V44Z" fill="#ff8a3d" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><circle cx="34" cy="27" r="4" fill="#333" /><circle cx="35" cy="26" r="1.5" fill="#fff" /><path d="M50 22 q8 8 0 16" fill="none" stroke="#fff" strokeWidth="2" /></g></S>,
  },
  {
    id: 'anim-candle', name: '摇曳蜡烛', category: 'animated', animated: true, aspect: 1.5,
    render: () => <S vb="0 0 100 150"><rect x="36" y="60" width="28" height="80" rx="6" fill="#fff0c2" stroke="#e8c77a" strokeWidth="3" /><rect x="48" y="44" width="4" height="18" fill="#555" /><g className="sk-flicker"><path d="M50 16 c10 12 12 24 0 32 c-12 -8 -10 -20 0 -32Z" fill="#ff9f43" /><path d="M50 28 c5 6 6 12 0 16 c-6 -4 -5 -10 0 -16Z" fill="#ffe27a" /></g></S>,
  },
  {
    id: 'anim-clock', name: '走动时钟', category: 'animated', animated: true,
    render: () => <S><circle cx="50" cy="50" r="42" fill="#fff" stroke="#6c8ebf" strokeWidth="5" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x="49" y="12" width="2" height="6" fill="#6c8ebf" transform={`rotate(${i * 30} 50 50)`} />)}<rect className="sk-hour" x="48" y="28" width="4" height="24" rx="2" fill="#333" /><rect className="sk-minute" x="48.5" y="20" width="3" height="32" rx="1.5" fill="#e63950" /><circle cx="50" cy="50" r="4" fill="#333" /></S>,
  },
  {
    id: 'anim-sparkle', name: '闪闪亮片', category: 'animated', animated: true,
    render: () => <S>{[[50, 50, 1, 0], [20, 22, .5, .3], [80, 28, .6, .6], [26, 78, .45, .9], [78, 74, .55, 1.2]].map(([x, y, s, d]) => <g key={`${x}${y}`} className="sk-twinkle" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}><path d={`M${x} ${y - 24 * s} C${x + 2 * s} ${y - 6 * s} ${x + 6 * s} ${y - 2 * s} ${x + 24 * s} ${y} C${x + 6 * s} ${y + 2 * s} ${x + 2 * s} ${y + 6 * s} ${x} ${y + 24 * s} C${x - 2 * s} ${y + 6 * s} ${x - 6 * s} ${y + 2 * s} ${x - 24 * s} ${y} C${x - 6 * s} ${y - 2 * s} ${x - 2 * s} ${y - 6 * s} ${x} ${y - 24 * s}Z`} fill="#ffd23f" /></g>)}</S>,
  },
]

export const stickerById = (id: string) => STICKERS.find((s) => s.id === id)
