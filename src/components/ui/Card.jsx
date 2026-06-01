import { theme } from '../../constants/theme'

export default function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-xl ${className}`}
      style={{
        fontFamily: theme.font.family,
        backgroundColor: 'var(--card-bg, #24180f)',
        borderColor: 'var(--card-border, #3b2b1e)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
