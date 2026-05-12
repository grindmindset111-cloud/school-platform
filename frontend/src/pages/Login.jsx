import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
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
    const { user, token, role } = response.data

    setAuth({ user, token, role })

    if (role === 'admin') {
      navigate('/dashboard/admin', { replace: true })
      return
    }

    if (role === 'teacher') {
      navigate('/dashboard/teacher', { replace: true })
      return
    }

    navigate('/dashboard/student', { replace: true })
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
