import api from '@/api'

export const BOOKING_STATUSES = ['pending', 'approved', 'rejected', 'cancelled', 'expired']
export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused', 'unmarked']

function normalizePayload(payload) {
  return payload?.data ?? payload
}

function normalizeList(payload, key) {
  const data = normalizePayload(payload)

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.rows)) return data.rows
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data

  return []
}

function buildQuery(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function canCreateBooking(user) {
  return String(user?.role || '').toUpperCase() === 'STUDENT'
}

export function canUpdateBooking(user) {
  return ['ADMIN', 'STAFF'].includes(String(user?.role || '').toUpperCase())
}

export async function listBookings(params = {}) {
  const res = await api.get(`/api/bookings${buildQuery(params)}`)
  const data = normalizePayload(res.data)

  if (Array.isArray(data?.rows)) {
    return {
      items: data.rows,
      count: data.count ?? data.rows.length,
      limit: Number(params.limit ?? 20),
      offset: Number(params.offset ?? 0),
    }
  }

  const items = normalizeList(res.data, 'bookings')
  return {
    items,
    count: items.length,
    limit: Number(params.limit ?? items.length),
    offset: Number(params.offset ?? 0),
  }
}

export async function createBooking(payload) {
  const res = await api.post('/api/bookings', payload)
  return normalizePayload(res.data)
}

export async function updateBooking(id, payload) {
  const res = await api.patch(`/api/bookings/${id}`, payload)
  return normalizePayload(res.data)
}

export async function bulkUpdateBookings(payload) {
  const res = await api.patch('/api/bookings/bulk', payload)
  return normalizePayload(res.data)
}

export async function findBookingById(id) {
  const res = await api.get(`/api/bookings/${id}`)
  return normalizePayload(res.data)
}

export async function listSubjects() {
  const res = await api.get('/api/subjects')
  return normalizeList(res.data, 'subjects')
}

export async function listBookingResources() {
  const res = await api.get('/api/resources')
  return normalizeList(res.data, 'resources')
}
