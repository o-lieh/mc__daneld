import AddOperationButton from '../components/operations/AddOperationButton.jsx'
import OperationCard from '../components/OperationCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import useLoad from '../hooks/useLoad.js'
import { api } from '../api.js'

export default function Operations() {
  const recent = useLoad(api.recentOperations)
  const operations = (recent.data ?? []).slice(0, 5)

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-6">
      <h1 className="text-center text-2xl font-bold">ثبت عملیات</h1>

      {/* بعد از ثبت، لیست دوباره گرفته می‌شود */}
      <AddOperationButton onSaved={recent.reload} />

      <SectionTitle>عملیات‌های اخیر</SectionTitle>

      {recent.loading && operations.length === 0 && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-[92px] animate-pulse rounded-xl bg-primary-soft" />)}
        </div>
      )}

      {recent.error && <p className="text-sm text-danger">{recent.error}</p>}

      {!recent.loading && !recent.error && operations.length === 0 && (
        <p className="text-center text-sm text-muted">هنوز عملیاتی ثبت نکرده‌ای.</p>
      )}

      <ul className="space-y-3">
        {operations.map((op) => <OperationCard key={op.id} op={op} onChange={recent.reload} />)}
      </ul>
    </main>
  )
}
