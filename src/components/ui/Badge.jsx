import { theme } from '../../constants/theme'

export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex rounded-full bg-[#f5a623]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5a623] ${className}`}
      style={{ fontFamily: theme.font.family }}
    >
      {children}
    </span>
  )
}
