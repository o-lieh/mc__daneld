import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import OperationFilter from '../components/dashboard/OperationFilter.jsx'
import OperationCard from '../components/OperationCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import useLoad from '../hooks/useLoad.js'
import { api } from '../api.js'
import { OPERATION_STATUSES } from '../utils/format.js'

const PAGE_SIZE = 20

// نتایج جست‌وجو؛ با عوض شدن فیلترها (key) از نو ساخته می‌شود
function Results({ query }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)

  const load = async (offset) => {
    setLoading(true)
    setError('')
    try {
      const page = await api.searchOperations({ ...query, limit: PAGE_SIZE, offset })
      setItems((prev) => (offset ? [...prev, ...page] : page))
      setHasMore(page.length === PAGE_SIZE)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(0) }, [])

  return (
    <>
      {loading && items.length === 0 && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-[74px] animate-pulse rounded-xl bg-primary-soft" />)}
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-center text-sm text-muted">عملیاتی با این فیلترها پیدا نشد.</p>
      )}

      <ul className="space-y-3">
        {items.map((op) => <OperationCard key={op.id} op={op} onChange={() => load(0)} />)}
      </ul>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => load(items.length)}
            disabled={loading}
            className="h-10 rounded-xl border border-line px-5 text-sm text-primary hover:bg-primary-soft disabled:opacity-60"
          >
            نمایش بیشتر
          </button>
        </div>
      )}
    </>
  )
}

export default function SearchOperations() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const farms = useLoad(api.farms)

  // فیلترها از آدرس خوانده می‌شوند (status و order فقط از لینک‌های صفحه‌ی قطعه می‌آیند)
  const query = Object.fromEntries(
    ['from', 'to', 'farm', 'plot', 'status', 'order'].map((k) => [k, params.get(k) ?? ''])
  )
  const key = params.toString()

  const clearStatus = () => {
    const next = new URLSearchParams(params)
    next.delete('status')
    next.delete('order')
    navigate(`/operations/search?${next}`)
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-6">
      <h1 className="text-center text-2xl font-bold">جست‌وجو در سوابق</h1>

      {/* بعد از آمدن لیست مزرعه‌ها فرم دوباره ساخته می‌شود تا مزرعه و قطعه‌ی انتخاب‌شده نشان داده شود */}
      <OperationFilter key={`${farms.data ? 1 : 0}-${key}`} farms={farms} initial={query} title="فیلترها" />

      {query.status && (
        <button
          onClick={clearStatus}
          className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-sm text-primary"
        >
          فقط {query.status.split(',').map((s) => OPERATION_STATUSES[s] ?? s).join('، ')}
          <X size={14} />
        </button>
      )}

      <SectionTitle>نتایج</SectionTitle>
      <Results key={key} query={query} />
    </main>
  )
}
