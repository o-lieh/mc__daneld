// رنگ هر نوع عملیات (مقدارها در theme.css تعریف شده‌اند)
export const TYPE_COLOR = {
  irrigation: 'var(--type-irrigation)',
  fertilizing: 'var(--type-fertilizing)',
  harvesting: 'var(--type-harvesting)',
  spraying: 'var(--type-spraying)',
  planting: 'var(--type-planting)',
  other: 'var(--type-other)',
}
export const typeColor = (type) => TYPE_COLOR[type] ?? TYPE_COLOR.other

// تاریخی که عملیات در تقویم به آن تعلق دارد: اگر انجام شده، تاریخ انجام؛ وگرنه تاریخ برنامه‌ریزی
export const effectiveDate = (op) =>
  op.status === 'completed' && op.completed_date ? op.completed_date : op.scheduled_date
