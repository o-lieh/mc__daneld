import { Link } from 'react-router-dom'
import OperationCard from '../OperationCard.jsx'

// کارهای پیش رو: سه عملیات باز با نزدیک‌ترین تاریخ، با همان کارت عملیات همه‌جا.
// reload از useLoad می‌آید و بعد از هر تغییر (انجام، لغو، حذف، ویرایش) لیست را تازه می‌کند.
export default function UpcomingTasks({ data, loading, error, reload }) {
  const tasks = (data ?? []).slice(0, 3)

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">کارهای پیش رو</h2>

      {loading && !data && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-[92px] animate-pulse rounded-xl bg-primary-soft" />)}
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p className="text-sm text-muted">کاری برای روزهای آینده ثبت نشده.</p>
      )}

      <ul className="space-y-3">
        {tasks.map((t) => <OperationCard key={t.id} op={t} onChange={reload} />)}
      </ul>

      <Link to="/calendar" className="mt-4 inline-block text-sm font-medium text-primary">
        مشاهده‌ی تقویم کشاورزی
      </Link>
    </section>
  )
}
