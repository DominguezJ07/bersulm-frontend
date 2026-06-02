import { Clock, Scissors, Check } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Service } from '@/types'

interface ServiceSelectorProps {
  services: Service[]
  selectedService: Service | null
  loading: boolean
  error: Error | null
  onSelect: (service: Service) => void
  onContinue: () => void
  canContinue: boolean
}

function formatPrice(service: Service): string {
  if (typeof service.price === 'number') return `$${service.price}`
  return service.price || service.cost || '-'
}

function formatDuration(service: Service): string {
  const duration = service.durationMin || service.duration || service.length || service.duration_minutes
  return duration ? `${duration} min` : '-'
}

function getDisplayKey(service: Service): string {
  return String(service._id || service.id || service.name || service.title || crypto.randomUUID())
}

function getServiceKey(service: Service | null): string {
  return service ? String(service._id || service.id || service.name || service.title || '') : ''
}

function getDisplayName(service: Service): string {
  return service.name || service.title || 'Servicio'
}

function getDisplayDesc(service: Service): string {
  return service.description || service.desc || ''
}

export function ServiceSelector({
  services,
  selectedService,
  loading,
  error,
  onSelect,
  onContinue,
  canContinue,
}: ServiceSelectorProps) {
  if (loading) {
    return (
      <section className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-t-gold border-gray-200" />
          <span className="text-[var(--text-secondary)]">Cargando servicios...</span>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="text-center py-20">
        <p className="text-red-400">Error cargando servicios. Intenta de nuevo.</p>
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className="text-center py-20">
        <p className="text-[var(--text-secondary)]">No hay servicios disponibles.</p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const selected =
            Boolean(selectedService) &&
            getServiceKey(selectedService) === getServiceKey(service)

          return (
            <button
              key={getDisplayKey(service)}
              type="button"
              onClick={() => onSelect(service)}
              className={`relative flex flex-col items-start rounded-[28px] border p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_50px_rgba(245,166,35,0.18)] ${
                selected
                  ? 'border-gold bg-[var(--bg-secondary)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-tertiary)]'
              }`}
            >
              <div
                className={`absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                  selected
                    ? 'border-transparent bg-gold'
                    : 'border-white/30 bg-[rgba(255,255,255,0.06)] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                }`}
              >
                {selected ? <Check size={14} className="text-surface-dark" strokeWidth={3} /> : null}
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-gold">
                <Scissors size={28} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">
                {getDisplayName(service)}
              </h3>
              {getDisplayDesc(service) && (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {getDisplayDesc(service)}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm leading-6 text-[#bfbfbf]">
                <Clock size={16} />
                <span>Duración {formatDuration(service)}</span>
              </div>
              <div className="mt-6 flex w-full items-center justify-between gap-4">
                <span className="text-2xl font-bold text-gold">{formatPrice(service)}</span>
                <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-2 text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                  {formatDuration(service)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className={`px-8 py-4 ${!canContinue ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          Continuar
        </Button>
      </div>
    </section>
  )
}
