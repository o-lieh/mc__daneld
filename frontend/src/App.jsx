import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/PublicLayout.jsx'
import AppShell from './components/AppShell.jsx'
import AuthLayout from './components/AuthLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Operations from './pages/Operations.jsx'
import Placeholder from './pages/Placeholder.jsx'
import Farms from './pages/Farms.jsx'
import FarmDetail from './pages/FarmDetail.jsx'
import PlotDetail from './pages/PlotDetail.jsx'
import SearchOperations from './pages/SearchOperations.jsx'
import Calendar from './pages/Calendar.jsx'

// صفحه‌ی موقت برای صفحه‌هایی که بعداً ساخته می‌شوند
const soon = (title) => <Placeholder title={title} />

export default function App() {
  return (
    <Routes>
      {/* صفحه‌های عمومی */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      </Route>

      {/* صفحه‌های بعد از ورود: همه داخل AppShell (منو + محتوا) */}
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/operations/recent" element={<Operations />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/operations/search" element={<SearchOperations />} />
        <Route path="/operations/:id/edit" element={soon('ویرایش عملیات')} />
        <Route path="/farms" element={<Farms />} />
        <Route path="/farms/new" element={<Navigate to="/farms?add=1" replace />} />
        <Route path="/farms/:id" element={<FarmDetail />} />
	<Route path="/plots/:id" element={<PlotDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
