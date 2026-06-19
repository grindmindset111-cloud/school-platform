import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  canCreateBooking,
  createBooking,
  listBookingResources,
  listSubjects,
} from '@/api/bookings'
import { getApiErrorMessage } from '@/api/errors'
import useAuthStore from '@/store/auth'

const initialForm = {
  subjectId: '',
  resourceId: '',
  date: '',
  startTime: '',
  endTime: '',
}

export default function BookingCreatePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [form, setForm] = useState(initialForm)
  const [subjects, setSubjects] = useState([])
  const [resources, setResources] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allowed = canCreateBooking(user)

  useEffect(() => {
    let alive = true

    async function loadOptions() {
      try {
        const subjectData = await listSubjects()
        if (alive) setSubjects(subjectData)

        try {
          const resourceData = await listBookingResources()
          if (alive) setResources(resourceData)
        } catch {
          if (alive) setResources([])
        }
      } catch (err) {
        if (alive) setError(getApiErrorMessage(err, 'Unable to load booking options'))
      } finally {
        if (alive) setLoadingOptions(false)
      }
    }

    loadOptions()

    return () => {
      alive = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      subjectId: form.subjectId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
    }

    if (form.resourceId) payload.resourceId = form.resourceId

    try {
      setSaving(true)
      setError('')
      const booking = await createBooking(payload)
      navigate(`/bookings/${booking.id}`, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create booking'))
    } finally {
      setSaving(false)
    }
  }

  if (!allowed) {
    return (
      <section>
        <h1>Create Booking</h1>
        <p role="alert">Only students can create bookings.</p>
        <Link className="text-link" to="/bookings">Back to bookings</Link>
      </section>
    )
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Create Booking</h1>
          <p>Submit a subject booking request for a future date and time.</p>
        </div>
        <Link className="button-link secondary" to="/bookings">Back</Link>
      </div>

      {error && <p role="alert">{error}</p>}
      {loadingOptions ? (
        <p>Loading booking options...</p>
      ) : (
        <form className="resource-form booking-form" onSubmit={handleSubmit}>
          <label>
            <span>Subject</span>
            <select name="subjectId" value={form.subjectId} onChange={handleChange} required>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </label>
          {resources.length > 0 && (
            <label>
              <span>Resource</span>
              <select name="resourceId" value={form.resourceId} onChange={handleChange}>
                <option value="">No resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>{resource.name}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>Date</span>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>
            <span>Start time</span>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
          </label>
          <label>
            <span>End time</span>
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
          </label>
          <button type="submit" disabled={saving || subjects.length === 0}>
            {saving ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      )}
    </section>
  )
}
