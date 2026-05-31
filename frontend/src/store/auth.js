import { create } from 'zustand'
import api, { TOKEN_KEY } from '@/api'

function normalizeUser(payload) {
  return payload?.user || payload?.data?.user || payload?.data || payload
}

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: '',

  login: async (credentials) => {
    set({ loading: true, error: '' })

    try {
      const res = await api.post('/api/auth/login', credentials)
      const token = res.data?.token || res.data?.data?.token
      const user = normalizeUser(res.data)

      if (!token) {
        throw new Error('Login response did not include a token.')
      }

      localStorage.setItem(TOKEN_KEY, token)

      set({
        user,
        loading: false,
        error: '',
      })

      return user
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY)
      set({
        user: null,
        loading: false,
        error: err.response?.data?.message || err.message || 'Login failed',
      })
      throw err
    }
  },

  fetchUser: async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      set({
        user: null,
        loading: false,
        error: '',
      })
      return null
    }

    try {
      const res = await api.get('/api/auth/me').catch((err) => {
        if (err.response?.status === 404) {
          return api.get('/me')
        }
        throw err
      })
      const user = normalizeUser(res.data)

      set({
        user,
        loading: false,
        error: '',
      })

      return user
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY)
      set({
        user: null,
        loading: false,
        error: err.response?.data?.message || err.message || 'Session expired',
      })
      return null
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)

    set({
      user: null,
      loading: false,
      error: '',
    })

    window.location.href = '/login'
  },
}))

export default useAuthStore
