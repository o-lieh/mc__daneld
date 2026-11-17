import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import OperationCard from '../components/OperationCard.jsx'
import OperationModal from '../components/operations/OperationModal.jsx'
import { api } from '../api.js'
import { todayISO } from '../utils/schedule.js'
import { MONTHS, daysInJMonth, firstWeekday, isoToJalali, jalaliToISO } from '../utils/jalali.js'
import { OPERATION_TYPES, faNumber } from '../utils/format.js'
import { effectiveDate, typeColor } from '../utils/opStyle.js'

const WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const MAX_DOTS = 5

// نقطه‌ی یک عملیات: پر = انجام‌شده، توخالی = برنامه‌ریزی‌شده. رنگ = نوع عملیات.
function Dot({ op }) {
  const c = typeColor(op.operation_type)
  const done = op.status === 'completed'
  return (
    <span
      className="box-border h-[7px] w-[7px] rounded-full"
      style={done ? { backgroundColor: c } : { border: `1.5px solid ${c}` }}
    />
  )
}

function Arrow({ dir, onClick, label, size = 20 }) {
  const Icon = dir === 'prev' ? ChevronRight : ChevronLeft // در RTL «قبلی» سمت راست است
  return (
    <button type="button" onClick={onClick} aria-label={label} className="rounded-lg p-2 text-primary hover:bg-primary-soft">
      <Icon size={size} />
    </button>
  )
}

export default function Calendar() {
  const today = todayISO()
  const [ty, tm] = isoToJalali(today)
  const [view, setView] = useState({ y: ty, m: tm })
  const [selected, setSelected] = useState(today)
  const [adding, setAdding] = useState(false)
  const [state, setState] = useState({ ops: null, loading: true, error: '' })

  // بازه‌ی میلادی ماه شمسی نمایش‌داده‌شده
  const from = jalaliToISO(view.y, view.m, 1)
  const to = jalaliToISO(view.y, view.m, daysInJMonth(view.y, view.m))

  // بارگذاری عملیات ماه (جواب‌های قدیمی نادیده گرفته می‌شوند)
  const lastRequest = useRef(0)
  const load = useCallback(() => {
    const id = ++lastRequest.current
    setState((s) => ({ ...s, loading: true }))
    api.calendarOperations(from, to)
      .then((ops) => id === lastRequest.current && setState({ ops, loading: false, error: '' }))
      .catch((e) => id === lastRequest.current && setState((s) => ({ ...s, loading: false, error: e.message })))
  }, [from, to])
  useEffect(() => { load() }, [load])

  // عملیات‌ها به تفکیک روز (تاریخ مؤثر: انجام‌شده در روز انجام، وگرنه در روز برنامه‌ریزی)
  const byDay = useMemo(() => {
    const map = {}
    for (const op of state.ops ?? []) (map[effectiveDate(op)] ||= []).push(op)
    for (const list of Object.values(map)) list.sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''))
    return map
  }, [state.ops])

  const goto = (y, m) => {
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setView({ y, m })
    setSelected(y === ty && m === tm ? today : jalaliToISO(y, m, 1))
  }

  const cells = []
  for (let i = 0; i < firstWeekday(view.y, view.m); i++) cells.push(<span key={`b${i}`} />)
  for (let d = 1; d <= daysInJMonth(view.y, view.m); d++) {
    const iso = jalaliToISO(view.y, view.m, d)
    const dots = (byDay[iso] ?? []).filter((o) => o.status !== 'cancelled') // لغوشده نقطه ندارد
    const isSel = iso === selected
    const col = (firstWeekday(view.y, view.m) + d - 1) % 7
    cells.push(
      <button
        key={iso}
        type="button"
        onClick={() => setSelected(iso)}
        aria-label={`${faNumber(d)} ${MONTHS[view.m - 1]}`}
        aria-pressed={isSel}
        className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl border transition
          ${isSel ? 'border-primary bg-primary-soft' : 'border-transparent hover:bg-bg'}
          ${iso === today ? 'font-bold text-primary' : col === 6 ? 'text-late/80' : ''}`}
      >
        <span className="text-sm leading-none">{faNumber(d)}</span>
        <span className="flex h-2 max-w-full flex-wrap items-center justify-center gap-0.5">
          {dots.slice(0, MAX_DOTS).map((o) => <Dot key={o.id} op={o} />)}
          {dots.length > MAX_DOTS && <span className="text-[9px] leading-none text-muted">+</span>}
        </span>
      </button>
    )
  }

  const [, sm, sd] = isoToJalali(selected)
  const dayOps = byDay[selected] ?? []
  const isCurrentMonth = view.y === ty && view.m === tm

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-6">
      <h1 className="text-center text-2xl font-bold">تقویم کشاورزی</h1>

      {/* ماه و سال */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Arrow dir="prev" label="ماه قبل" onClick={() => goto(view.y, view.m - 1)} />
          <span className="min-w-28 text-center text-xl font-bold">{MONTHS[view.m - 1]}</span>
          <Arrow dir="next" label="ماه بعد" onClick={() => goto(view.y, view.m + 1)} />
        </div>
        <div className="flex items-center gap-2 text-muted">
          <Arrow dir="prev" label="سال قبل" size={16} onClick={() => goto(view.y - 1, view.m)} />
          <span className="min-w-16 text-center">{String(view.y).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])}</span>
          <Arrow dir="next" label="سال بعد" size={16} onClick={() => goto(view.y + 1, view.m)} />
        </div>
        {!isCurrentMonth && (
          <button type="button" onClick={() => goto(ty, tm)} className="text-sm font-medium text-primary">
            بازگشت به امروز
          </button>
        )}
      </div>

      {/* تقویم */}
      <section className={`rounded-2xl border border-line bg-surface p-3 shadow-sm transition-opacity ${state.loading ? 'opacity-70' : ''}`}>
        <div className="grid grid-cols-7 border-b border-line pb-2 text-center text-xs text-muted">
          {WEEK.map((w) => <span key={w}>{w}</span>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-y-1">{cells}</div>
      </section>

      {/* راهنمای رنگ‌ها */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted">
        {Object.entries(OPERATION_TYPES).filter(([t]) => t !== 'other').map(([t, label]) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColor(t) }} />
            {label}
          </span>
        ))}
        <span className="basis-full text-center text-muted/70">نقطه‌ی پر: انجام‌شده · نقطه‌ی توخالی: برنامه‌ریزی‌شده</span>
      </div>

      {/* عملیات‌های روز انتخاب‌شده */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">رویدادهای {faNumber(sd)}ام {MONTHS[sm - 1]}</h2>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            افزودن
          </button>
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.loading && !state.ops && <div className="h-[92px] animate-pulse rounded-xl bg-primary-soft" />}
        {!state.loading && !state.error && dayOps.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">عملیاتی برای این روز ثبت نشده.</p>
        )}

        <ul className="space-y-3">
          {dayOps.map((op) => <OperationCard key={op.id} op={op} onChange={load} />)}
        </ul>
      </section>

      {adding && (
        <OperationModal
          defaultDate={selected}
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); load() }}
        />
      )}
    </main>
  )
}
