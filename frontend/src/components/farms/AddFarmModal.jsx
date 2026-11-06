import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '../Modal.jsx'
import Field from '../Field.jsx'
import TextArea from '../TextArea.jsx'
import Button from '../Button.jsx'
import { api } from '../../api.js'

// فرم افزودن مزرعه (نام اجباری؛ آدرس و توضیحات اختیاری)
// onClose: بستن مودال، onCreated: بعد از ثبت موفق
export default function AddFarmModal({ onClose, onCreated }) {
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', address: '', description: '' },
  })

  const onSubmit = async (v) => {
    setServerError('')
    const address = v.address.trim()
    const description = v.description.trim()
    try {
      await api.createFarm({
        name: v.name.trim(),
        ...(address && { address }),          // فیلد خالی ارسال نمی‌شود
        ...(description && { description }),
      })
      onCreated()
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <Modal title="افزودن مزرعه" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="نام مزرعه"
          autoFocus
          placeholder="مثلاً مزرعه‌ی گندم"
          error={errors.name?.message}
          {...register('name', {
            validate: (v) => v.trim() !== '' || 'نام مزرعه را وارد کن',
          })}
        />
        <Field
          label="آدرس (اختیاری)"
          autoComplete="street-address"
          {...register('address')}
        />
        <TextArea label="توضیحات (اختیاری)" {...register('description')} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>ثبت مزرعه</Button>
      </form>
    </Modal>
  )
}
