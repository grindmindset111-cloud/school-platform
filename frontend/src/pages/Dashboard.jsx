import { useEffect, useState } from 'react'
import { getDashboard } from '@/api/resources'

function getCount(value) {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number') return value
  return value ?? 0
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    async function loadDashboard() {
      try {
        setLoading(true)
        const payload = await getDashboard()
        if (alive) {
          setData(payload)
          setError('')
        }
      } catch (err) {
        if (alive) setError(err.response?.data?.message || err.message || 'Unable to load dashboard')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <p>Loading dashboard...</p>
  if (error) return <p role="alert">{error}</p>

  const stats = data?.stats || {}
  const statEntries = Object.entries(stats)

  return (
    <section>
      <h1>Dashboard</h1>
      {!statEntries.length ? (
        <p>No dashboard data available.</p>
      ) : (
        <div className="stats-grid">
          {statEntries.map(([label, value]) => (
            <article className="stat-card" key={label}>
              <span>{label}</span>
              <strong>{getCount(value)}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
