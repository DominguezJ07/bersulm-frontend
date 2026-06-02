import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatSpanishDate } from '@/lib/format'
import type { Service } from '@/types'

interface BookingSummaryProps {
  selectedService: Service | null
  selectedDate: Date | null
  selectedTime: string
  submitting: boolean
  requestError: string
  onBack: () => void
  onConfirm: () => void
}

function formatPrice(service: Service): string {
  if (typeof service.price === 'number') return `$${service.price}`
  return service.price || '-'
}

export function BookingSummary({
  selectedService,
  selectedDate,
  selectedTime,
  submitting,
  requestError,
  onBack,
  onConfirm,
}: BookingSummaryProps) {
  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Resumen de la reserva</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Confirma tu cita</h2>
          </div>
          <div className="rounded-3xl bg-[var(--bg-tertiary)] px-4 py-3 text-sm uppercase tracking-[0.35em] text-gold">
            Total {selectedService ? formatPrice(selectedService) : '-'}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-gold">
              <Scissors size={22} />
            </div>
            <p className="mt-4 text-sm uppercase tracking-[0.35em] text-gold">Servicio</p>
            <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
              {selectedService?.name || selectedService?.title}
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Fecha</p>
            <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
              {selectedDate ? formatSpanishDate(selectedDate) : '-'}
            </p>
          </div>
          <div className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Hora</p>
            <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{selectedTime || '-'}</p>
          </div>
        </div>

        {requestError && (
          <div className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
            {requestError}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Total</p>
            <p className="mt-2 text-4xl font-bold text-gold">
              {selectedService ? formatPrice(selectedService) : '-'}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={onBack}
              className="w-full px-8 py-4 sm:w-auto"
            >
              Atrás
            </Button>
            <Button
              onClick={onConfirm}
              disabled={submitting}
              className="w-full px-8 py-4 sm:w-auto"
            >
              {submitting ? 'Procesando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
