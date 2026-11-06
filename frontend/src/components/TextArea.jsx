import { forwardRef } from 'react'

// کادر متن چندخطی با برچسب و پیام خطا (هم‌ظاهر با Field)
const TextArea = forwardRef(function TextArea({ label, error, ...props }, ref) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <textarea
        ref={ref}
        rows={3}
        className={`w-full resize-none rounded-xl border bg-surface px-3 py-3 text-base outline-none transition
          focus:border-primary focus:ring-2 focus:ring-wheat/60
          ${error ? 'border-danger' : 'border-line'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
})

export default TextArea
