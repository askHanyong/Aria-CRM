import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Admin from './pages/Admin'
import Import from './pages/Import'
import { supabase } from './lib/supabase'

const PROTECTED = new Set(['admin', 'import', 'dashboard'])

const AUTH_MESSAGES = {
  admin:     'Sign in to access the Admin page.',
  import:    'Sign in to access the Import page.',
  dashboard: 'Sign in to access the Dashboard.',
  signin:    null,
}

export default function App() {
  const { session, loading, user } = useAuth()
  const [page, setPage] = useState('search')

  useEffect(() => {
    if (!session && PROTECTED.has(page)) setPage('search')  // sign-out → back to search
    if (session  && page === 'signin')   setPage('search')  // sign-in  → leave sign-in page
  }, [session])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80, fontFamily: 'system-ui', color: '#6b7280' }}>
        Loading…
      </div>
    )
  }

  const showingAuth = !session && (page === 'signin' || PROTECTED.has(page))

  return (
    <>
      <nav style={navStyle}>
        {/* Always-visible tab */}
        <NavTab label="Search" active={page === 'search'} onClick={() => setPage('search')} />

        {session ? (
          <>
            <NavTab label="Admin"     active={page === 'admin'}     onClick={() => setPage('admin')} />
            <NavTab label="Import"    active={page === 'import'}    onClick={() => setPage('import')} />
            <NavTab label="Dashboard" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</span>
            <button style={signOutStyle} onClick={() => supabase.auth.signOut()}>Sign out</button>
          </>
        ) : (
          <button
            style={{ ...signOutStyle, marginLeft: 'auto', background: '#6366f1', color: '#fff', borderColor: '#6366f1' }}
            onClick={() => setPage('signin')}
          >
            Sign In
          </button>
        )}
      </nav>

      {page === 'search' && <Search />}

      {/* Protected pages: render content when logged in, sign-in form when not */}
      {PROTECTED.has(page) && (
        session
          ? <>
              {page === 'admin'     && <Admin />}
              {page === 'import'    && <Import />}
              {page === 'dashboard' && <Dashboard user={user} />}
            </>
          : <Auth message={AUTH_MESSAGES[page]} />
      )}

      {/* Standalone sign-in page (reached via nav Sign In button) */}
      {page === 'signin' && !session && <Auth />}
    </>
  )
}

function NavTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        fontWeight: active ? 700 : 400,
        color: active ? '#6366f1' : '#374151',
        borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
        paddingBottom: 4,
        paddingTop: 4,
      }}
    >
      {label}
    </button>
  )
}

const navStyle = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  padding: '12px 24px',
  borderBottom: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
}

const signOutStyle = {
  padding: '6px 16px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  fontSize: '0.875rem',
  background: 'none',
  color: '#374151',
}
