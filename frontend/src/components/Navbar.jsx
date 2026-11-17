import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { BRAND } from '../config.js'

// نوار بالای صفحه‌های عمومی (ورود و ثبت‌نام)
export default function Navbar() {
  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* لوگو + نام شرکت؛ هر دو یک لینک‌اند */}
        <Link to={BRAND.href} className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold">{BRAND.name}</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link to="/login" className="rounded-lg px-3 py-2 text-muted hover:text-primary">
            ورود
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary-soft px-3 py-2 font-medium text-primary hover:bg-primary hover:text-white"
          >
            ثبت‌نام
          </Link>
        </div>
      </nav>
    </header>
  )
}
