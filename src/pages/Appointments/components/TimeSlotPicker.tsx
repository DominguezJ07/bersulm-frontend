import { Check } from 'lucide-react'
import type { TimeSlot } from '@/types'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedTime: string
  loading: boolean
  error: string
  onSelect: (time: string) => void
}

export function TimeSlotPicker({
  slots,
  selectedTime,
  loading,
  error,
  onSelect,
}: TimeSlotPickerProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Selecciona hora</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Los horarios ocupados aparecen en rojo.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {loading && (
          <div className="col-span-2 flex items-center gap-3 py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-t-gold border-gray-200" />
            <span className="text-[var(--text-secondary)]">Cargando horarios...</span>
          </div>
        )}

        {error && (
          <div className="col-span-2 text-red-400">{error}</div>
        )}

        {!loading && !error && slots.length === 0 && (
          <div className="col-span-2 text-[var(--text-secondary)]">
            No hay horarios disponibles para esta fecha.
          </div>
        )}

        {!loading &&
          !error &&
          slots.map((s) => {
            const time = s.time || s.slot || ''
            const available = s.available !== false
            const selected = selectedTime === time

            return (
              <button
                key={time}
                type="button"
                disabled={!available}
                onClick={() => available && onSelect(time)}
                className={`rounded-[24px] border px-4 py-4 text-left text-sm font-semibold transition duration-300 ${
                  !available
                    ? 'cursor-not-allowed border-red-600 bg-[#3a1f1a] text-red-400 line-through'
                    : selected
                      ? 'border-gold bg-gold text-surface-dark'
                      : 'border-[#3b2b1e] bg-surface text-white hover:border-gold hover:bg-[#2f2311]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{time}</span>
                  {selected && <Check size={16} />}
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}
