import { useState } from 'react'
import { Plus } from 'lucide-react'
import OperationModal from './OperationModal.jsx'

// دکمه‌ی «ثبت عملیات جدید»: همان مودال ویرایش عملیات را در حالت افزودن باز می‌کند.
// onSaved: بعد از ثبت موفق (مثلاً رفتن به صفحه‌ی عملیات یا تازه کردن لیست)
export default function AddOperationButton({ onSaved }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-wheat"
      >
        <Plus size={18} />
        ثبت عملیات جدید
      </button>

      {open && (
        <OperationModal
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); onSaved?.() }}
        />
      )}
    </>
  )
}
