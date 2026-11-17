import { useEffect } from 'react'
import { X } from 'lucide-react'

// مودال عمومی: روی موبایل از پایین صفحه بالا می‌آید، روی لپ‌تاپ وسط صفحه است.
// با ✕، کلید Escape یا کلیک روی پس‌زمینه بسته می‌شود.
// برای نمایش مودال، خودش را شرطی رندر کن: {open && <Modal ...>}
export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden' // جلوگیری از اسکرول صفحه‌ی پشت
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30 sm:items-center sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="بستن" className="rounded-lg p-1.5 text-muted hover:bg-bg">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
