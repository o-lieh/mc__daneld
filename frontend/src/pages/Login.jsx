import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthCard from '../components/AuthCard.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import { api } from '../api.js'
import { isValidIranMobile, toE164 } from '../utils/phone.js'

export default function Login() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (v) => {
    setServerError('')
    try {
      // شماره به قالب E.164 تبدیل می‌شود: 09123456789 -> +989123456789
      await api.login({ phone: toE164(v.phone), password: v.password })
      navigate('/dashboard')
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <AuthCard
      title="ورود به حساب"
      subtitle="برای دیدن اطلاعات مزرعه‌ات وارد شو."
      footer={<>حساب نداری؟ <Link to="/register" className="font-medium text-primary">ثبت‌نام کن</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field
          label="شماره موبایل"
          type="tel"
          dir="ltr"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09123456789"
          error={errors.phone?.message}
          {...register('phone', {
            required: 'شماره موبایل را وارد کن',
            validate: (v) => isValidIranMobile(v) || 'شماره موبایل معتبر نیست',
          })}
        />
        <Field
          label="رمز عبور"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'رمز عبور را وارد کن' })}
        />
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>ورود</Button>
      </form>
    </AuthCard>
  )
}
