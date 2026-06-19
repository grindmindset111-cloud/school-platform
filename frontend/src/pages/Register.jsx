import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import api from '@/api'
import { getApiErrorMessage } from '@/api/errors'

const features = [
  {
    icon: <ShieldCheck size={16} />,
    title: 'Role-based access',
    desc: 'Students, staff, and admins each get a tailored command surface.',
  },
  {
    icon: <GraduationCap size={16} />,
    title: 'Class-scoped views',
    desc: 'Students join their class level on registration — no manual linking.',
  },
  {
    icon: <Sparkles size={16} />,
    title: 'Operations ready',
    desc: 'Jump straight into bookings, results, and the operations feed.',
  },
]

function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    classLevelId: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    }

    if (formData.role === 'STUDENT') {
      payload.classLevelId = formData.classLevelId
    }

    try {
      await api.post('/api/auth/register', payload)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sp-auth-shell sp-fade-in">
      <aside className="sp-auth-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <UserPlus size={12} /> Create your operator account
          </span>
          <h1>
            Join the <span>academic operations network.</span>
          </h1>
          <p>
            One identity unlocks the booking queue, your class results, and the
            live operations feed — built for everyone running a school day.
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
          <h2>Create account</h2>
          <p className="auth-sub">
            Already registered? <Link to="/login">Sign in instead</Link>
          </p>

          {error && (
            <div className="auth-error" role="alert">
              <span style={{ display: 'inline-flex', marginRight: 6, verticalAlign: '-2px' }}>
                <AlertCircle size={14} />
              </span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-fields">
              <div className="auth-field">
                <label htmlFor="reg-name">Full name</label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="you@school.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  placeholder="Minimum 9 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="9"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reg-role">Role</label>
                <select
                  id="reg-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {formData.role === 'STUDENT' && (
                <div className="auth-field">
                  <label htmlFor="reg-class">Class level ID</label>
                  <input
                    id="reg-class"
                    type="number"
                    min="1"
                    name="classLevelId"
                    placeholder="e.g. 2"
                    value={formData.classLevelId}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  Create account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default Register
