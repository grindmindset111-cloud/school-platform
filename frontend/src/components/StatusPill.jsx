// Renders a colored pill for booking / queue / attendance statuses.
// Falls back to a neutral pill for unknown values.
export default function StatusPill({ value, hero = false }) {
  if (value === null || value === undefined || value === '') {
    return <span className="pill pill-excused">Not set</span>
  }
  const normalized = String(value).toLowerCase().replace(/\s+/g, '-')
  return (
    <span
      className={`pill pill-${normalized}${hero ? ' pill-hero' : ''}`}
    >
      <span className="pip" />
      {String(value)}
    </span>
  )
}
