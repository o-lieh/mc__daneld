import { useNavigate } from 'react-router-dom'
import UpcomingTasks from '../components/dashboard/UpcomingTasks.jsx'
import AddOperationButton from '../components/operations/AddOperationButton.jsx'
import FarmList from '../components/dashboard/FarmList.jsx'
import OperationFilter from '../components/dashboard/OperationFilter.jsx'
import useLoad from '../hooks/useLoad.js'
import { api } from '../api.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const tasks = useLoad(api.upcomingTasks)
  const farms = useLoad(api.farms) // یک‌بار گرفته می‌شود و بین بخش‌ها مشترک است

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-5 px-4 py-6">
      <h1 className="text-2xl font-bold">روز بخیر</h1>
      <UpcomingTasks {...tasks} />
      {/* بعد از ثبت، به صفحه‌ی عملیات‌های اخیر می‌رویم */}
      <AddOperationButton onSaved={() => navigate('/operations/recent')} />
      <FarmList {...farms} />
      <OperationFilter farms={farms} />
    </main>
  )
}
