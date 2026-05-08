import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import { supabase } from './lib/supabase'

const NAV = [
  { key: 'search',    label: 'Search' },
  { key: 'dashboard', label: 'Dashboard' },
]

function App() {
  const { session, loading, user } = useAuth()
  const [page, setPage] = useState('search')

  if (loading) return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading...</div>
  if (!session) return <Auth />

  return (
    <>
      <nav style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
        {NAV.map(n => (
          <button
            key={n.key}
            onClick={() => setPage(n.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: page === n.key ? 700 : 400,
              borderBottom: page === n.key ? '2px solid #6366f1' : '2px solid transparent',
              paddingBottom: 4,
            }}
          >
            {n.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</span>
        <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 14px', cursor: 'pointer' }}>
          Sign out
        </button>
      </nav>
      {page === 'search'    && <Search />}
      {page === 'dashboard' && <Dashboard user={user} />}
    </>
  )
}

export default App
