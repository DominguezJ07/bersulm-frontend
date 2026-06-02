interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const base = 'animate-pulse bg-gray-700/50'
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
      <Skeleton variant="circular" width={56} height={56} className="mb-4" />
      <Skeleton className="mb-2 w-3/4" />
      <Skeleton className="mb-4 w-full" />
      <Skeleton className="w-1/3" />
    </div>
  )
}
