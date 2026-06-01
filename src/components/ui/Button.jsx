import { theme } from '../../constants/theme'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition'
  const variantClasses = {
    primary: 'bg-[var(--gold)] text-[var(--bg-primary)] hover:bg-[var(--gold)]',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
  }

  return (
    <button
      type="button"
      className={`${base} ${variantClasses[variant] ?? variantClasses.primary} ${className}`}
      style={{ fontFamily: theme.font.family }}
      {...props}
    >
      {children}
    </button>
  )
}
