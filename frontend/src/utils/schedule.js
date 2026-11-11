const pad = (n) => String(n).padStart(2, '0')

// امروز به صورت "2026-10-30" (به وقت دستگاه کاربر)
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "2026-10-30" -> Date محلی (برای پر کردن انتخابگر تاریخ)
export function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// موعد گذشته؟ (شمارنده‌های بک‌اند به وقت timezone مزرعه‌اند؛ این فقط برای رنگ برچسب است)
export const isPast = (iso) => iso < todayISO()
