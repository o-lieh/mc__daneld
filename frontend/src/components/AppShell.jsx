import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import Footer from './Footer.jsx'

// قاب همه‌ی صفحه‌های بعد از ورود: نوار کناری (لپ‌تاپ) یا منوی کشویی (موبایل) + محتوا
export default function AppShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setOpen(true)} />
        <Outlet />
        <Footer />
      </div>
    </div>
  )
}
