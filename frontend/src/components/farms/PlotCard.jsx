import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { formatFa } from '../../utils/date.js'
import { OPERATION_TYPES, daysAgoFa, faDigits, faNumber, formatArea } from '../../utils/format.js'

// رنگ دور کارت و سایه (کلاس‌ها کامل نوشته شده‌اند تا Tailwind پیدایشان کند)
const TONE = {
  late: 'border-late shadow-late/30', // قرمز: برنامه‌ریزی‌شده بود ولی انجام نشد
  due: 'border-due shadow-due/40',    // زرد: امروز باید انجام شود
  ok: 'border-ok shadow-ok/25',       // سبز: هیچ‌کدام
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-end">{children}</dd>
    </div>
  )
}

export default function PlotCard({ plot }) {
  const tone = plot.overdue_count > 0 ? 'late' : plot.today_count > 0 ? 'due' : 'ok'
  const season = plot.current_season
  const op = plot.next_operation

  const crop = season && (season.variety ? `${season.crop_name} (${season.variety})` : season.crop_name)
  const opTime = op?.scheduled_time ? ` · ${faDigits(op.scheduled_time.slice(0, 5))}` : ''

  return (
    <li>
    <Link
      to={`/plots/${plot.id}`}
      className={`block rounded-2xl border-2 bg-surface p-4 shadow-lg transition hover:shadow-xl ${TONE[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">
            {plot.name}
            {plot.code && <span className="ms-2 text-xs font-normal text-muted">{plot.code}</span>}
          </h3>
          {/* برچسب متنی، تا معنی رنگ فقط به رنگ وابسته نباشد */}
          {tone === 'late' && (
            <span className="mt-1 inline-block rounded-md bg-late/10 px-2 py-0.5 text-xs text-late">
              {faNumber(plot.overdue_count)} اقدام عقب‌افتاده
            </span>
          )}
          {tone === 'due' && (
            <span className="mt-1 inline-block rounded-md bg-due/20 px-2 py-0.5 text-xs text-soil">
              {faNumber(plot.today_count)} اقدام برای امروز
            </span>
          )}
        </div>
        <p className="flex shrink-0 items-center gap-1 text-sm text-muted">
          {[crop, formatArea(plot.area_m2)].filter(Boolean).join(' · ')}
          <ChevronLeft size={16} />
        </p>
      </div>

      <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
        <Row label="کاشت">
          {season
            ? `${formatFa(season.actual_start_date ?? season.start_date)}${season.actual_start_date ? '' : ' (برنامه‌ریزی‌شده)'}`
            : 'کشتی ثبت نشده'}
        </Row>
        <Row label="اقدام بعدی">
          {op ? `${op.title || OPERATION_TYPES[op.operation_type]} · ${formatFa(op.scheduled_date)}${opTime}` : 'برنامه‌ریزی نشده'}
        </Row>
        <Row label="آخرین آبیاری">
          {plot.last_irrigation_at ? daysAgoFa(plot.last_irrigation_at) : 'ثبت نشده'}
        </Row>
      </dl>
    </Link>
    </li>
  )
}
