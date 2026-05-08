import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const { session, loading, user } = useAuth()

  if (loading) return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading...</div>

  return session ? <Dashboard user={user} /> : <Auth />
}

export default App
