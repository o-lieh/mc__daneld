import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import AddFarmModal from '../components/farms/AddFarmModal.jsx'
import useLoad from '../hooks/useLoad.js'
import { api } from '../api.js'

// صفحه‌ی مزرعه‌ها: نام مزرعه‌های کاربر + دکمه‌ی افزودن (مودال)
export default function Farms() {
  const farms = useLoad(api.farms)
  const list = farms.data ?? []

  // /farms?add=1 مودال را از ابتدا باز می‌کند (لینک‌های «افزودن مزرعه» جاهای دیگر)
  const [params, setParams] = useSearchParams()
  const [adding, setAdding] = useState(params.get('add') === '1')

  const closeModal = () => {
    setAdding(false)
    if (params.has('add')) setParams({}, { replace: true })
  }

  const onCreated = () => {
    closeModal()
    farms.reload()
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">مزرعه‌ها</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          <Plus size={16} />
          افزودن مزرعه
        </button>
      </div>

      {farms.loading && list.length === 0 && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-primary-soft" />)}
        </div>
      )}

      {farms.error && <p className="text-sm text-danger">{farms.error}</p>}

      {!farms.loading && !farms.error && list.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">هنوز مزرعه‌ای ثبت نکرده‌ای.</p>
      )}

      <ul className="space-y-3">
        {list.map((f) => (
          <li key={f.id}>
            <Link
              to={`/farms/${f.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-4 transition hover:bg-primary-soft"
            >
              <span className="font-medium">{f.name}</span>
              <ChevronLeft size={18} className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>

      {adding && <AddFarmModal onClose={closeModal} onCreated={onCreated} />}
    </main>
  )
}
