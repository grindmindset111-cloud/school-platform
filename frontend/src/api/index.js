import axios from 'axios'

const DEFAULT_API_URL = 'https://school-platform-bnpo.onrender.com'
const TOKEN_KEY = 'school_platform_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/*
  Response Interceptor
  - Handle authentication + authorization failures globally
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden'))
    }

    return Promise.reject(error)
  }
)

export default api
export { TOKEN_KEY }
