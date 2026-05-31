import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/auth'

function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const authError = useAuthStore((state) => state.error)
  const loading = useAuthStore((state) => state.loading)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setError('')
      await login(formData)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to log in')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      {(error || authError) && <p role="alert">{error || authError}</p>}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default Login
