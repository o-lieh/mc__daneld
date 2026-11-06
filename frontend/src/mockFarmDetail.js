// داده‌ی آزمایشی صفحه‌ی مزرعه (فقط وقتی USE_MOCK = true است).
// ساختار پاسخ، همان قراردادی است که بک‌اند باید برگرداند (توضیح در api.js).
import { mockFarms, mockOperations } from './mock.js'
import { normOp } from './mockOps.js'

const day = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const ago = (days) => new Date(Date.now() - days * 86400000).toISOString()

// اطلاعات تکمیلی مزرعه‌ها (غیر از نام)
const info = {
  1: {
    province: 'خراسان رضوی', city: 'مشهد', address: 'روستای نمونه، جاده‌ی اصلی',
    latitude: 36.29, longitude: 59.6, description: 'مزرعه‌ی اصلی گندم و ذرت.',
  },
}

// سه حالت نمونه برای قطعه‌های اولیه: عقب‌افتاده (قرمز)، امروز (زرد)، عادی (سبز)
const DEMO = [
  {
    area_m2: 20000, overdue_count: 1, today_count: 1,
    current_season: { crop_name: 'گندم', variety: 'پیشتاز', start_date: day(-40), actual_start_date: day(-38), status: 'active' },
    next_operation: { id: 1, title: 'آبیاری', operation_type: 'irrigation', scheduled_date: day(-1), scheduled_time: null },
    last_irrigation_at: ago(9),
  },
  {
    area_m2: 45000, overdue_count: 0, today_count: 2,
    current_season: { crop_name: 'ذرت', variety: null, start_date: day(-20), actual_start_date: day(-20), status: 'active' },
    next_operation: { id: 2, title: 'کوددهی', operation_type: 'fertilizing', scheduled_date: day(0), scheduled_time: '08:30:00' },
    last_irrigation_at: ago(3),
  },
  {
    area_m2: 12500, overdue_count: 0, today_count: 0,
    current_season: { crop_name: 'جو', variety: null, start_date: day(-60), actual_start_date: day(-58), status: 'active' },
    next_operation: { id: 3, title: 'آبیاری', operation_type: 'irrigation', scheduled_date: day(4), scheduled_time: null },
    last_irrigation_at: ago(1),
  },
]

const plotEdits = {} // ویرایش‌های قطعه‌ها در حالت آزمایشی

function plotDetail(p, i) {
  const base = {
    id: p.id, name: p.name, code: p.code ?? null,
    soil_type: p.soil_type ?? null, description: p.description ?? null,
  }
  // قطعه‌ی تازه‌ساخته‌شده (area_m2 دارد): هنوز کشت و عملیاتی ندارد
  if (p.area_m2) {
    return { ...base, area_m2: p.area_m2, today_count: 0, overdue_count: 0,
      current_season: null, next_operation: null, last_irrigation_at: null, ...plotEdits[p.id] }
  }
  return { ...base, ...DEMO[i % DEMO.length], ...plotEdits[p.id] }
}

const findFarm = (id) => {
  const farm = mockFarms.find((f) => String(f.id) === String(id))
  if (!farm) throw Object.assign(new Error('این مزرعه پیدا نشد.'), { status: 404 })
  return farm
}

export function mockFarmDetail(id) {
  const farm = findFarm(id)
  return {
    id: farm.id, name: farm.name,
    province: null, city: null, address: null, latitude: null, longitude: null,
    timezone: 'Asia/Tehran', description: null,
    ...info[farm.id],
    plots: farm.plots.map(plotDetail),
  }
}

export function mockCreatePlot(farmId, body) {
  findFarm(farmId).plots.push({ id: Date.now(), ...body })
}

export function mockUpdateFarm(id, { name, ...rest }) {
  const farm = findFarm(id)
  if (name) farm.name = name
  info[farm.id] = { ...info[farm.id], ...rest }
}

// ---------- صفحه‌ی قطعه ----------
const byDate = (dir) => (a, b) => a.scheduled_date.localeCompare(b.scheduled_date) * dir
const OPEN = ['planned', 'in_progress']

export function mockPlotDetail(id) {
  const farm = mockFarms.find((f) => f.plots.some((p) => String(p.id) === String(id)))
  if (!farm) throw Object.assign(new Error('این قطعه پیدا نشد.'), { status: 404 })
  const i = farm.plots.findIndex((p) => String(p.id) === String(id))
  const d = plotDetail(farm.plots[i], i)
  const mine = mockOperations.filter((o) => o.plot.id === d.id)
  const { next_operation, last_irrigation_at, ...plot } = d
  return {
    ...plot,
    farm: { id: farm.id, name: farm.name },
    last_done: {
      irrigation: last_irrigation_at,
      fertilizing: d.current_season ? ago(12) : null,
      spraying: d.current_season ? ago(25) : null,
    },
    next_operations: mine.filter((o) => OPEN.includes(o.status)).sort(byDate(1)).slice(0, 3).map(normOp),
    recent_operations: mine.filter((o) => o.status === 'completed').sort(byDate(-1)).slice(0, 3).map(normOp),
  }
}

export function mockUpdatePlot(id, body) {
  for (const farm of mockFarms) {
    const plot = farm.plots.find((p) => String(p.id) === String(id))
    if (plot) {
      plot.name = body.name
      plotEdits[plot.id] = { code: body.code, area_m2: body.area_m2, soil_type: body.soil_type, description: body.description }
    }
  }
}

// ---------- جست‌وجو در سوابق ----------
export function mockSearchOperations({ from, to, farm, plot, status, order, limit = 20, offset = 0 }) {
  const statuses = status ? status.split(',') : null
  const list = mockOperations
    .filter((o) =>
      (!from || o.scheduled_date >= from) && (!to || o.scheduled_date <= to) &&
      (!farm || String(o.farm.id) === String(farm)) && (!plot || String(o.plot.id) === String(plot)) &&
      (!statuses || statuses.includes(o.status)))
    .sort(byDate(order === 'asc' ? 1 : -1))
  return list.slice(offset, offset + limit).map(normOp)
}
