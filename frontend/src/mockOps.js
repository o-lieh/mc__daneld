// داده‌ی آزمایشی عملیات (فقط وقتی USE_MOCK = true است).
import { mockFarms, mockOperations } from './mock.js'
import { effectiveDate } from './utils/opStyle.js'
import { todayISO } from './utils/schedule.js'

const OPEN = ['planned', 'in_progress']
const err = (status, message) => Object.assign(new Error(message), { status })
const byDate = (a, b) => a.scheduled_date.localeCompare(b.scheduled_date)

// شکل نهایی یک عملیات در پاسخ API: همیشه description و completed_date دارد
export const normOp = (o) => ({
  description: null,
  scheduled_time: null,
  ...o,
  completed_date: o.status === 'completed' ? o.completed_date ?? o.scheduled_date : null,
})

const find = (id) => {
  const o = mockOperations.find((x) => x.id === Number(id))
  if (!o) throw err(404, 'این عملیات پیدا نشد.')
  return o
}

// { id, name } مزرعه و قطعه از روی plot_id
function placeOf(plotId) {
  const farm = mockFarms.find((f) => f.plots.some((p) => p.id === plotId))
  const plot = farm.plots.find((p) => p.id === plotId)
  return { farm: { id: farm.id, name: farm.name }, plot: { id: plot.id, name: plot.name } }
}

export const mockUpcoming = () => mockOperations.filter((o) => OPEN.includes(o.status)).sort(byDate).slice(0, 3).map(normOp)
export const mockRecent = () => mockOperations.slice(0, 5).map(normOp)

export function mockCalendar(from, to) {
  return mockOperations.map(normOp).filter((o) => {
    const d = effectiveDate(o)
    return d >= from && d <= to
  })
}

export function mockCreateOperation(body) {
  const status = body.status ?? 'planned'
  mockOperations.unshift({
    id: Date.now(),
    title: body.title,
    operation_type: body.operation_type,
    description: body.description ?? null,
    scheduled_date: body.scheduled_date,
    scheduled_time: body.scheduled_time ?? null,
    status,
    completed_date: status === 'completed' ? body.completed_date ?? todayISO() : null,
    ...placeOf(body.plot_id),
  })
}

export function mockUpdateOperation(id, body) {
  const o = find(id)
  const { plot_id, ...rest } = body
  if (plot_id != null) Object.assign(o, placeOf(plot_id))
  Object.assign(o, rest)
  // مثل سرور: تاریخ انجام فقط برای عملیات انجام‌شده معنی دارد
  if (o.status !== 'completed') o.completed_date = null
  else if (!o.completed_date) o.completed_date = todayISO()
}

export function mockDeleteOperation(id) {
  mockOperations.splice(mockOperations.indexOf(find(id)), 1)
}
