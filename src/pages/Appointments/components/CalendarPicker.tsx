import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthDays, isPastDay } from '@/lib/format'

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

interface CalendarPickerProps {
  calendarMonth: Date
  selectedDate: Date | null
  onMonthChange: (date: Date) => void
  onDateSelect: (date: Date) => void
}

export function CalendarPicker({
  calendarMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
}: CalendarPickerProps) {
  const calendarDays = getMonthDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
  )

  const isSelected = (date: Date) =>
    selectedDate?.toDateString() === date.toDateString()

  return (
    <div className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Selecciona fecha</p>
          <p className="mt-2 text-[var(--text-primary)]">Elige tu día preferido en el calendario.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
              )
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-gold"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            {calendarMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
              )
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-gold"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.35em] text-[#999999]">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          const disabled = !date || isPastDay(date)
          const selected = Boolean(date && isSelected(date))

          return (
            <button
              key={date?.toDateString() ?? `empty-${index}`}
              type="button"
              onClick={() => date && !disabled && onDateSelect(date)}
              disabled={disabled}
              className={`min-h-[52px] rounded-3xl border p-2 transition duration-300 ${
                disabled
                  ? 'cursor-not-allowed border-transparent bg-surface-dark text-[#4a443b]'
                  : selected
                    ? 'border-gold bg-gold text-surface-dark'
                    : 'border-[#3b2b1e] bg-surface text-white hover:border-gold hover:bg-[#2f2311]'
              }`}
            >
              {date ? date.getDate() : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}
