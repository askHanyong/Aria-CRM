import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="mt-20 text-center text-gray-500">Loading…</div>
  }

  if (!session) return <Navigate to="/login" replace />

  return children
}
