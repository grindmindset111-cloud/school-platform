import { Link, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/auth'

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Students', '/students'],
  ['Staff', '/staff'],
  ['Courses', '/courses'],
  ['Attendance', '/attendance'],
  ['Results', '/results'],
  ['Notifications', '/notifications'],
  ['Settings', '/settings'],
]

export default function Layout() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>School Platform</h2>
        <nav>
          {navItems.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <strong>{user?.name || user?.email || 'User'}</strong>
            <span>{user?.role || 'authenticated'}</span>
          </div>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
