import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-[28px] border border-[#3b2b1e] bg-surface-dark px-5 py-3 text-white outline-none transition placeholder:text-[#666] focus:border-gold ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="pl-2 text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
