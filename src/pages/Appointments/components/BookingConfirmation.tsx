import { Check, Scissors } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatSpanishDate } from '@/lib/format'
import type { Service } from '@/types'

interface BookingConfirmationProps {
  selectedService: Service | null
  selectedDate: Date | null
  selectedTime: string
  onReset: () => void
}

function formatPrice(service: Service): string {
  if (typeof service.price === 'number') return `$${service.price}`
  return service.price || '-'
}

export function BookingConfirmation({
  selectedService,
  selectedDate,
  selectedTime,
  onReset,
}: BookingConfirmationProps) {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)] sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 text-center shadow-xl">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gold/15 text-gold shadow-[0_20px_50px_rgba(245,166,35,0.2)] sm:h-28 sm:w-28">
          <Check size={36} />
        </div>
        <h1 className="text-4xl font-semibold">¡Cita confirmada!</h1>
        <p className="mt-4 text-base text-[var(--text-secondary)]">
          Tu reserva fue registrada con éxito. Encuentra los detalles aquí abajo.
        </p>

        <div className="mt-10 space-y-4 rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-left">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Servicio</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {selectedService?.name || selectedService?.title}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-gold">
              <Scissors size={20} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Fecha</p>
              <p className="mt-2 text-[var(--text-primary)]">
                {selectedDate ? formatSpanishDate(selectedDate) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Hora</p>
              <p className="mt-2 text-[var(--text-primary)]">{selectedTime}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Total</p>
              <p className="mt-2 text-2xl font-bold text-gold">
                {selectedService ? formatPrice(selectedService) : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button onClick={onReset} className="px-8 py-4">
            Hacer otra reserva
          </Button>
        </div>
      </div>
    </main>
  )
}
