import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../Modal.jsx'
import Field from '../Field.jsx'
import TextArea from '../TextArea.jsx'
import Button from '../Button.jsx'
import { api } from '../../api.js'
import { parseNumber } from '../../utils/format.js'

const UNITS = [
  { value: 'ha', label: 'هکتار' },
  { value: 'm2', label: 'متر مربع' },
]
const str = (v) => (v == null ? '' : String(v))
const orNull = (s) => s.trim() || null

// افزودن قطعه (وقتی plot داده نشود) یا ویرایش قطعه (وقتی plot داده شود). جدول plots.
export default function PlotFormModal({ farmId, plot, onClose, onSaved }) {
  const editing = Boolean(plot)
  const inHectares = !editing || plot.area_m2 >= 10000
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editing
      ? {
          name: plot.name,
          code: str(plot.code),
          area: String(inHectares ? plot.area_m2 / 10000 : plot.area_m2),
          unit: inHectares ? 'ha' : 'm2',
          soil_type: str(plot.soil_type),
          description: str(plot.description),
        }
      : { name: '', code: '', area: '', unit: 'ha', soil_type: '', description: '' },
  })

  const onSubmit = async (v) => {
    setServerError('')
    const area = parseNumber(v.area)
    const body = {
      name: v.name.trim(),
      code: orNull(v.code),
      area_m2: Math.round((v.unit === 'ha' ? area * 10000 : area) * 100) / 100, // دیتابیس به متر مربع ذخیره می‌کند
      soil_type: orNull(v.soil_type),
      description: orNull(v.description),
    }
    try {
      if (editing) {
        await api.updatePlot(plot.id, body) // null یعنی پاک کردن مقدار
      } else {
        // در افزودن، فیلدهای خالی ارسال نمی‌شوند
        await api.createPlot(farmId, Object.fromEntries(Object.entries(body).filter(([, x]) => x !== null)))
      }
      onSaved()
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <Modal title={editing ? 'ویرایش اطلاعات قطعه' : 'افزودن قطعه زراعی'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="نام قطعه"
          autoFocus
          placeholder="مثلاً قطعه‌ی شمالی"
          error={errors.name?.message}
          {...register('name', { validate: (v) => v.trim() !== '' || 'نام قطعه را وارد کن' })}
        />

        <div>
          <Field
            label="مساحت"
            dir="ltr"
            inputMode="decimal"
            error={errors.area?.message}
            {...register('area', {
              validate: (v) => {
                const n = parseNumber(v)
                return (v.trim() !== '' && Number.isFinite(n) && n > 0) || 'مساحت را به‌صورت عدد بزرگ‌تر از صفر وارد کن'
              },
            })}
          />
          {/* انتخاب واحد */}
          <div className="mt-2 flex gap-2 text-sm">
            {UNITS.map((u) => (
              <label key={u.value} className="cursor-pointer">
                <input type="radio" value={u.value} className="peer sr-only" {...register('unit')} />
                <span className="block rounded-lg border border-line px-3 py-1.5 text-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-wheat">
                  {u.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="کد قطعه (اختیاری)" dir="ltr" placeholder="A1" {...register('code')} />
          <Field label="نوع خاک (اختیاری)" placeholder="مثلاً لومی" {...register('soil_type')} />
        </div>

        <TextArea label="توضیحات (اختیاری)" {...register('description')} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>{editing ? 'ذخیره' : 'ثبت قطعه'}</Button>
      </form>
    </Modal>
  )
}
