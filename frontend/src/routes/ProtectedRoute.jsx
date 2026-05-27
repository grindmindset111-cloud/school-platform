import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/auth'

/*
Props:
- children
- allowedRoles (array)
*/

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((state) => state.user)

  /*
  NOT AUTHENTICATED
  */
  if (!user) {
    return <Navigate to="/login" replace />
  }

  /*
  NOT AUTHORIZED
  */
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  /*
  ACCESS GRANTED
  */
  return children
}
