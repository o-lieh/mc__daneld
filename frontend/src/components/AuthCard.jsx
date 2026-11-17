// محتوای مشترک صفحه‌های ورود و ثبت‌نام: عنوان، فرم و لینک جابه‌جایی (بدون کادر)
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      <div className="mt-8">{children}</div>
      <p className="mt-8 text-center text-sm text-muted">{footer}</p>
    </div>
  )
}
