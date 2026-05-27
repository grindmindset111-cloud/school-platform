import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api'
import useAuthStore from '@/store/auth'

function Login() {
  const navigate = useNavigate()
  const fetchUser = useAuthStore((state) => state.fetchUser)
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

    const response = await api.post('/auth/login', formData)
    const { token } = response.data

    localStorage.setItem('token', token)
    await fetchUser()
    navigate('/dashboard', { replace: true })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Login</button>
    </form>
  )
}

export default Login
