import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Users, Calendar, Gift, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'

interface RaffleHistoryItem {
  _id: string
  month: string
  status: string
  raffleDate: string
  winnerReward: {
    _id: string
    name: string
    description?: string
    icon?: string
    type?: string
  } | null
  winnerId: string | null
  participantCount: number
  createdAt: string
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
    .replace(/^./, (c) => c.toUpperCase())
}

export function RaffleHistory() {
  const [page, setPage] = useState(1)
  const LIMIT = 6

  const { data, isLoading, error } = useQuery({
    queryKey: ['raffle-history', page],
    queryFn: async () => {
      const res = await api.get('/raffles/history', {
        params: { page, limit: LIMIT }
      })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const raffles: RaffleHistoryItem[] = data?.raffles ?? []
  const total: number = data?.total ?? 0
  const totalPages: number = data?.totalPages ?? 1

  return (
    <div className="mt-12 space-y-6">

      {/* Header */}
      <div className="border-t border-[var(--border-color)] pt-10">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Historial
        </p>
        <h2 className="mt-3 text-2xl font-semibold
          text-[var(--text-primary)]">
          Sorteos anteriores
          {total > 0 && (
            <span className="ml-2 text-base font-normal
              text-[var(--text-secondary)]">
              ({total} sorteos)
            </span>
          )}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Revisa los ganadores y premios de cada mes.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-[24px]
              border border-[var(--border-color)]
              bg-[var(--bg-secondary)] p-6">
              <div className="mb-4 h-4 w-24 rounded
                bg-[var(--bg-tertiary)]" />
              <div className="mb-2 h-6 w-36 rounded
                bg-[var(--bg-tertiary)]" />
              <div className="h-16 rounded-xl
                bg-[var(--bg-tertiary)]" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-500/20
          bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">
            Error al cargar el historial
          </p>
        </div>
      )}

      {/* Sin historial */}
      {!isLoading && !error && raffles.length === 0 && (
        <div className="rounded-[28px] border
          border-[var(--border-color)] bg-[var(--bg-secondary)]
          py-16 text-center">
          <Trophy size={40} className="mx-auto mb-4
            text-[var(--text-muted)] opacity-30" />
          <p className="text-lg font-semibold
            text-[var(--text-primary)]">
            Aún no hay sorteos completados
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            El historial aparecerá aquí cuando finalice
            el primer sorteo mensual.
          </p>
        </div>
      )}

      {/* Grid de sorteos */}
      {!isLoading && !error && raffles.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {raffles.map((raffle) => (
              <div
                key={raffle._id}
                className="rounded-[24px] border
                  border-[var(--border-color)]
                  bg-[var(--bg-secondary)] p-6 transition
                  hover:border-gold/30"
              >
                {/* Mes */}
                <div className="mb-4 flex items-center
                  justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gold" />
                    <p className="text-xs uppercase
                      tracking-[0.2em] text-gold font-semibold">
                      {formatMonth(raffle.month)}
                    </p>
                  </div>
                  <span className="rounded-full
                    bg-green-400/15 px-2.5 py-1 text-xs
                    font-semibold text-green-400">
                    Completado
                  </span>
                </div>

                {/* Premio ganador */}
                {raffle.winnerReward ? (
                  <div className="rounded-2xl bg-gold/5
                    border border-gold/15 p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0
                        items-center justify-center rounded-xl
                        bg-gold/15 text-2xl">
                        {raffle.winnerReward.icon || '🎁'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase
                          tracking-[0.15em] text-gold mb-1">
                          Premio del mes
                        </p>
                        <p className="font-semibold
                          text-[var(--text-primary)] truncate">
                          {raffle.winnerReward.name}
                        </p>
                        {raffle.winnerReward.description && (
                          <p className="text-xs
                            text-[var(--text-muted)] mt-0.5
                            line-clamp-1">
                            {raffle.winnerReward.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[var(--bg-card)]
                    p-4 mb-4 flex items-center gap-3">
                    <Gift size={20}
                      className="text-[var(--text-muted)]
                        shrink-0" />
                    <p className="text-sm
                      text-[var(--text-muted)]">
                      Sin premio registrado
                    </p>
                  </div>
                )}

                {/* Participantes */}
                <div className="flex items-center gap-2
                  text-sm text-[var(--text-secondary)]">
                  <Users size={14} className="text-gold
                    shrink-0" />
                  <span>
                    {raffle.participantCount > 0
                      ? `${raffle.participantCount} participantes`
                      : 'Sin participantes registrados'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between
              border-t border-[var(--border-color)] pt-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center
                    justify-center rounded-xl border
                    border-[var(--border-color)]
                    text-[var(--text-secondary)] transition
                    hover:border-gold hover:text-gold
                    disabled:opacity-40
                    disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center
                    justify-center rounded-xl border
                    border-[var(--border-color)]
                    text-[var(--text-secondary)] transition
                    hover:border-gold hover:text-gold
                    disabled:opacity-40
                    disabled:cursor-not-allowed"
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
