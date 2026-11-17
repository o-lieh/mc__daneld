import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AuthCard from '../components/AuthCard.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import { api } from '../api.js'
import { isValidIranMobile, toE164 } from '../utils/phone.js'

export default function Register() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (v) => {
    setServerError('')
    const phone = toE164(v.phone)
    const email = v.email.trim()
    try {
      await api.register({
        full_name: v.full_name.trim(),
        phone,
        password: v.password,
        ...(email && { email }), // ایمیل اختیاری است؛ خالی نمی‌فرستیم
      })
      // ثبت‌نام توکن برنمی‌گرداند، پس بلافاصله وارد می‌کنیم
      await api.login({ phone, password: v.password })
      navigate('/dashboard')
    } catch (e) {
      setServerError(e.message)
    }
  }

  return (
    <AuthCard
      title="ساخت حساب"
      subtitle="در چند ثانیه شروع کن و مزرعه‌ات را ثبت کن."
      footer={<>حساب داری؟ <Link to="/login" className="font-medium text-primary">وارد شو</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field
          label="نام و نام خانوادگی"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register('full_name', { required: 'نام را وارد کن' })}
        />
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
          label="ایمیل (اختیاری)"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register('email', {
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'ایمیل معتبر نیست' },
          })}
        />
        <Field
          label="رمز عبور"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'رمز عبور را وارد کن',
            minLength: { value: 8, message: 'رمز عبور حداقل ۸ کاراکتر باشد' },
          })}
        />
        <Field
          label="تکرار رمز عبور"
          type="password"
          dir="ltr"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm', {
            required: 'رمز را دوباره وارد کن',
            validate: (v) => v === watch('password') || 'رمزها یکسان نیستند',
          })}
        />
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>ساخت حساب</Button>
      </form>
    </AuthCard>
  )
}
