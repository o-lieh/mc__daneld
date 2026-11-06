// ارقام فارسی و عربی را به انگلیسی تبدیل می‌کند: "۰۹۱۲" -> "0912"
export const normalizeDigits = (s = '') =>
  s.replace(/[۰-۹٠-٩]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩'.indexOf(d) % 10))

// موبایل ایران: 09123456789
export const isValidIranMobile = (s) => /^09\d{9}$/.test(normalizeDigits(s).trim())

// 09123456789 -> +989123456789 (قالب E.164 که بک‌اند ذخیره می‌کند)
export const toE164 = (s) => '+98' + normalizeDigits(s).trim().slice(1)
