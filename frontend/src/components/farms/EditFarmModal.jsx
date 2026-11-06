import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../Modal.jsx'
import Field from '../Field.jsx'
import TextArea from '../TextArea.jsx'
import Button from '../Button.jsx'
import { api } from '../../api.js'
import { parseNumber } from '../../utils/format.js'

const str = (v) => (v == null ? '' : String(v))
const orNull = (s) => s.trim() || null // خالی = پاک کردن مقدار

// ویرایش اطلاعات کلی مزرعه (جدول farms). منطقه‌ی زمانی در این فرم نیست و پیش‌فرض بک‌اند (Asia/Tehran) می‌ماند.
export default function EditFarmModal({ farm, onClose, onSaved }) {
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: farm.name,
      province: str(farm.province),
      city: str(farm.city),
      address: str(farm.address),
      latitude: str(farm.latitude),
      longitude: str(farm.longitude),
      description: str(farm.description),
    },
  })

  // مختصات: یا هر دو خالی، یا هر دو معتبر (مطابق قید دیتابیس)
  const geo = (min, max, msg) => (v) => {
    const lat = getValues('latitude').trim()
    const lng = getValues('longitude').trim()
    if (!lat && !lng) return true
    if (!v.trim()) return 'مختصات باید کامل باشد؛ هر دو را وارد کن یا هر دو را خالی بگذار'
    const n = parseNumber(v)
    return (Number.isFinite(n) && n >= min && n <= max) || msg
  }

  const onSubmit = async (v) => {
    setServerError('')
    try {
      await api.updateFarm(farm.id, {
        name: v.name.trim(),
        province: orNull(v.province),
        city: orNull(v.city),
        address: orNull(v.address),
        latitude: v.latitude.trim() ? parseNumber(v.latitude) : null,
        longitude: v.longitude.trim() ? parseNumber(v.longitude) : null,
        description: orNull(v.description),
      })
      onSaved()
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <Modal title="ویرایش اطلاعات مزرعه" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="نام مزرعه"
          error={errors.name?.message}
          {...register('name', { validate: (v) => v.trim() !== '' || 'نام مزرعه را وارد کن' })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="استان" {...register('province')} />
          <Field label="شهر" {...register('city')} />
        </div>
        <Field label="آدرس" autoComplete="street-address" {...register('address')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="عرض جغرافیایی"
            dir="ltr"
            inputMode="decimal"
            placeholder="36.29"
            error={errors.latitude?.message}
            {...register('latitude', { validate: geo(-90, 90, 'عرض جغرافیایی معتبر نیست') })}
          />
          <Field
            label="طول جغرافیایی"
            dir="ltr"
            inputMode="decimal"
            placeholder="59.60"
            error={errors.longitude?.message}
            {...register('longitude', { validate: geo(-180, 180, 'طول جغرافیایی معتبر نیست') })}
          />
        </div>
        <TextArea label="توضیحات" {...register('description')} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>ذخیره</Button>
      </form>
    </Modal>
  )
}
