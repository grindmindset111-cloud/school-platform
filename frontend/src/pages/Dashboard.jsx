import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarClock,
  CalendarRange,
  GraduationCap,
  Inbox,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { getApiErrorMessage } from '@/api/errors'
import { getDashboard } from '@/api/resources'
import useAuthStore from '@/store/auth'

/* --------------------------------------------------------------------- */
/* Helpers                                                                */
/* --------------------------------------------------------------------- */

function getCount(value) {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number') return value
  return value ?? 0
}

function friendlyName(payload) {
  if (!payload) return 'there'
  const u = useAuthStore.getState().user
  return u?.name?.split(' ')[0] || u?.email?.split('@')[0] || 'there'
}

function formatDate(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

function TrendBars({ data, label = 'Bookings this month' }) {
  const rows = Array.isArray(data) ? data : []
  const max = rows.reduce((m, r) => Math.max(m, Number(r?.count) || 0), 0)
  const total = rows.reduce((s, r) => s + (Number(r?.count) || 0), 0)

  // 30 day window; show actual day numbers as labels
  const days = []
  for (let i = 1; i <= 30; i += 1) days.push(i)
  const byDay = new Map(rows.map((r) => [String(r.day), Number(r.count) || 0]))

  return (
    <div>
      <div className="sp-trend" role="img" aria-label={label}>
        {days.map((d) => {
          const value = byDay.get(String(d)) || 0
          const heightPct = max > 0 ? Math.max(4, (value / max) * 100) : 4
          return (
            <div
              key={d}
              className={`bar${value === 0 ? ' empty' : ''}`}
              style={{ height: `${heightPct}%` }}
              title={`Day ${d}: ${value} booking${value === 1 ? '' : 's'}`}
            />
          )
        })}
      </div>
      <div className="sp-trend-labels">
        <span>1</span>
        <span>15</span>
        <span>30</span>
      </div>
      <div className="sp-trend-summary">
        {total} booking{total === 1 ? '' : 's'} recorded in the last 30 days
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }) {
  return (
    <article className="sp-stat">
      <div className={`stat-icon ${icon.tone}`}>{icon.node}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-delta">{sub}</div>}
    </article>
  )
}

function NotificationCard({ notifications, unread }) {
  const list = Array.isArray(notifications) ? notifications.slice(0, 5) : []
  return (
    <article className="sp-card">
      <div className="sp-card-head">
        <div>
          <h3>Notifications</h3>
          <div className="meta">
            {unread > 0
              ? `${unread} unread`
              : 'You are all caught up'}
          </div>
        </div>
        <Link className="text-link" to="/notifications">
          View all
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="sp-list-empty">No notifications yet.</div>
      ) : (
        <div className="sp-list">
          {list.map((n) => (
            <div className="sp-list-item" key={n.id || `${n.title}-${n.createdAt}`}>
              <span className="dot" aria-hidden="true" />
              <div className="body">
                <strong>{n.title || n.message || 'Update'}</strong>
                {(n.message || n.body) && n.title && (
                  <p>{n.message || n.body}</p>
                )}
                <time>{formatDate(n.createdAt)}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function QuickActions({ role }) {
  const items = {
    student: [
      {
        icon: <CalendarClock size={18} />,
        title: 'New booking',
        desc: 'Reserve a room, lab, or resource',
        to: '/bookings/new',
        cta: 'Create',
      },
      {
        icon: <CalendarRange size={18} />,
        title: 'My bookings',
        desc: 'Track requests and queue positions',
        to: '/bookings',
        cta: 'Open',
      },
      {
        icon: <Award size={18} />,
        title: 'My results',
        desc: 'Check released scores and feedback',
        to: '/results',
        cta: 'View',
      },
    ],
    staff: [
      {
        icon: <CalendarClock size={18} />,
        title: 'Pending approvals',
        desc: 'Review and approve booking requests',
        to: '/bookings',
        cta: 'Open',
      },
      {
        icon: <Users size={18} />,
        title: 'Students',
        desc: 'Manage class lists and profiles',
        to: '/students',
        cta: 'View',
      },
      {
        icon: <BookOpen size={18} />,
        title: 'Courses',
        desc: 'See your assigned courses',
        to: '/courses',
        cta: 'View',
      },
    ],
    admin: [
      {
        icon: <CalendarClock size={18} />,
        title: 'All bookings',
        desc: 'Monitor every booking across the school',
        to: '/bookings',
        cta: 'Open',
      },
      {
        icon: <Users size={18} />,
        title: 'People',
        desc: 'Manage students and staff',
        to: '/students',
        cta: 'Open',
      },
      {
        icon: <BookOpen size={18} />,
        title: 'Academic',
        desc: 'Courses, attendance, results',
        to: '/courses',
        cta: 'Open',
      },
    ],
  }
  const list = items[role] || items.student
  return (
    <article className="sp-card">
      <div className="sp-card-head">
        <h3>Quick actions</h3>
        <span className="meta">Common tasks</span>
      </div>
      <div className="sp-action-list">
        {list.map((a) => (
          <Link key={a.title} to={a.to} className="action" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="ai" aria-hidden="true">{a.icon}</span>
            <span className="txt" style={{ flex: 1 }}>
              <strong>{a.title}</strong>
              <span>{a.desc}</span>
            </span>
            <span className="text-link" style={{ alignSelf: 'center' }}>
              {a.cta} <ArrowRight size={12} style={{ verticalAlign: '-1px' }} />
            </span>
          </Link>
        ))}
      </div>
    </article>
  )
}

/* --------------------------------------------------------------------- */
/* Page                                                                   */
/* --------------------------------------------------------------------- */

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    async function loadDashboard() {
      try {
        setLoading(true)
        const payload = await getDashboard()
        if (alive) {
          setData(payload)
          setError('')
        }
      } catch (err) {
        if (alive) setError(getApiErrorMessage(err, 'Unable to load dashboard'))
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      alive = false
    }
  }, [])

  const role = useMemo(() => {
    const explicit = (data?.role || user?.role || '').toString().toUpperCase()
    if (explicit) return explicit
    return 'STUDENT'
  }, [data, user])

  if (loading) {
    return (
      <div className="sp-page">
        <div className="sp-card">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sp-page">
        <div className="sp-error-banner" role="alert">
          <AlertTriangle size={16} style={{ flex: '0 0 16px', marginTop: 1 }} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="sp-page">
      {role === 'STUDENT' && <StudentDashboard data={data} user={user} />}
      {role === 'STAFF' && <StaffDashboard data={data} user={user} />}
      {role === 'ADMIN' && <AdminDashboard data={data} user={user} />}
    </div>
  )
}

/* --------------------------------------------------------------------- */
/* Student                                                                 */
/* --------------------------------------------------------------------- */

function StudentDashboard({ data, user }) {
  const bookings = data?.bookings || {}
  const results = data?.results || {}
  const classLevel = data?.classLevel
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <>
      <section className="sp-banner">
        <div className="banner-text">
          <div className="banner-chip">
            <Sparkles size={12} /> Student workspace
          </div>
          <h2>Welcome back, {firstName}.</h2>
          <p>
            {classLevel
              ? `You're in ${classLevel.name}. You have ${bookings.upcoming || 0} upcoming booking${(bookings.upcoming || 0) === 1 ? '' : 's'} and ${bookings.thisMonth || 0} this month.`
              : `You have ${bookings.upcoming || 0} upcoming booking${(bookings.upcoming || 0) === 1 ? '' : 's'} and ${bookings.thisMonth || 0} this month.`}
          </p>
        </div>
        <div className="banner-cta">
          <Link className="button-link btn-on-banner" to="/bookings/new">
            <CalendarCheck2 size={16} /> New booking
          </Link>
          <Link className="button-link btn-on-banner ghost" to="/bookings">
            View bookings
          </Link>
        </div>
      </section>

      <div className="sp-stat-grid">
        <StatCard
          icon={{ node: <CalendarClock size={18} />, tone: 'indigo' }}
          label="Total bookings"
          value={getCount(bookings.total)}
        />
        <StatCard
          icon={{ node: <TrendingUp size={18} />, tone: 'green' }}
          label="Upcoming"
          value={getCount(bookings.upcoming)}
          sub="Approved and pending"
        />
        <StatCard
          icon={{ node: <CalendarRange size={18} />, tone: 'amber' }}
          label="This month"
          value={getCount(bookings.thisMonth)}
        />
        <StatCard
          icon={{ node: <Award size={18} />, tone: 'violet' }}
          label="Average score"
          value={
            typeof results.averageScore === 'number' && results.averageScore > 0
              ? results.averageScore.toFixed(1)
              : '—'
          }
          sub={`${getCount(results.total)} result${getCount(results.total) === 1 ? '' : 's'} released`}
        />
      </div>

      <div className="sp-grid-2">
        <div className="col">
          <article className="sp-card">
            <div className="sp-card-head">
              <div>
                <h3>Booking activity</h3>
                <span className="meta">Daily counts for this month</span>
              </div>
              <Link className="text-link" to="/bookings">
                Open <ArrowRight size={12} style={{ verticalAlign: '-1px' }} />
              </Link>
            </div>
            <TrendBars data={data?.monthlyBookingTrends} label="Student booking activity" />
          </article>

          <QuickActions role="student" />
        </div>

        <div className="col">
          <NotificationCard
            notifications={data?.notifications}
            unread={data?.unreadNotifications}
          />
        </div>
      </div>
    </>
  )
}

/* --------------------------------------------------------------------- */
/* Staff                                                                   */
/* --------------------------------------------------------------------- */

function StaffDashboard({ data, user }) {
  const bookings = data?.bookings || {}
  const results = data?.results || {}
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <>
      <section className="sp-banner">
        <div className="banner-text">
          <div className="banner-chip">
            <Sparkles size={12} /> Staff workspace
          </div>
          <h2>Good to see you, {firstName}.</h2>
          <p>
            You have {bookings.pending || 0} pending booking
            {(bookings.pending || 0) === 1 ? '' : 's'} and {bookings.thisMonth || 0} total this month. {results.pendingRelease || 0} results are awaiting release.
          </p>
        </div>
        <div className="banner-cta">
          <Link className="button-link btn-on-banner" to="/bookings">
            <Inbox size={16} /> Review bookings
          </Link>
          <Link className="button-link btn-on-banner ghost" to="/results">
            <Award size={16} /> Results
          </Link>
        </div>
      </section>

      <div className="sp-stat-grid">
        <StatCard
          icon={{ node: <CalendarClock size={18} />, tone: 'indigo' }}
          label="Pending bookings"
          value={getCount(bookings.pending)}
          sub="Across your subjects"
        />
        <StatCard
          icon={{ node: <CalendarRange size={18} />, tone: 'green' }}
          label="Bookings this month"
          value={getCount(bookings.thisMonth)}
        />
        <StatCard
          icon={{ node: <Award size={18} />, tone: 'amber' }}
          label="Results to release"
          value={getCount(results.pendingRelease)}
        />
        <StatCard
          icon={{ node: <BookOpen size={18} />, tone: 'violet' }}
          label="Total results"
          value={getCount(results.total)}
        />
      </div>

      <div className="sp-grid-2">
        <div className="col">
          <article className="sp-card">
            <div className="sp-card-head">
              <div>
                <h3>Booking activity</h3>
                <span className="meta">Daily counts for this month</span>
              </div>
              <Link className="text-link" to="/bookings">
                Open <ArrowRight size={12} style={{ verticalAlign: '-1px' }} />
              </Link>
            </div>
            <TrendBars data={data?.monthlyBookingTrends} label="Staff booking activity" />
          </article>

          <QuickActions role="staff" />
        </div>

        <div className="col">
          <NotificationCard
            notifications={data?.notifications}
            unread={data?.unreadNotifications}
          />
        </div>
      </div>
    </>
  )
}

/* --------------------------------------------------------------------- */
/* Admin                                                                   */
/* --------------------------------------------------------------------- */

function AdminDashboard({ data, user }) {
  const users = data?.users || {}
  const bookings = data?.bookings || {}
  const results = data?.results || {}
  const resources = data?.resources
  const firstName = user?.name?.split(' ')[0] || 'admin'

  return (
    <>
      <section className="sp-banner">
        <div className="banner-text">
          <div className="banner-chip">
            <Sparkles size={12} /> Admin workspace
          </div>
          <h2>School overview, {firstName}.</h2>
          <p>
            {bookings.pending || 0} booking{(bookings.pending || 0) === 1 ? '' : 's'} await your review. {results.released || 0} results have been released so far.
          </p>
        </div>
        <div className="banner-cta">
          <Link className="button-link btn-on-banner" to="/bookings">
            <Inbox size={16} /> Review queue
          </Link>
          <Link className="button-link btn-on-banner ghost" to="/staff">
            <Users size={16} /> Manage staff
          </Link>
        </div>
      </section>

      <div className="sp-stat-grid">
        <StatCard
          icon={{ node: <GraduationCap size={18} />, tone: 'indigo' }}
          label="Students"
          value={getCount(users.students)}
        />
        <StatCard
          icon={{ node: <Users size={18} />, tone: 'slate' }}
          label="Staff"
          value={getCount(users.staff)}
        />
        <StatCard
          icon={{ node: <CalendarClock size={18} />, tone: 'amber' }}
          label="Pending bookings"
          value={getCount(bookings.pending)}
          sub={`${getCount(bookings.total)} total`}
        />
        <StatCard
          icon={{ node: <Layers size={18} />, tone: 'green' }}
          label="Resources"
          value={getCount(resources)}
          sub={`${getCount(bookings.thisMonth)} bookings this month`}
        />
      </div>

      <div className="sp-grid-2">
        <div className="col">
          <article className="sp-card">
            <div className="sp-card-head">
              <div>
                <h3>Booking activity</h3>
                <span className="meta">Daily counts for this month</span>
              </div>
              <Link className="text-link" to="/bookings">
                Open <ArrowRight size={12} style={{ verticalAlign: '-1px' }} />
              </Link>
            </div>
            <TrendBars data={data?.monthlyBookingTrends} label="Admin booking activity" />
          </article>

          <TopResourcesCard items={data?.topResources} />
        </div>

        <div className="col">
          <NotificationCard
            notifications={data?.notifications}
            unread={data?.unreadNotifications}
          />
          <QuickActions role="admin" />
        </div>
      </div>
    </>
  )
}

function TopResourcesCard({ items }) {
  const rows = Array.isArray(items) ? items : []
  return (
    <article className="sp-card">
      <div className="sp-card-head">
        <div>
          <h3>Top resources</h3>
          <span className="meta">Most booked this month</span>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="sp-list-empty">No resource activity yet this month.</div>
      ) : (
        <div>
          {rows.map((r, i) => (
            <div className="sp-resource-row" key={`${r.id || r.name}-${i}`}>
              <span className="rank">{i + 1}</span>
              <span className="name">{r.name || `Resource #${r.id}`}</span>
              <span className="count">
                {r.bookings} booking{r.bookings === 1 ? '' : 's'}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
