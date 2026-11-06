import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Logo from './Logo.jsx'
import { BRAND } from '../config.js'

// نوار بالای صفحه بعد از ورود (فقط موبایل؛ در لپ‌تاپ نوار کناری جایگزین آن است)
export default function TopBar({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface px-2 lg:hidden">
      <button onClick={onMenu} aria-label="باز کردن منو" className="rounded-xl p-2.5 hover:bg-bg">
        <Menu size={22} />
      </button>
      <Link to={BRAND.href} className="flex items-center gap-2">
        <Logo />
        <span className="text-lg font-bold">{BRAND.name}</span>
      </Link>
    </header>
  )
}
