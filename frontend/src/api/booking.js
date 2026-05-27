import api from '@/api'

/*
Create booking
*/
export const createBooking = (data) => {
  return api.post('/bookings', data)
}

/*
Get user bookings
*/
export const getMyBookings = () => {
  return api.get('/bookings/me')
}
