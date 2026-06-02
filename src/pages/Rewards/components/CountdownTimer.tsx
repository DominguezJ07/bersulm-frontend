import { Clock3 } from 'lucide-react'
import { Card } from '@/components/ui'

interface CountdownTimerProps {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ days, hours, minutes, seconds }: CountdownTimerProps) {
  const items = [
    { label: 'Días', value: days },
    { label: 'Horas', value: hours },
    { label: 'Min', value: minutes },
    { label: 'Seg', value: seconds },
  ]

  return (
    <Card className="p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Próximo Sorteo</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
            Cuenta regresiva del sorteo
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            El sorteo se realizará el último día del mes, elige tu mejor estilo y cruza los dedos.
          </p>
        </div>
        <div className="rounded-3xl border border-gold/20 bg-[var(--bg-card)] p-4 text-gold shadow-lg shadow-gold/10">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em]">
            <Clock3 size={18} />
            <span>Próximo Sorteo</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[28px] border border-gold/15 bg-[var(--bg-card)] p-5 text-center"
          >
            <p className="text-4xl font-semibold text-gold sm:text-5xl">
              {String(item.value).padStart(2, '0')}
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.35em] text-[var(--text-secondary)]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
