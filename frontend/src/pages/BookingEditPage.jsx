import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ATTENDANCE_STATUSES,
  BOOKING_STATUSES,
  canUpdateBooking,
  findBookingById,
  updateBooking,
} from '@/api/bookings'
import { getApiErrorMessage } from '@/api/errors'
import useAuthStore from '@/store/auth'

export default function BookingEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [booking, setBooking] = useState(null)
  const [form, setForm] = useState({
    status: '',
    attendanceStatus: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allowed = canUpdateBooking(user)

  useEffect(() => {
    let alive = true

    findBookingById(id)
      .then((data) => {
        if (!alive) return
        setBooking(data)
        setForm({
          status: data?.status || '',
          attendanceStatus: data?.attendanceStatus || '',
        })
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

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      await updateBooking(id, form)
      navigate(`/bookings/${id}`, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update booking'))
    } finally {
      setSaving(false)
    }
  }

  if (!allowed) {
    return (
      <section>
        <h1>Edit Booking</h1>
        <p role="alert">Only staff and admins can update bookings.</p>
        <Link className="text-link" to={`/bookings/${id}`}>Back to booking</Link>
      </section>
    )
  }

  if (loading) return <p>Loading booking...</p>

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Edit Booking #{id}</h1>
          {booking && <p>{booking.date} {booking.startTime} - {booking.endTime}</p>}
        </div>
        <Link className="button-link secondary" to={`/bookings/${id}`}>Back</Link>
      </div>

      {error && <p role="alert">{error}</p>}

      {booking && (
        <form className="resource-form booking-form" onSubmit={handleSubmit}>
          <label>
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Attendance</span>
            <select name="attendanceStatus" value={form.attendanceStatus} onChange={handleChange}>
              {ATTENDANCE_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update Booking'}
          </button>
        </form>
      )}
    </section>
  )
}
