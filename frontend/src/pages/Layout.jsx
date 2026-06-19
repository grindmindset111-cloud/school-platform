import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarClock,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  LogOut,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import Brand from '@/components/Brand'
import useAuthStore from '@/store/auth'

// nav items per role. Each item: { label, to, icon, exact? }
const NAV_BY_ROLE = {
  student: [
    { label: 'Dashboard', to: '/dashboard', icon: <BarChart3 size={18} />, exact: true },
    { label: 'My Bookings', to: '/bookings', icon: <CalendarClock size={18} /> },
    { label: 'Notifications', to: '/notifications', icon: <Bell size={18} /> },
    { label: 'Settings', to: '/settings', icon: <Settings size={18} /> },
  ],
  staff: [
    { label: 'Dashboard', to: '/dashboard', icon: <BarChart3 size={18} />, exact: true },
    { label: 'Bookings', to: '/bookings', icon: <CalendarClock size={18} /> },
    { label: 'Students', to: '/students', icon: <Users size={18} /> },
    { label: 'Courses', to: '/courses', icon: <BookOpen size={18} /> },
    { label: 'Attendance', to: '/attendance', icon: <ClipboardList size={18} /> },
    { label: 'Results', to: '/results', icon: <GraduationCap size={18} /> },
    { label: 'Notifications', to: '/notifications', icon: <Bell size={18} /> },
    { label: 'Settings', to: '/settings', icon: <Settings size={18} /> },
  ],
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: <BarChart3 size={18} />, exact: true },
    { label: 'Bookings', to: '/bookings', icon: <CalendarClock size={18} /> },
    { label: 'Students', to: '/students', icon: <Users size={18} /> },
    { label: 'Staff', to: '/staff', icon: <UserCog size={18} /> },
    { label: 'Courses', to: '/courses', icon: <BookOpen size={18} /> },
    { label: 'Attendance', to: '/attendance', icon: <ClipboardList size={18} /> },
    { label: 'Results', to: '/results', icon: <GraduationCap size={18} /> },
    { label: 'Notifications', to: '/notifications', icon: <Bell size={18} /> },
    { label: 'Settings', to: '/settings', icon: <Settings size={18} /> },
  ],
}

const PAGE_META = {
  '/dashboard': { crumb: 'Overview', label: 'Dashboard' },
  '/bookings': { crumb: 'Operations', label: 'Bookings' },
  '/bookings/new': { crumb: 'Bookings', label: 'New booking' },
  '/students': { crumb: 'People', label: 'Students' },
  '/staff': { crumb: 'People', label: 'Staff' },
  '/courses': { crumb: 'Academic', label: 'Courses' },
  '/attendance': { crumb: 'Academic', label: 'Attendance' },
  '/results': { crumb: 'Academic', label: 'Results' },
  '/notifications': { crumb: 'Account', label: 'Notifications' },
  '/settings': { crumb: 'Account', label: 'Settings' },
}

function getPageMeta(pathname) {
  // detail / edit pages share the same section as their parent
  if (pathname.startsWith('/bookings/')) {
    return { crumb: 'Operations', label: 'Booking detail' }
  }
  // exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  // fall back: first matching prefix
  const prefix = Object.keys(PAGE_META)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return (
    PAGE_META[prefix] || { crumb: 'Overview', label: 'Dashboard' }
  )
}

function roleKey(user) {
  const r = String(user?.role || '').toLowerCase()
  if (NAV_BY_ROLE[r]) return r
  return 'student'
}

function initials(name) {
  if (!name) return '?'
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const role = roleKey(user)
  const navItems = NAV_BY_ROLE[role]
  const meta = getPageMeta(location.pathname)

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to
    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    )
  }

  return (
    <div className="sp-shell">
      <aside className="sp-sidebar">
        <Brand tone="light" />

        <div className="nav-section">
          <div className="nav-section-title">Workspace</div>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item${isActive(item) ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sp-sidebar-footer">
          <div className="sp-sidebar-user">
            <span className="sp-avatar" aria-hidden="true">
              {initials(user?.name || user?.email)}
            </span>
            <div className="sp-user-meta">
              <div className="sp-user-name">
                {user?.name || user?.email || 'You'}
              </div>
              <div className="sp-user-role">{user?.role || role}</div>
            </div>
          </div>
          <button
            type="button"
            className="logout"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Log out
          </button>
        </div>
      </aside>

      <div className="sp-main">
        <header className="sp-topbar">
          <div className="crumbs">
            <CalendarRange size={14} />
            <span>{meta.crumb}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <strong>{meta.label}</strong>
          </div>
          <div className="spacer" />
          <div className="topbar-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Notifications"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Settings"
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        <main className="sp-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
