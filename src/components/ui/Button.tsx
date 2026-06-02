import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full text-sm font-semibold transition duration-300'
  const variantClasses = {
    primary: 'bg-gold text-surface-dark hover:brightness-110',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:brightness-110',
  }

  return (
    <button
      type="button"
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
