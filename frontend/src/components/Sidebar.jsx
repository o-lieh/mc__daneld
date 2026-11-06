import { useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, ClipboardPen, Search, Wheat, LogOut, X } from 'lucide-react'
import Logo from './Logo.jsx'
import { BRAND } from '../config.js'
import { api } from '../api.js'
import useLoad from '../hooks/useLoad.js'

// آیتم‌های منو: برای افزودن صفحه‌ی جدید فقط یک خط اینجا اضافه کن.
const ITEMS = [
  { to: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/calendar', label: 'تقویم', icon: CalendarDays },
  { to: '/operations/recent', label: 'ثبت عملیات', icon: ClipboardPen },
  { to: '/operations/search', label: 'جست‌وجو در سوابق', icon: Search },
  { to: '/farms', label: 'مزرعه‌ها', icon: Wheat },
]

// موبایل: منوی کشویی از سمت راست (با دکمه‌ی همبرگری باز می‌شود).
// لپ‌تاپ (lg به بالا): نوار کناری ثابت.
export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const me = useLoad(api.me)
  const name = me.data?.full_name ?? ''

  // بستن منو با کلید Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const logout = async () => {
    await api.logout()
    navigate('/login')
  }

  return (
    <>
      {/* پس‌زمینه‌ی تیره‌ی پشت منو (فقط موبایل) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity lg:hidden
          ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-line bg-surface
          transition-[transform,visibility] duration-200
          ${open ? 'visible translate-x-0' : 'invisible translate-x-full'}
          lg:visible lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:self-start`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link to={BRAND.href} onClick={onClose} className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold">{BRAND.name}</span>
          </Link>
          <button onClick={onClose} aria-label="بستن منو" className="p-2 text-muted lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition
                ${isActive ? 'bg-primary-soft font-medium text-primary' : 'text-ink/80 hover:bg-bg'}`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* پایین منو: کاربر و خروج */}
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 px-3 pb-2 pt-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
              {name.charAt(0)}
            </span>
            <span className="truncate text-sm">{name}</span>
          </div>
          <button
            onClick={logout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] text-muted hover:bg-bg"
          >
            <LogOut size={19} />
            خروج
          </button>
        </div>
      </aside>
    </>
  )
}
