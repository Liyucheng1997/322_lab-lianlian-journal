import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useJournal } from './store/journal'

// 开发调试：在控制台里可以通过 window.__journal 查看/修改状态
if (import.meta.env.DEV) (window as unknown as { __journal: typeof useJournal }).__journal = useJournal

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
