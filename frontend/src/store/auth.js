import { create } from 'zustand'
import api from '@/api'

/*
STATE MODEL:
- user: object | null
- loading: boolean
*/

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  /*
  Fetch authenticated user from backend
  Endpoint: GET /me
  */
  fetchUser: async () => {
    try {
      const res = await api.get('/me')

      set({
        user: res.data,
        loading: false,
      })
    } catch (err) {
      set({
        user: null,
        loading: false,
      })
    }
  },

  /*
  Clear auth state completely
  */
  logout: () => {
    localStorage.removeItem('token')

    set({
      user: null,
    })

    window.location.href = '/login'
  },
}))

export default useAuthStore
