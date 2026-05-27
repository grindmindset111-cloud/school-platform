import { useEffect, useState } from 'react'
import { createBooking, getMyBookings } from '@/api/booking'

export default function Booking() {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings()
      setBookings(res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load bookings')
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleBooking = async () => {
    if (loading) return

    setLoading(true)

    try {
      await createBooking({
        resourceId: 'RESOURCE_ID',
        date: '2026-06-01',
        timeSlot: '10:00',
      })

      alert('Booking successful')
      await fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleBooking} disabled={loading}>
        {loading ? 'Processing...' : 'Book'}
      </button>

      <h2>My Bookings</h2>
      <pre>{JSON.stringify(bookings, null, 2)}</pre>
    </div>
  )
}
