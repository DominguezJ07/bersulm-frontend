import { Edit2, Trash2, Trophy, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Raffle } from '@/types'

interface AdminRaffleManagerProps {
  raffles: Raffle[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (raffle: Raffle) => void
  onDelete: (raffleId: string) => void
  onCreate: () => void
}

function formatRaffleDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminRaffleManager({
  raffles,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
}: AdminRaffleManagerProps) {
  return (
    <div className="mb-10 rounded-[28px] border border-gold/20 bg-[var(--bg-secondary)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            Administración
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
            Gestión de Sorteos
            {raffles.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[var(--text-secondary)]">
                ({raffles.length} sorteos)
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-surface-dark transition hover:brightness-110"
        >
          <Plus size={16} />
          Nuevo Sorteo
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[var(--bg-tertiary)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-[var(--bg-tertiary)]" />
                  <div className="h-3 w-24 rounded bg-[var(--bg-tertiary)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin sorteos */}
      {!isLoading && raffles.length === 0 && (
        <div className="py-10 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
          <p className="text-sm text-[var(--text-muted)]">
            No hay sorteos creados aún.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Creá el primero con el botón de arriba.
          </p>
        </div>
      )}

      {/* Lista de sorteos */}
      {!isLoading && raffles.length > 0 && (
        <>
          <div className="space-y-3">
            {raffles.map((raffle) => {
              const id = raffle._id || raffle.id || ''
              const prizeName = raffle.prize?.name || 'Sin premio'
              const image = raffle.prize?.images?.[0]
              const isCompleted = raffle.status === 'completed'

              return (
                <div
                  key={id}
                  className="flex items-center gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 transition hover:border-gold/30"
                >
                  {/* Imagen */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/10">
                    {image ? (
                      <img
                        src={image}
                        alt={prizeName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Trophy size={24} className="text-gold" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {prizeName}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isCompleted
                            ? 'bg-green-400/15 text-green-400'
                            : 'bg-amber-400/15 text-amber-400'
                        }`}
                      >
                        {isCompleted ? 'Completado' : 'Activo'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {formatRaffleDate(raffle.raffleDate)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onEdit(raffle)}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-gold hover:text-gold"
                    >
                      <Edit2 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
