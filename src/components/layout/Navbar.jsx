import { NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-md ${
    isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
  }`

export default function Navbar({ user }) {
  return (
    <nav className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-3">
      <span className="mr-4 text-lg font-semibold text-gray-900">Tuition Tracker</span>
      <NavLink to="/" className={linkClass} end>
        Dashboard
      </NavLink>
      <NavLink to="/students" className={linkClass}>
        Students
      </NavLink>
      <NavLink to="/lessons" className={linkClass}>
        Lessons
      </NavLink>
      <NavLink to="/payment-cycles" className={linkClass}>
        Payment cycles
      </NavLink>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
