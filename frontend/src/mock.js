// داده‌های آزمایشی؛ فقط وقتی USE_MOCK = true است استفاده می‌شوند.
const day = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const mockFarms = [
  { id: 1, name: 'مزرعه‌ی گندم', plots: [{ id: 11, name: 'قطعه‌ی شمالی' }, { id: 12, name: 'قطعه‌ی جنوبی' }] },
  { id: 2, name: 'باغ سیب', plots: [{ id: 21, name: 'ردیف ۱ تا ۱۰' }] },
  { id: 3, name: 'زمین کنار رودخانه', plots: [] },
]

const F1 = { id: 1, name: 'مزرعه‌ی گندم' }
const F2 = { id: 2, name: 'باغ سیب' }
export const mockOperations = [
  { id: 5, title: 'آبیاری', operation_type: 'irrigation', scheduled_date: day(-1), scheduled_time: null, status: 'planned',
    farm: F1, plot: { id: 11, name: 'قطعه‌ی شمالی' } },
  { id: 4, title: 'کوددهی', operation_type: 'fertilizing', scheduled_date: day(-3), scheduled_time: '08:30:00', status: 'completed',
    farm: F1, plot: { id: 12, name: 'قطعه‌ی جنوبی' } },
  { id: 3, title: 'سم‌پاشی', operation_type: 'spraying', scheduled_date: day(-8), scheduled_time: null, status: 'cancelled',
    farm: F2, plot: { id: 21, name: 'ردیف ۱ تا ۱۰' } },
  { id: 2, title: 'کاشت', operation_type: 'planting', scheduled_date: day(-30), scheduled_time: null, status: 'completed',
    farm: F1, plot: { id: 11, name: 'قطعه‌ی شمالی' } },
  { id: 1, title: 'شخم‌زنی', operation_type: 'other', scheduled_date: day(-45), scheduled_time: null, status: 'in_progress',
    farm: F2, plot: { id: 21, name: 'ردیف ۱ تا ۱۰' } },
]
export const mockUser = { full_name: 'کاربر نمونه', phone: '+989123456789' }
