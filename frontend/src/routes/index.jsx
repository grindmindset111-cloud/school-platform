import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Unauthorized from '../pages/Unauthorized'
import Dashboard from '../pages/Dashboard'
import Layout from '../pages/Layout'
import ResourcePage from '../pages/ResourcePage'
import ProtectedRoute from '@/routes/ProtectedRoute'

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
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'students', element: <ResourcePage resource="students" /> },
      { path: 'staff', element: <ResourcePage resource="staff" /> },
      { path: 'courses', element: <ResourcePage resource="courses" /> },
      { path: 'attendance', element: <ResourcePage resource="attendance" /> },
      { path: 'results', element: <ResourcePage resource="results" /> },
      { path: 'notifications', element: <ResourcePage resource="notifications" /> },
      { path: 'settings', element: <ResourcePage resource="settings" /> },
    ],
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
