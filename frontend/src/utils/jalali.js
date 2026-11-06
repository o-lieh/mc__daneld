// تبدیل تاریخ میلادی و شمسی (الگوریتم استاندارد؛ برای سال‌های ۱۹۰۰ تا ۲۱۰۰ با Intl مرورگر راستی‌آزمایی شده)
const pad = (n) => String(n).padStart(2, '0')

export const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

export function g2j(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const gy2 = gm > 2 ? gy + 1 : gy
  let days = 355666 + 365 * gy + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + gdm[gm - 1]
  let jy = -1595 + 33 * ~~(days / 12053)
  days %= 12053
  jy += 4 * ~~(days / 1461)
  days %= 1461
  if (days > 365) { jy += ~~((days - 1) / 365); days = (days - 1) % 365 }
  const jm = days < 186 ? 1 + ~~(days / 31) : 7 + ~~((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

export function j2g(jy, jm, jd) {
  jy += 1595
  let days = -355668 + 365 * jy + ~~(jy / 33) * 8 + ~~(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  let gy = 400 * ~~(days / 146097)
  days %= 146097
  if (days > 36524) { gy += 100 * ~~(--days / 36524); days %= 36524; if (days >= 365) days++ }
  gy += 4 * ~~(days / 1461)
  days %= 1461
  if (days > 365) { gy += ~~((days - 1) / 365); days = (days - 1) % 365 }
  let gd = days + 1
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0
  const sal = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  for (; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm]
  return [gy, gm, gd]
}

// "2026-10-30" -> [1405, 8, 8]
export const isoToJalali = (iso) => g2j(...iso.split('-').map(Number))

// (1405, 8, 8) -> "2026-10-30"
export function jalaliToISO(jy, jm, jd) {
  const [gy, gm, gd] = j2g(jy, jm, jd)
  return `${gy}-${pad(gm)}-${pad(gd)}`
}

export function daysInJMonth(y, m) {
  if (m <= 6) return 31
  if (m <= 11) return 30
  return g2j(...j2g(y, 12, 30)).join() === [y, 12, 30].join() ? 30 : 29 // اسفند کبیسه
}

// روز هفته‌ی اولِ ماه: شنبه = ۰ ... جمعه = ۶
export function firstWeekday(y, m) {
  const [gy, gm, gd] = j2g(y, m, 1)
  return (new Date(gy, gm - 1, gd).getDay() + 1) % 7
}
