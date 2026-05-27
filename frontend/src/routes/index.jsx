import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Unauthorized from '../pages/Unauthorized'
import Booking from '../pages/Booking'
import ProtectedRoute from '@/routes/ProtectedRoute'

function AdminPage() {
  return 'admin'
}

function TeacherPage() {
  return 'teacher'
}

function StudentPage() {
  return 'student'
}

function DashboardPage() {
  return 'dashboard'
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
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/teacher',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <TeacherPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/booking',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
        <Booking />
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
