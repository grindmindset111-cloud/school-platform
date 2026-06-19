// Shared brand mark used in the sidebar and login hero.
import { GraduationCap } from 'lucide-react'

export default function Brand({ tone = 'dark', compact = false }) {
  // tone: 'dark' for light backgrounds, 'light' for dark backgrounds.
  return (
    <div
      className={`brand sp-brand ${tone === 'light' ? 'sp-brand-light' : 'sp-brand-dark'}`}
    >
      <span className="brand-mark sp-brand-mark" aria-hidden="true">
        <GraduationCap size={18} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="brand-text sp-brand-text">
          <span>School Platform</span>
          <small>Operations Suite</small>
        </span>
      )}
    </div>
  )
}
