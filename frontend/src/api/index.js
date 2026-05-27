import axios from 'axios'

/*
  Create Axios instance
  - baseURL must come from environment variable
*/
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

/*
  Request Interceptor
  - Attach JWT token from localStorage
  - Header: Authorization: Bearer <token>
*/
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

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
      // Remove invalid token
      localStorage.removeItem('token')

      // Force re-authentication
      window.location.href = '/login'
    }

    if (status === 403) {
      alert('Access denied')
    }

    return Promise.reject(error)
  }
)

/*
  Export configured instance
*/
export default api
