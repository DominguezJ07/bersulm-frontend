import { Gift, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import type { Prize } from '@/types'

interface CurrentPrizeCardProps {
  prize: Prize | null
  isAdmin: boolean
  onCreateClick?: () => void
}

export function CurrentPrizeCard({ prize, isAdmin, onCreateClick }: CurrentPrizeCardProps) {
  if (!prize) {
    return (
      <Card className="p-8 text-center">
        <Gift size={40} className="mx-auto mb-4 text-gold/50" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          No hay premio activo este mes
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          El administrador definirá el premio del sorteo mensual próximamente.
        </p>
        {isAdmin && onCreateClick && (
          <button
            onClick={onCreateClick}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-surface-dark shadow-lg shadow-gold/30 transition-all hover:brightness-110"
          >
            <Plus size={18} />
            Crear Premio del Mes
          </button>
        )}
      </Card>
    )
  }

  const imageCount = prize.images?.length ?? 0

  return (
    <Card className="p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">
        Premio del mes
      </p>

      {imageCount > 0 && (
        <div
          className="mb-5 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${imageCount}, minmax(0, 1fr))` }}
        >
          {prize.images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl border border-[var(--border-color)]"
            >
              <img
                src={src}
                alt={`${prize.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <h3 className="text-xl font-semibold text-[var(--text-primary)]">
        {prize.name}
      </h3>
      {prize.description && (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {prize.description}
        </p>
      )}
    </Card>
  )
}
