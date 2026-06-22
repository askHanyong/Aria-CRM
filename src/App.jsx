import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import RequireAuth from './components/RequireAuth'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Lessons from './pages/Lessons'
import PaymentCycles from './pages/PaymentCycles'

export default function App() {
  const { user, session } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout user={user} />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="payment-cycles" element={<PaymentCycles />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
