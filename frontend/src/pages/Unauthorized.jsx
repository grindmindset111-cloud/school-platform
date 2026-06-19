import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="sp-auth-shell sp-fade-in">
      <aside className="sp-auth-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <ShieldAlert size={12} /> Access restricted
          </span>
          <h1>
            This surface is <span>off-limits for your role.</span>
          </h1>
          <p>
            You are signed in, but this part of the operations center is not part
            of your role's command surface. Switch accounts or return to your
            dashboard.
          </p>
        </div>
        <div className="hero-footer">
          <span>© {new Date().getFullYear()} School Platform</span>
          <span>Secure session · v1.0</span>
        </div>
      </aside>

      <section className="sp-auth-panel">
        <div className="sp-auth-card" style={{ textAlign: 'center' }}>
          <h2>Access denied</h2>
          <p className="auth-sub">
            Your role does not include permission for this area of the platform.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
            <Link to="/dashboard" className="button-link">
              <ArrowLeft size={16} /> Back to dashboard
            </Link>
            <Link to="/login" className="button-link ghost">
              Switch account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
