import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Modal from '../Modal.jsx'
import Field from '../Field.jsx'
import Select from '../Select.jsx'
import TextArea from '../TextArea.jsx'
import Button from '../Button.jsx'
import DateField from '../DateField.jsx'
import FarmPlotSelects from '../dashboard/FarmPlotSelects.jsx'
import useLoad from '../../hooks/useLoad.js'
import { api } from '../../api.js'
import { toISO } from '../../utils/date.js'
import { isoToDate } from '../../utils/schedule.js'
import { OPERATION_TYPES } from '../../utils/format.js'

// فقط سه وضعیت به کاربر نشان داده می‌شود (in_progress مثل «انجام نشده» حساب می‌شود)
const STATUSES = [
  { value: 'planned', label: 'انجام نشده' },
  { value: 'completed', label: 'انجام شده' },
  { value: 'cancelled', label: 'لغو شده' },
]

// مودال افزودن (وقتی operation نباشد) یا ویرایش عملیات.
// defaultDate: تاریخ پیش‌فرض برنامه‌ریزی هنگام افزودن (مثلاً روز انتخاب‌شده در تقویم)
export default function OperationModal({ operation, defaultDate, onClose, onSaved }) {
  const farms = useLoad(api.farms)

  return (
    <Modal title={operation ? 'ویرایش عملیات' : 'افزودن عملیات'} onClose={onClose}>
      {farms.data?.length === 0 ? (
        <p className="text-sm text-muted">
          برای ثبت عملیات، اول <Link to="/farms?add=1" className="font-medium text-primary">یک مزرعه اضافه کن</Link>.
        </p>
      ) : farms.data ? (
        <FormBody farms={farms} operation={operation} defaultDate={defaultDate} onSaved={onSaved} />
      ) : farms.error ? (
        <p className="text-sm text-danger">{farms.error}</p>
      ) : (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-primary-soft" />)}
        </div>
      )}
    </Modal>
  )
}

function FormBody({ farms, operation: op, defaultDate, onSaved }) {
  const editing = Boolean(op)
  const [serverError, setServerError] = useState('')
  const form = useForm({
    defaultValues: {
      operation_type: op?.operation_type ?? '',
      crop_name: '',
      variety: '',
      title: op?.title ?? '',
      farm: op ? String(op.farm.id) : '',
      plot: op ? String(op.plot.id) : '',
      scheduled: op ? isoToDate(op.scheduled_date) : defaultDate ? isoToDate(defaultDate) : null,
      time: op?.scheduled_time?.slice(0, 5) ?? '',
      status: op ? (op.status === 'in_progress' ? 'planned' : op.status) : 'planned',
      completed: op?.completed_date ? isoToDate(op.completed_date) : null,
      description: op?.description ?? '',
    },
  })
  const { register, handleSubmit, control, watch, getValues, setValue, formState: { errors, isSubmitting } } = form
  const status = watch('status')
  const planting = !editing && watch('operation_type') === 'planting'

  // با انتخاب «انجام شده»، تاریخ انجام به‌طور پیش‌فرض امروز می‌شود
  useEffect(() => {
    if (status === 'completed' && !getValues('completed')) setValue('completed', new Date())
  }, [status, getValues, setValue])

  const onSubmit = async (v) => {
    setServerError('')
    const label = OPERATION_TYPES[v.operation_type]
    const description = v.description.trim()
    const time = v.time || null
    try {
      if (!editing) {
        const crop = v.crop_name.trim()
        const variety = v.variety.trim()
        await api.createOperation({
          plot_id: Number(v.plot),
          operation_type: v.operation_type,
          title: v.title.trim() || (planting ? `کاشت ${crop}` : label),
          scheduled_date: toISO(v.scheduled),
          ...(time && { scheduled_time: time }),
          ...(description && { description }),
          ...(planting && { crop_name: crop, ...(variety && { variety }) }),
          ...(v.status !== 'planned' && { status: v.status }),
          ...(v.status === 'completed' && { completed_date: toISO(v.completed) }),
        })
      } else {
        // فقط فیلدهای تغییرکرده فرستاده می‌شوند
        const body = {}
        if (v.operation_type !== op.operation_type) body.operation_type = v.operation_type
        // اگر عنوان همان نام پیش‌فرض نوع قبلی بود، با عوض شدن نوع، عنوان هم عوض می‌شود
        let title = v.title.trim() || label
        if (title === OPERATION_TYPES[op.operation_type]) title = label
        if (title !== op.title) body.title = title
        if (Number(v.plot) !== op.plot.id) body.plot_id = Number(v.plot)
        if (toISO(v.scheduled) !== op.scheduled_date) body.scheduled_date = toISO(v.scheduled)
        if (time !== (op.scheduled_time?.slice(0, 5) ?? null)) body.scheduled_time = time
        if ((description || null) !== (op.description ?? null)) body.description = description || null
        const wasStatus = op.status === 'in_progress' ? 'planned' : op.status
        if (v.status !== wasStatus) body.status = v.status
        if (v.status === 'completed') {
          const done = toISO(v.completed)
          if (done !== op.completed_date) body.completed_date = done
        }
        if (Object.keys(body).length) await api.updateOperation(op.id, body)
      }
      onSaved()
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
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

      {planting && (
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

      <Field label="عنوان (اختیاری)" placeholder="اگر خالی بماند، نوع عملیات ثبت می‌شود" {...register('title')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FarmPlotSelects form={form} farms={farms} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DateField
          control={control}
          name="scheduled"
          label="تاریخ برنامه‌ریزی‌شده"
          rules={{ required: 'تاریخ را انتخاب کن' }}
          error={errors.scheduled?.message}
        />
        <Field label="ساعت (اختیاری)" type="time" dir="ltr" {...register('time')} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">وضعیت</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {STATUSES.map((s) => (
            <label key={s.value} className="cursor-pointer">
              <input type="radio" value={s.value} className="peer sr-only" {...register('status')} />
              <span className="block rounded-lg border border-line px-3 py-1.5 text-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-wheat">
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {status === 'completed' && (
        <DateField
          control={control}
          name="completed"
          label="تاریخ انجام"
          rules={{ validate: (v) => getValues('status') !== 'completed' || Boolean(v) || 'تاریخ انجام را انتخاب کن' }}
          error={errors.completed?.message}
        />
      )}

      <TextArea label="توضیحات (اختیاری)" {...register('description')} />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>{editing ? 'ذخیره' : 'ثبت عملیات'}</Button>
    </form>
  )
}
