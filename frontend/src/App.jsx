import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from './routes'
import useAuthStore from '@/store/auth'

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const loading = useAuthStore((state) => state.loading)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (loading) return <div>Loading...</div>

  return <RouterProvider router={appRouter} />
}

export default App
