import { useState } from 'react'
import { Clock } from 'lucide-react'
import { rewardsService } from '@/services/rewards.service'
import toast from 'react-hot-toast'

type DurationUnit = 'minutes' | 'hours' | 'days'

const unitToMinutes: Record<DurationUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 1440,
}

interface RaffleDurationControlProps {
  raffleId: string
  onUpdated: () => void
}

export function RaffleDurationControl({ raffleId, onUpdated }: RaffleDurationControlProps) {
  const [value, setValue] = useState<number>(1)
  const [unit, setUnit] = useState<DurationUnit>('days')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    if (!raffleId || value <= 0) return
    setIsUpdating(true)
    try {
      const durationMinutes = Math.round(value * unitToMinutes[unit])
      await rewardsService.updateDeadline(raffleId, durationMinutes)
      toast.success('Duración actualizada')
      onUpdated()
    } catch {
      toast.error('Error al actualizar la duración')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2">
      <Clock size={16} className="text-gold shrink-0" />
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-16 bg-transparent text-sm text-[var(--text-primary)] outline-none"
      />
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value as DurationUnit)}
        className="rounded-full bg-[var(--bg-tertiary)] px-2 py-1 text-sm text-[var(--text-primary)] outline-none"
      >
        <option value="minutes">Minutos</option>
        <option value="hours">Horas</option>
        <option value="days">Días</option>
      </select>
      <button
        onClick={handleUpdate}
        disabled={isUpdating}
        className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-surface-dark transition hover:brightness-110 disabled:opacity-60"
      >
        {isUpdating ? 'Actualizando...' : 'Actualizar duración'}
      </button>
    </div>
  )
}
