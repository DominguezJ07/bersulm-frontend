import { Clock3 } from 'lucide-react'

interface CountdownBannerProps {
  days: number
  hours: number
  minutes: number
  seconds: number
  label?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownBanner({ days, hours, minutes, seconds, label }: CountdownBannerProps) {
  const isFinished = days === 0 && hours === 0 && minutes === 0 && seconds === 0

  return (
    <div className="rounded-[32px] border border-gold/20 bg-[var(--bg-card)] p-6 shadow-xl shadow-gold/5">
      <div className="flex items-center gap-3 mb-4">
        <Clock3 className="h-5 w-5 text-gold" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          {label || 'Tiempo restante'}
        </p>
      </div>

      {isFinished ? (
        <p className="text-lg font-semibold text-gold">¡Tiempo cumplido!</p>
      ) : (
        <div className="flex gap-3 sm:gap-4">
          <TimeBlock value={pad(days)} label="Días" />
          <TimeDivider />
          <TimeBlock value={pad(hours)} label="Horas" />
          <TimeDivider />
          <TimeBlock value={pad(minutes)} label="Min" />
          <TimeDivider />
          <TimeBlock value={pad(seconds)} label="Seg" />
        </div>
      )}
    </div>
  )
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)] sm:text-3xl">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  )
}

function TimeDivider() {
  return (
    <span className="text-2xl font-light text-gold/40 self-start mt-0.5 hidden sm:block">
      :
    </span>
  )
}
