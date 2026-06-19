import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  Filter,
  Inbox,
  Tag,
  XCircle,
} from 'lucide-react'
import {
  BOOKING_STATUSES,
  canCreateBooking,
  canUpdateBooking,
  listBookings,
  listSubjects,
  updateBooking,
} from '@/api/bookings'
import { getApiErrorMessage } from '@/api/errors'
import useAuthStore from '@/store/auth'
import StatusPill from '@/components/StatusPill'

const PAGE_SIZE = 20

function formatDateTime(booking) {
  return `${booking.date || ''} ${booking.startTime || ''} - ${booking.endTime || ''}`.trim()
}

function relationName(value) {
  if (!value) return ''
  if (typeof value === 'object') return value.name || value.email || value.id || ''
  return String(value)
}

export default function BookingListPage() {
  const user = useAuthStore((state) => state.user)
  const [bookings, setBookings] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    subjectId: '',
    date: '',
    classLevelId: '',
  })
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const canCreate = canCreateBooking(user)
  const canUpdate = canUpdateBooking(user)

  // Single source of truth for fetching the current page.
  const loadBookings = useCallback(async () => {
    try {
      const page = await listBookings({
        ...filters,
        limit: PAGE_SIZE,
        offset,
      })
      setBookings(page.items)
      setCount(page.count)
      setError('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load bookings'))
    } finally {
      setLoading(false)
    }
  }, [filters, offset])

  useEffect(() => {
    let alive = true
    setLoading(true)
    loadBookings().then(() => {
      if (!alive) return
    })
    return () => {
      alive = false
    }
  }, [loadBookings])

  useEffect(() => {
    let alive = true

    listSubjects()
      .then((data) => {
        if (alive) setSubjects(data)
      })
      .catch(() => {
        if (alive) setSubjects([])
      })

    return () => {
      alive = false
    }
  }, [])

  function handleFilterChange(event) {
    const { name, value } = event.target
    setLoading(true)
    setFilters((prev) => ({ ...prev, [name]: value }))
    setOffset(0)
  }

  async function cancelBooking(booking) {
    const confirmed = window.confirm('Cancel this booking?')
    if (!confirmed) return

    try {
      setActionId(String(booking.id))
      await updateBooking(booking.id, { status: 'cancelled' })
      await loadBookings()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to cancel booking'))
    } finally {
      setActionId('')
    }
  }

  return (
    <div className="sp-page">
      <div className="sp-page-head">
        <div>
          <div className="eyebrow">Operations</div>
          <h1>Bookings</h1>
          <p className="lead">
            View booking requests, queue state, and approval status.
          </p>
        </div>
        <div className="button-row">
          {canCreate && (
            <Link className="button-link" to="/bookings/new">
              <CalendarPlus size={16} /> Create booking
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="sp-error-banner" role="alert">
          <AlertTriangle size={16} style={{ flex: '0 0 16px', marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <form
        className="sp-booking-toolbar"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-subject">Subject</label>
          <select
            id="filter-subject"
            name="subjectId"
            value={filters.subjectId}
            onChange={handleFilterChange}
          >
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-date">Date</label>
          <input
            id="filter-date"
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-class">Class level ID</label>
          <input
            id="filter-class"
            name="classLevelId"
            value={filters.classLevelId}
            onChange={handleFilterChange}
          />
        </div>
        <div className="spacer" />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-3)',
            fontSize: 13,
          }}
        >
          <Filter size={14} /> {count} result{count === 1 ? '' : 's'}
        </div>
      </form>

      {loading ? (
        <div className="sp-card">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="sp-card sp-list-empty">
          <Inbox size={20} style={{ verticalAlign: '-4px', marginRight: 6 }} />
          No bookings found.
        </div>
      ) : (
        <>
          <div className="sp-booking-grid">
            {bookings.map((booking) => {
              const subjectLabel =
                relationName(booking.subject) || booking.subjectId || 'Booking'
              const studentLabel =
                relationName(booking.student) || booking.studentId || '—'
              const resourceLabel =
                relationName(booking.resource) || booking.resourceId || ''
              const isCancelling = actionId === String(booking.id)
              return (
                <Link
                  key={booking.id}
                  to={`/bookings/${booking.id}`}
                  className="sp-booking-card"
                >
                  <div className="head">
                    <span className="id">#{booking.id}</span>
                    <StatusPill value={booking.status} />
                  </div>
                  <h3>{subjectLabel}</h3>
                  <div className="meta">
                    <span>
                      <CalendarClock size={14} /> {formatDateTime(booking)}
                    </span>
                    {studentLabel !== '—' && (
                      <span>
                        <Tag size={14} /> {studentLabel}
                      </span>
                    )}
                  </div>
                  <div className="pills">
                    {booking.queueStatus && (
                      <StatusPill value={booking.queueStatus} />
                    )}
                    {booking.attendanceStatus && (
                      <StatusPill value={booking.attendanceStatus} />
                    )}
                    {resourceLabel && (
                      <span className="pill pill-excused">{resourceLabel}</span>
                    )}
                  </div>
                  <div className="footer">
                    <span className="more-link">
                      View details <ArrowRight size={12} />
                    </span>
                    {canUpdate && booking.status !== 'cancelled' && (
                      <button
                        type="button"
                        disabled={isCancelling}
                        onClick={(e) => {
                          e.preventDefault()
                          cancelBooking(booking)
                        }}
                        style={{
                          padding: '6px 10px',
                          fontSize: 12.5,
                          borderRadius: 8,
                        }}
                      >
                        <XCircle size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
                        {isCancelling ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => {
                setLoading(true)
                setOffset((prev) => Math.max(0, prev - PAGE_SIZE))
              }}
            >
              <ArrowLeft size={14} style={{ marginRight: 4 }} />
              Previous
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              disabled={offset + PAGE_SIZE >= count}
              onClick={() => {
                setLoading(true)
                setOffset((prev) => prev + PAGE_SIZE)
              }}
            >
              Next
              <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
