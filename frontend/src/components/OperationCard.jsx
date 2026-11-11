import { useEffect, useRef, useState } from 'react'
import { Ban, Check, EllipsisVertical, Pencil, Trash2, X } from 'lucide-react'
import Modal from './Modal.jsx'
import OperationModal from './operations/OperationModal.jsx'
import { api } from '../api.js'
import { formatFa } from '../utils/date.js'
import { isPast } from '../utils/schedule.js'
import { OPERATION_TYPES, faDigits } from '../utils/format.js'
import { typeColor } from '../utils/opStyle.js'

// دایره‌ی وضعیت: خالی = انجام نشده، تیک = انجام شده، ضرب‌در = لغو شده. رنگ دایره رنگ نوع عملیات است.
function StatusCircle({ status, color }) {
  const base = 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2'
  if (status === 'completed') {
    return (
      <span role="img" aria-label="انجام شده" className={base} style={{ backgroundColor: color, borderColor: color }}>
        <Check size={14} strokeWidth={3} className="text-white" />
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span role="img" aria-label="لغو شده" className={`${base} border-muted/40 text-muted`}>
        <X size={14} strokeWidth={3} />
      </span>
    )
  }
  return <span role="img" aria-label="انجام نشده" className={base} style={{ borderColor: color }} />
}

function MenuItem({ icon: Icon, danger, children, ...props }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center gap-2.5 px-3 text-sm hover:bg-bg ${danger ? 'text-danger' : ''}`}
      {...props}
    >
      <Icon size={16} />
      {children}
    </button>
  )
}

// کارت عملیات: همه‌جا (داشبورد، قطعه، تقویم، جست‌وجو) همین کارت استفاده می‌شود.
// showPlace={false}: برای صفحه‌ی قطعه که مزرعه و قطعه‌ی همه‌ی کارت‌ها یکی است.
// onChange: بعد از هر تغییر (انجام، لغو، حذف، ویرایش) صدا زده می‌شود تا لیست دوباره بارگذاری شود.
export default function OperationCard({ op, showPlace = true, onChange }) {
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)

  const done = op.status === 'completed'
  const cancelled = op.status === 'cancelled'
  const open = !done && !cancelled
  const overdue = open && isPast(op.scheduled_date)
  const planned = formatFa(op.scheduled_date) + (op.scheduled_time ? ` · ${faDigits(op.scheduled_time.slice(0, 5))}` : '')

  // بستن منو با کلیک بیرون یا Escape
  useEffect(() => {
    if (!menu) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setMenu(false) }
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  const run = async (fn) => {
    setMenu(false)
    setBusy(true)
    setError('')
    try {
      await fn()
      onChange?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li ref={ref} className={`relative flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 transition ${busy ? 'pointer-events-none opacity-60' : ''}`}>
      <StatusCircle status={op.status} color={typeColor(op.operation_type)} />

      <div className="min-w-0 flex-1">
        <p className={`font-bold leading-6 ${cancelled ? 'text-muted line-through' : ''}`}>
          {op.title || OPERATION_TYPES[op.operation_type]}
        </p>
        {showPlace && op.farm && op.plot && (
          <p className="truncate text-sm text-muted">{op.farm.name} · {op.plot.name}</p>
        )}
        {op.description && <p className="mt-0.5 truncate text-xs text-muted/70">{op.description}</p>}

        {/* تاریخ‌ها: تاریخ مهم پررنگ است. انجام‌شده: تاریخ انجام. باز: تاریخ برنامه‌ریزی. */}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className={done || cancelled ? 'text-muted/70' : overdue ? 'font-bold text-late' : 'font-bold text-ink'}>
            برنامه: {planned}
          </span>
          {done && op.completed_date && <span className="font-bold text-ink">انجام: {formatFa(op.completed_date)}</span>}
          {overdue && <span className="rounded bg-late/10 px-1.5 py-0.5 text-late">عقب‌افتاده</span>}
        </p>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-label="گزینه‌ها"
          aria-expanded={menu}
          className="rounded-lg p-1.5 text-muted hover:bg-bg"
        >
          <EllipsisVertical size={18} />
        </button>
        {menu && (
          <div className="absolute end-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
            <MenuItem icon={Pencil} onClick={() => { setMenu(false); setEditing(true) }}>ویرایش</MenuItem>
            {open && <MenuItem icon={Check} onClick={() => run(() => api.updateOperation(op.id, { status: 'completed' }))}>انجام شد</MenuItem>}
            {open && <MenuItem icon={Ban} onClick={() => run(() => api.updateOperation(op.id, { status: 'cancelled' }))}>لغو</MenuItem>}
            <MenuItem icon={Trash2} danger onClick={() => { setMenu(false); setConfirming(true) }}>حذف</MenuItem>
          </div>
        )}
      </div>

      {editing && (
        <OperationModal
          operation={op}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); onChange?.() }}
        />
      )}

      {confirming && (
        <Modal title="حذف عملیات" onClose={() => setConfirming(false)}>
          <p className="text-sm">«{op.title || OPERATION_TYPES[op.operation_type]}» حذف شود؟ این کار قابل بازگشت نیست.</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => { setConfirming(false); run(() => api.deleteOperation(op.id)) }}
              className="h-11 flex-1 rounded-xl bg-danger font-bold text-white hover:opacity-90"
            >
              حذف
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-11 flex-1 rounded-xl border border-line font-medium hover:bg-bg"
            >
              انصراف
            </button>
          </div>
        </Modal>
      )}
    </li>
  )
}
