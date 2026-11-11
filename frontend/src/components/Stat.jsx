import { faNumber } from '../utils/format.js'

// کادر عدد با برچسب (برای وضعیت کنونی مزرعه و قطعه)
export default function Stat({ label, hint, value, className }) {
  return (
    <div className={`rounded-xl p-4 text-center ${className}`}>
      <p className="text-3xl font-bold">{faNumber(value)}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="text-xs opacity-70">{hint}</p>
    </div>
  )
}
