import { normalizeDigits } from './phone.js'

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export const faDigits = (s) => String(s).replace(/\d/g, (d) => FA_DIGITS[d])
export const faNumber = (n, maxDecimals = 2) =>
  Number(n).toLocaleString('fa-IR', { maximumFractionDigits: maxDecimals })

// عدد تایپ‌شده توسط کاربر (ارقام فارسی و ممیز فارسی هم قبول است) -> Number
export const parseNumber = (s) =>
  Number(normalizeDigits(s).trim().replace(/[٫/,]/g, '.'))

// برچسب فارسی operation_type (مطابق CHECK دیتابیس)
export const OPERATION_TYPES = {
  planting: 'کاشت',
  irrigation: 'آبیاری',
  fertilizing: 'کوددهی',
  spraying: 'سم‌پاشی',
  harvesting: 'برداشت',
  other: 'سایر',
}
// برچسب فارسی status عملیات (مطابق CHECK دیتابیس)
export const OPERATION_STATUSES = {
  planned: 'برنامه‌ریزی‌شده',
  in_progress: 'در حال انجام',
  completed: 'انجام‌شده',
  cancelled: 'لغوشده',
}

// area_m2 -> "۲ هکتار" یا "۸۰۰ متر مربع"
export function formatArea(m2) {
  if (m2 == null) return ''
  return m2 >= 10000 ? `${faNumber(m2 / 10000)} هکتار` : `${faNumber(m2)} متر مربع`
}

// زمان UTC (completed_at) -> "امروز" / "دیروز" / "۳ روز پیش"
export function daysAgoFa(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'امروز'
  if (days === 1) return 'دیروز'
  return `${faNumber(days)} روز پیش`
}
