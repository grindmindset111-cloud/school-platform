import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import useAuthStore from '@/store/auth'
import { getApiErrorMessage } from '@/api/errors'

const features = [
  {
    icon: <CalendarCheck2 size={16} />,
    title: 'Booking intelligence',
    desc: 'Reserve rooms, labs, and resources. Track queue position in real time.',
  },
  {
    icon: <ShieldCheck size={16} />,
    title: 'Role-scoped control',
    desc: 'Admins, staff, and students see only the surfaces they need.',
  },
  {
    icon: <Sparkles size={16} />,
    title: 'Live operational feed',
    desc: 'Released results, queue updates, and notifications as they happen.',
  },
]

function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const authError = useAuthStore((state) => state.error)
  const loading = useAuthStore((state) => state.loading)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      setError(getApiErrorMessage(err, 'Unable to log in'))
    }
  }

  const combinedError = error || authError

  return (
    <div className="sp-auth-shell sp-fade-in">
      <aside className="sp-auth-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <Sparkles size={12} /> Academic Operations Center
          </span>
          <h1>
            Run your school from one <span>connected command surface.</span>
          </h1>
          <p>
            Bookings, queues, attendance, results, and notifications — purpose-built
            for administrators, teachers, and students who need things to just work.
          </p>

          <div className="hero-features">
            {features.map((f) => (
              <div className="hero-feature" key={f.title}>
                <h4>
                  <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: '-2px' }}>
                    {f.icon}
                  </span>
                  {f.title}
                </h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-footer">
          <span>© {new Date().getFullYear()} School Platform</span>
          <span>Secure session · v1.0</span>
        </div>
      </aside>

      <section className="sp-auth-panel">
        <div className="sp-auth-card">
          <h2>Welcome back</h2>
          <p className="auth-sub">
            Sign in to continue to your operations dashboard.
          </p>

          {combinedError && (
            <div className="auth-error" role="alert">
              <span style={{ display: 'inline-flex', marginRight: 6, verticalAlign: '-2px' }}>
                <AlertCircle size={14} />
              </span>
              {combinedError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-fields">
              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-3)',
                      display: 'inline-flex',
                    }}
                    aria-hidden="true"
                  >
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@school.edu"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    style={{ width: '100%', paddingLeft: 38 }}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-3)',
                      display: 'inline-flex',
                    }}
                    aria-hidden="true"
                  >
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    style={{ width: '100%', paddingLeft: 38, paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-3)',
                      padding: 6,
                      cursor: 'pointer',
                      boxShadow: 'none',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--text-3)',
                marginBottom: 14,
              }}
            >
              <span>Use your school-issued credentials.</span>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'var(--accent)' }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default Login
