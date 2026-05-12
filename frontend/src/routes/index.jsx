import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import useAuthStore from '../store/authStore'

function RoleRoute({ allowedRole, children }) {
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)

  if (!token || !role) {
    return <Navigate to="/login" replace />
  }

  if (role !== allowedRole) {
    if (role === 'admin') return <Navigate to="/dashboard/admin" replace />
    if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />
    return <Navigate to="/dashboard/student" replace />
  }

  return children
}

function AdminDashboardRoute() {
  return <RoleRoute allowedRole="admin">admin</RoleRoute>
}

function TeacherDashboardRoute() {
  return <RoleRoute allowedRole="teacher">teacher</RoleRoute>
}

function StudentDashboardRoute() {
  return <RoleRoute allowedRole="student">student</RoleRoute>
}

export const appRouter = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard/admin',
    element: <AdminDashboardRoute />,
  },
  {
    path: '/dashboard/teacher',
    element: <TeacherDashboardRoute />,
  },
  {
    path: '/dashboard/student',
    element: <StudentDashboardRoute />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
