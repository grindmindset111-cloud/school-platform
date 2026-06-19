import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Edit3,
  GraduationCap,
  Hash,
  Inbox,
  Layers,
  ListChecks,
  MapPin,
  Pencil,
  School,
  Tag,
  User,
  XCircle,
} from 'lucide-react'
import { canUpdateBooking, findBookingById, updateBooking } from '@/api/bookings'
import { getApiErrorMessage } from '@/api/errors'
import useAuthStore from '@/store/auth'
import StatusPill from '@/components/StatusPill'

function displayValue(value) {
  if (value === null || value === undefined || value === '') return 'Not set'
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.length ? `${value.length} item${value.length === 1 ? '' : 's'}` : 'Not set'
    return value.name || value.email || value.title || value.label || JSON.stringify(value)
  }
  return String(value)
}

function safeDate(value) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

function getTimelineSteps(booking) {
  const status = String(booking?.status || '').toLowerCase()
  const steps = [
    {
      key: 'created',
      label: 'Request created',
      desc: 'Booking was submitted to the system.',
    },
    {
      key: 'review',
      label: 'Pending review',
      desc: 'Staff is reviewing the request.',
    },
  ]
  if (status === 'approved' || status === 'expired' || status === 'cancelled' || status === 'rejected') {
    steps.push({
      key: 'decision',
      label:
        status === 'approved'
          ? 'Approved'
          : status === 'rejected'
          ? 'Rejected'
          : status === 'cancelled'
          ? 'Cancelled'
          : 'Expired',
      desc: 'A decision was recorded for this booking.',
    })
  } else {
    steps.push({
      key: 'decision',
      label: 'Awaiting decision',
      desc: 'No decision has been recorded yet.',
    })
  }
  if (status === 'approved') {
    steps.push({
      key: 'attendance',
      label: 'Attendance marked',
      desc: booking.attendanceStatus && booking.attendanceStatus !== 'unmarked'
        ? `Marked as ${booking.attendanceStatus}.`
        : 'Pending attendance mark.',
    })
  }
  return steps
}

function getCurrentStepIndex(steps, booking) {
  const status = String(booking?.status || '').toLowerCase()
  if (status === 'approved') {
    if (booking.attendanceStatus && booking.attendanceStatus !== 'unmarked') return steps.length
    return steps.length - 1
  }
  if (status === 'cancelled' || status === 'rejected' || status === 'expired') {
    return 2
  }
  return 1 // pending -> second step is current
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canUpdate = canUpdateBooking(user)

  useEffect(() => {
    let alive = true

    findBookingById(id)
      .then((data) => {
        if (!alive) return
        setBooking(data)
        setError(data ? '' : 'Booking not found.')
      })
      .catch((err) => {
        if (!alive) return
        if (err.response?.status === 404) {
          setBooking(null)
          setError('Booking not found.')
          return
        }
        setError(getApiErrorMessage(err, 'Unable to load booking'))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [id])

  async function cancelBooking() {
    const confirmed = window.confirm('Cancel this booking?')
    if (!confirmed) return

    try {
      setSaving(true)
      setError('')
      const fresh = await findBookingById(id)
      await updateBooking(id, { status: 'cancelled' })
      const refreshed = await findBookingById(id)
      setBooking(refreshed || fresh)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to cancel booking'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="sp-page">
        <div className="sp-card">Loading booking...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="sp-page">
        <div className="sp-page-head">
          <div>
            <div className="eyebrow">Booking</div>
            <h1>Booking not found</h1>
            <p className="lead">The booking you are looking for could not be loaded.</p>
          </div>
          <Link className="button-link secondary" to="/bookings">
            <ArrowLeft size={16} /> Back to bookings
          </Link>
        </div>
        {error && (
          <div className="sp-error-banner" role="alert">
            <AlertTriangle size={16} style={{ flex: '0 0 16px', marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }

  const steps = getTimelineSteps(booking)
  const currentStep = getCurrentStepIndex(steps, booking)
  const studentLabel =
    (typeof booking.student === 'object' && (booking.student?.name || booking.student?.email)) ||
    displayValue(booking.student) ||
    displayValue(booking.studentId)
  const subjectLabel =
    (typeof booking.subject === 'object' && (booking.subject?.name || booking.subject?.code)) ||
    displayValue(booking.subject) ||
    displayValue(booking.subjectId)
  const resourceLabel =
    (typeof booking.resource === 'object' && (booking.resource?.name || booking.resource?.label)) ||
    displayValue(booking.resource) ||
    displayValue(booking.resourceId)

  return (
    <div className="sp-page">
      {/* Hero */}
      <section className="sp-booking-hero">
        <div>
          <div className="eyebrow">Booking #{booking.id}</div>
          <h1>
            {subjectLabel !== 'Not set' ? subjectLabel : `Booking #${booking.id}`}
          </h1>
          <div className="meta">
            <span>
              <Calendar size={16} /> {displayValue(booking.date)}
            </span>
            <span>
              <Clock size={16} /> {displayValue(booking.startTime)} – {displayValue(booking.endTime)}
            </span>
            {resourceLabel !== 'Not set' && (
              <span>
                <MapPin size={16} /> {resourceLabel}
              </span>
            )}
            {studentLabel !== 'Not set' && (
              <span>
                <User size={16} /> {studentLabel}
              </span>
            )}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusPill value={booking.status} hero />
            {booking.queueStatus && <StatusPill value={booking.queueStatus} hero />}
            {booking.attendanceStatus && (
              <StatusPill value={booking.attendanceStatus} hero />
            )}
          </div>
        </div>
        <div className="actions">
          <Link className="button-link btn-on-hero ghost" to="/bookings">
            <ArrowLeft size={16} /> All bookings
          </Link>
          {canUpdate && booking.status !== 'cancelled' && (
            <Link className="button-link btn-on-hero" to={`/bookings/${booking.id}/edit`}>
              <Edit3 size={16} /> Edit
            </Link>
          )}
        </div>
      </section>

      {error && (
        <div className="sp-error-banner" role="alert">
          <AlertTriangle size={16} style={{ flex: '0 0 16px', marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="sp-booking-layout">
        <div className="col">
          {/* Summary details */}
          <article className="sp-card">
            <div className="sp-card-head">
              <h3>Summary</h3>
              <span className="meta">All fields shown below</span>
            </div>
            <div className="kv-list">
              <div className="kv">
                <span className="k">
                  <Hash size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Booking ID
                </span>
                <span className="v">#{booking.id}</span>
              </div>
              <div className="kv">
                <span className="k">
                  <Tag size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Status
                </span>
                <span className="v">
                  <StatusPill value={booking.status} />
                </span>
              </div>
              <div className="kv">
                <span className="k">
                  <Inbox size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Queue status
                </span>
                <span className="v">
                  {booking.queueStatus ? (
                    <StatusPill value={booking.queueStatus} />
                  ) : (
                    'Not set'
                  )}
                </span>
              </div>
              <div className="kv">
                <span className="k">
                  <ListChecks size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Queue position
                </span>
                <span className="v">{displayValue(booking.queuePosition)}</span>
              </div>
              <div className="kv">
                <span className="k">
                  <CheckCircle2 size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Attendance
                </span>
                <span className="v">
                  {booking.attendanceStatus ? (
                    <StatusPill value={booking.attendanceStatus} />
                  ) : (
                    'Not set'
                  )}
                </span>
              </div>
              <div className="kv">
                <span className="k">
                  <User size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Student
                </span>
                <span className="v">{studentLabel}</span>
              </div>
              <div className="kv">
                <span className="k">
                  <School size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Class level ID
                </span>
                <span className="v">{displayValue(booking.classLevelId)}</span>
              </div>
              <div className="kv">
                <span className="k">
                  <Layers size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Resource
                </span>
                <span className="v">{resourceLabel}</span>
              </div>
              <div className="kv">
                <span className="k">
                  <Calendar size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Created
                </span>
                <span className="v">{safeDate(booking.createdAt)}</span>
              </div>
              <div className="kv">
                <span className="k">
                  <Calendar size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  Updated
                </span>
                <span className="v">{safeDate(booking.updatedAt)}</span>
              </div>
            </div>
          </article>

          {/* Timeline */}
          <article className="sp-card">
            <div className="sp-card-head">
              <h3>Lifecycle</h3>
              <span className="meta">Where this booking is in the workflow</span>
            </div>
            <ol className="sp-timeline" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {steps.map((s, i) => {
                const cls = i < currentStep ? 'done' : i === currentStep ? 'current' : ''
                return (
                  <li className={`step ${cls}`} key={s.key}>
                    <span className="marker" aria-hidden="true" />
                    <span className="label">{s.label}</span>
                    <span className="desc">{s.desc}</span>
                  </li>
                )
              })}
            </ol>
          </article>
        </div>

        <div className="col">
          {/* Queue position */}
          {(booking.queueStatus || booking.queuePosition) && (
            <div className="queue-card">
              <div className="num">#{booking.queuePosition ?? '—'}</div>
              <div className="body">
                <strong>Queue position</strong>
                <span>
                  {booking.queueStatus
                    ? `Status: ${booking.queueStatus}`
                    : 'Awaiting queue assignment'}
                </span>
              </div>
            </div>
          )}

          {/* Quick info */}
          <article className="sp-card">
            <div className="sp-card-head">
              <h3>Quick info</h3>
            </div>
            <div className="sp-action-list">
              <div className="action">
                <span className="ai"><Calendar size={16} /></span>
                <span className="txt">
                  <strong>Date</strong>
                  <span>{displayValue(booking.date)}</span>
                </span>
              </div>
              <div className="action">
                <span className="ai"><Clock size={16} /></span>
                <span className="txt">
                  <strong>Time</strong>
                  <span>
                    {displayValue(booking.startTime)} – {displayValue(booking.endTime)}
                  </span>
                </span>
              </div>
              <div className="action">
                <span className="ai"><GraduationCap size={16} /></span>
                <span className="txt">
                  <strong>Subject</strong>
                  <span>{subjectLabel}</span>
                </span>
              </div>
              <div className="action">
                <span className="ai"><MapPin size={16} /></span>
                <span className="txt">
                  <strong>Resource</strong>
                  <span>{resourceLabel}</span>
                </span>
              </div>
            </div>
          </article>

          {/* Actions */}
          <article className="sp-card">
            <div className="sp-card-head">
              <h3>Actions</h3>
              <span className="meta">Manage this booking</span>
            </div>
            <div className="sp-action-list">
              {canUpdate && booking.status !== 'cancelled' && (
                <button
                  type="button"
                  className="action"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'var(--panel-2)',
                  }}
                  disabled={saving}
                  onClick={cancelBooking}
                >
                  <span className="ai" style={{ color: 'var(--danger-700)' }}>
                    <XCircle size={16} />
                  </span>
                  <span className="txt" style={{ flex: 1 }}>
                    <strong>
                      {saving ? 'Cancelling...' : 'Cancel booking'}
                    </strong>
                    <span>Mark this booking as cancelled.</span>
                  </span>
                </button>
              )}
              {canUpdate && (
                <Link
                  to={`/bookings/${booking.id}/edit`}
                  className="action"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span className="ai"><Pencil size={16} /></span>
                  <span className="txt" style={{ flex: 1 }}>
                    <strong>Edit details</strong>
                    <span>Update subject, time, or resource.</span>
                  </span>
                </Link>
              )}
              <Link
                to="/bookings/new"
                className="action"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="ai"><CalendarPlus size={16} /></span>
                <span className="txt" style={{ flex: 1 }}>
                  <strong>New booking</strong>
                  <span>Submit another request.</span>
                </span>
              </Link>
              <button
                type="button"
                className="action"
                style={{ width: '100%', textAlign: 'left', background: 'var(--panel-2)' }}
                onClick={() => navigate('/bookings')}
              >
                <span className="ai"><ArrowLeft size={16} /></span>
                <span className="txt" style={{ flex: 1 }}>
                  <strong>Back to bookings</strong>
                  <span>Return to the bookings list.</span>
                </span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
