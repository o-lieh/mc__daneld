import { BASE_URL, USE_MOCK } from './config.js'
import { getToken, setSession, clearSession } from './auth.js'
import { mockFarms, mockUser } from './mock.js'
import {
  mockUpcoming, mockRecent, mockCalendar,
  mockCreateOperation, mockUpdateOperation, mockDeleteOperation,
} from './mockOps.js'
import {
  mockFarmDetail, mockCreatePlot, mockUpdateFarm,
  mockPlotDetail, mockUpdatePlot, mockSearchOperations,
} from './mockFarmDetail.js'

// آدرس endpointها (بعد از BASE_URL که شامل /api/v1 است).
// اگر با بک‌اند فرق داشت فقط همین‌جا عوض کن.
const ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',
  logout: '/auth/logout',
  upcomingTasks: '/tasks/upcoming?limit=3',
  farms: '/farms',
  plots: '/plots',
  operations: '/operations',
  recentOperations: '/operations?limit=5', // جدیدترین‌ها اول
}

const wait = (data) => new Promise((res) => setTimeout(() => res(data), 400))

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// auth=false برای درخواست‌هایی که توکن ندارند (ثبت‌نام و ورود)
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const token = auth ? getToken() : null
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  })

  // توکن نامعتبر یا منقضی: به صفحه‌ی ورود برگرد
  if (res.status === 401 && auth) {
    clearSession()
    window.location.href = '/login'
    throw new ApiError(401, 'نشست تمام شده؛ دوباره وارد شو.')
  }
  if (!res.ok) throw new ApiError(res.status, 'مشکلی پیش آمد. دوباره تلاش کن.')
  return res.status === 204 ? null : res.json()
}

// پیام فارسی مناسب هر کد خطا را روی خطا می‌گذارد و دوباره پرتاب می‌کند
const withMessages = (messages) => (e) => {
  if (messages[e.status]) e.message = messages[e.status]
  throw e
}

export const api = {
  // body: { full_name, phone (E.164), password, email? }  ->  201
  async register(body) {
    if (USE_MOCK) return wait()
    await request(ENDPOINTS.register, { method: 'POST', body, auth: false }).catch(
      withMessages({
        409: 'این شماره یا ایمیل قبلاً ثبت شده است.',
        422: 'اطلاعات واردشده معتبر نیست. دوباره بررسی کن.',
      })
    )
  },

  // body: { phone (E.164), password }  ->  { access_token, expires_at }
  async login(body) {
    if (USE_MOCK) {
      setSession({ token: 'mock-token', expiresAt: null })
      return wait()
    }
    const data = await request(ENDPOINTS.login, { method: 'POST', body, auth: false }).catch(
      withMessages({
        401: 'شماره یا رمز عبور اشتباه است.',
        422: 'اطلاعات واردشده معتبر نیست.',
      })
    )
    setSession({ token: data.access_token, expiresAt: data.expires_at })
  },

  // پاسخ: { full_name, phone, ... }
  me: () => (USE_MOCK ? wait(mockUser) : request(ENDPOINTS.me)),

  // نشست در بک‌اند باطل می‌شود (204)؛ حتی اگر درخواست خطا بدهد، نشست محلی پاک می‌شود
  async logout() {
    try {
      if (!USE_MOCK) await request(ENDPOINTS.logout, { method: 'POST' })
    } catch {
      /* مهم نیست */
    } finally {
      clearSession()
    }
  },

  // پاسخ: [{ id, title, date: "2026-10-07" }]
  upcomingTasks: () =>
    USE_MOCK ? wait(mockUpcoming()) : request(ENDPOINTS.upcomingTasks),

  // پاسخ: [{ id, name, plots: [{ id, name }] }]
  farms: () => (USE_MOCK ? wait(mockFarms) : request(ENDPOINTS.farms)),

  // GET /farms/{id}: مزرعه + قطعه‌ها (ستون‌های جدول farms) و برای هر قطعه:
  // { id, name, code, area_m2, soil_type, description,
  //   today_count,          // عملیات planned/in_progress با scheduled_date امروز (به وقت timezone مزرعه)
  //   overdue_count,        // عملیات planned/in_progress با scheduled_date قبل از امروز
  //   current_season,       // دوره‌ی کشت active (یا null): { crop_name, variety, start_date, actual_start_date, status }
  //   next_operation,       // نزدیک‌ترین عملیات planned/in_progress (یا null): { id, title, operation_type, scheduled_date, scheduled_time }
  //   last_irrigation_at }  // completed_at آخرین عملیات irrigation تکمیل‌شده (UTC) یا null
  async farm(id) {
    if (USE_MOCK) return wait(mockFarmDetail(id))
    return request(`${ENDPOINTS.farms}/${id}`).catch(withMessages({ 404: 'این مزرعه پیدا نشد.' }))
  },

  // PATCH /farms/{id}: { name, province, city, address, latitude, longitude, description }
  // مقدار null یعنی پاک کردن فیلد
  async updateFarm(id, body) {
    if (USE_MOCK) {
      mockUpdateFarm(id, body)
      return wait()
    }
    return request(`${ENDPOINTS.farms}/${id}`, { method: 'PATCH', body })
  },

  // POST /farms/{id}/plots: { name, code?, area_m2, soil_type?, description? }
  async createPlot(farmId, body) {
    if (USE_MOCK) {
      mockCreatePlot(farmId, body)
      return wait()
    }
    return request(`${ENDPOINTS.farms}/${farmId}/plots`, { method: 'POST', body }).catch(
      withMessages({ 409: 'نام یا کد این قطعه در مزرعه تکراری است.' })
    )
  },

  // GET /plots/{id}: ستون‌های جدول plots به‌علاوه‌ی
  // { farm: {id, name},
  //   today_count, overdue_count,   // مثل صفحه‌ی مزرعه، فقط برای همین قطعه
  //   current_season,               // { crop_name, variety, start_date, actual_start_date, status } یا null
  //   last_done: { irrigation, fertilizing, spraying },  // completed_at (UTC) آخرین عملیات تکمیل‌شده‌ی هر نوع، یا null
  //   next_operations,              // حداکثر ۳ عملیات planned/in_progress، به ترتیب scheduled_date صعودی
  //   recent_operations }           // حداکثر ۳ عملیات completed، به ترتیب completed_at نزولی
  // هر عملیات: { id, title, operation_type, scheduled_date, scheduled_time, status }
  async plot(id) {
    if (USE_MOCK) return wait(mockPlotDetail(id))
    return request(`${ENDPOINTS.plots}/${id}`).catch(withMessages({ 404: 'این قطعه پیدا نشد.' }))
  },

  // PATCH /plots/{id}: { name, code, area_m2, soil_type, description }  (null = پاک کردن)
  async updatePlot(id, body) {
    if (USE_MOCK) {
      mockUpdatePlot(id, body)
      return wait()
    }
    return request(`${ENDPOINTS.plots}/${id}`, { method: 'PATCH', body }).catch(
      withMessages({ 409: 'نام یا کد این قطعه در مزرعه تکراری است.' })
    )
  },

  // GET /operations?from&to&farm&plot&status&order&limit&offset
  // from/to روی scheduled_date؛ status می‌تواند چند مقدار با کاما باشد؛ order = asc | desc (پیش‌فرض desc)
  // پاسخ: همان آیتم‌های recentOperations (با farm و plot)
  async searchOperations(params) {
    if (USE_MOCK) return wait(mockSearchOperations(params))
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    return request(`${ENDPOINTS.operations}?${qs}`)
  },

  // body: { name, address?, description? }
  async createFarm(body) {
    if (!USE_MOCK) return request(ENDPOINTS.farms, { method: 'POST', body })
    mockFarms.push({ id: Date.now(), name: body.name, plots: [] }) // فقط برای حالت آزمایشی
    return wait()
  },

    // POST /operations: { plot_id, operation_type, title, scheduled_date, scheduled_time?, description?,
  //                     crop_name?, variety?, status?, completed_date? }
  async createOperation(body) {
    if (USE_MOCK) {
      mockCreateOperation(body)
      return wait()
    }
    return request(ENDPOINTS.operations, { method: 'POST', body })
  },

  // PATCH /operations/{id}: فقط فیلدهای تغییرکرده، از میان
  // { operation_type, title, plot_id, scheduled_date, scheduled_time, description, status, completed_date }
  // null یعنی پاک کردن. اگر status به completed برود و completed_date نباشد، سرور زمان همان لحظه را می‌گذارد.
  async updateOperation(id, body) {
    if (USE_MOCK) {
      mockUpdateOperation(id, body)
      return wait()
    }
    return request(`${ENDPOINTS.operations}/${id}`, { method: 'PATCH', body })
  },

  // DELETE /operations/{id}  ->  204
  async deleteOperation(id) {
    if (USE_MOCK) {
      mockDeleteOperation(id)
      return wait()
    }
    return request(`${ENDPOINTS.operations}/${id}`, { method: 'DELETE' })
  },

  // GET /operations/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
  // همه‌ی عملیات‌هایی که «تاریخ مؤثر»شان در این بازه است (بدون صفحه‌بندی):
  // تاریخ مؤثر = completed_date اگر انجام شده، وگرنه scheduled_date. عملیات لغوشده هم برگردانده شود.
  async calendarOperations(from, to) {
    if (USE_MOCK) return wait(mockCalendar(from, to))
    return request(`${ENDPOINTS.operations}/calendar?from=${from}&to=${to}`)
  },

  // پاسخ: [{ id, name, start_date, end_date, farm: {id, name}, plot: {id, name} }]
  recentOperations: () =>
    USE_MOCK ? wait(mockRecent()) : request(ENDPOINTS.recentOperations),
}
