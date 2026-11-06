import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Card from '../Card.jsx'
import Field from '../Field.jsx'
import Select from '../Select.jsx'
import TextArea from '../TextArea.jsx'
import Button from '../Button.jsx'
import DateField from '../DateField.jsx'
import FarmPlotSelects from './FarmPlotSelects.jsx'
import { api } from '../../api.js'
import { toISO } from '../../utils/date.js'
import { OPERATION_TYPES } from '../../utils/format.js'



// title: عنوان کارت (null = بدون عنوان)
// onSuccess: بعد از ثبت موفق صدا زده می‌شود؛ اگر ندهی به /operations/recent می‌رود.
export default function OperationForm({ farms, title = 'ثبت عملیات', onSuccess }) {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const form = useForm({
    defaultValues: { operation_type: '', crop_name: '', variety: '', title: '', scheduled: null, time: '', description: '', farm: '', plot: '' },
  })
  const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = form

  const noFarms = !farms.loading && !farms.error && (farms.data ?? []).length === 0

  const onSubmit = async (v) => {
    setServerError('')
    try {
      const description = v.description.trim()
      const planting = v.operation_type === 'planting'
      const crop = v.crop_name.trim()
      const variety = v.variety.trim()
          await api.createOperation({
        plot_id: Number(v.plot), // مزرعه فقط برای فیلتر کردن قطعه‌هاست و ارسال نمی‌شود
        operation_type: v.operation_type,
        title: v.title.trim() || (planting ? `کاشت ${crop}` : OPERATION_TYPES[v.operation_type]),
        scheduled_date: toISO(v.scheduled),
        ...(v.time && { scheduled_time: v.time }), // ساعت اختیاری است
        ...(description && { description }),
	...(planting && { crop_name: crop, 
	...(variety && { variety }) }),
      })
      reset()
      if (onSuccess) onSuccess()
      else navigate('/operations/recent')
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <Card title={title}>
      {farms.error && <p className="mb-3 text-sm text-danger">{farms.error}</p>}

      {noFarms ? (
        <p className="text-sm text-muted">
          برای ثبت عملیات، اول <Link to="/farms/new" className="font-medium text-primary">یک مزرعه اضافه کن</Link>.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Select
  label="نوع عملیات"
  placeholder="انتخاب نوع عملیات"
  error={errors.operation_type?.message}
  {...register('operation_type', { required: 'نوع عملیات را انتخاب کن' })}
>
  {Object.entries(OPERATION_TYPES).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
  ))}
</Select>
{watch('operation_type') === 'planting' && (
  <div className="grid gap-4 sm:grid-cols-2">
    <Field
      label="محصول"
      placeholder="مثلاً گندم"
      error={errors.crop_name?.message}
      {...register('crop_name', { validate: (v) => v.trim() !== '' || 'نام محصول را وارد کن' })}
    />
    <Field label="رقم (اختیاری)" {...register('variety')} />
  </div>
)}
<Field
  label="عنوان (اختیاری)"
  placeholder="اگر خالی بماند، نوع عملیات ثبت می‌شود"
  {...register('title')}
/>

<div className="grid gap-4 sm:grid-cols-2">
  <DateField
    control={control}
    name="scheduled"
    label="تاریخ انجام"
    rules={{ required: 'تاریخ را انتخاب کن' }}
    error={errors.scheduled?.message}
  />
  <Field label="ساعت (اختیاری)" type="time" dir="ltr" {...register('time')} />
</div>
<TextArea label="توضیحات (اختیاری)" {...register('description')} />
          {serverError && <p className="text-sm text-danger">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>ثبت عملیات</Button>
        </form>
      )}
    </Card>
  )
}
