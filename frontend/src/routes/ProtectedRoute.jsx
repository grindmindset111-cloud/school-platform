import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/auth'

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  if (loading) {
    return <p>Loading session...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(String(user.role).toLowerCase())) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
