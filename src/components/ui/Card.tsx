import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
