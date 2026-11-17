import Logo from './Logo.jsx'
import { BRAND } from '../config.js'

// قاب صفحه‌های ورود و ثبت‌نام: فرم روی زمینه‌ی سفید.
// در لپ‌تاپ یک پنل سبز خیلی روشن با لوگو کنار فرم نمایش داده می‌شود.
export default function AuthLayout({ children }) {
  return (
    <main className="flex flex-1 bg-surface">
      <div className="hidden flex-1 flex-col items-center justify-center gap-5 bg-primary-soft/50 px-10 lg:order-2 lg:flex">
        <Logo className="h-36 w-36" />
        <p className="text-2xl font-bold text-primary">{BRAND.name}</p>
        <p className="max-w-xs text-center text-muted">
          کارهای مزرعه‌ات را ثبت کن و هیچ زمان مهمی را از یاد نبر.
        </p>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-10 sm:items-center">
        {children}
      </div>
    </main>
  )
}
