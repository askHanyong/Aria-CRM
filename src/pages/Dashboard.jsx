import { supabase } from '../lib/supabase'

export default function Dashboard({ user }) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 16px' }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.email}</p>
      <button onClick={handleSignOut} style={{ padding: '8px 16px' }}>
        Sign Out
      </button>
    </div>
  )
}
