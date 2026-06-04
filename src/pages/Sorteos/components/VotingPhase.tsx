import { PrizeIcon } from './PrizeIcon'
import type { SorteoVoteItem } from '@/types'

interface VotingPhaseProps {
  votes: SorteoVoteItem[]
  userHasVoted: boolean
  votedRewardId: string | null
  isVoting: boolean
  onVote: (rewardId: string) => void
}

export function VotingPhase({
  votes,
  userHasVoted,
  votedRewardId,
  isVoting,
  onVote,
}: VotingPhaseProps) {
  const totalVotes = votes.reduce((sum, v) => sum + v.count, 0)

  if (votes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--text-muted)]">Cargando premios disponibles...</p>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Votación Mensual
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Elige el premio del mes
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Vota por la recompensa que más te guste. ¡El más votado será el premio del sorteo!
        </p>
      </div>

      <div className="space-y-3">
        {votes.map((vote) => {
          const isSelected = votedRewardId === vote.rewardId
          const isLeading = vote.percentage > 0 && vote.count === Math.max(...votes.map((v) => v.count))

          return (
            <button
              key={vote.rewardId}
              disabled={userHasVoted || isVoting}
              onClick={() => onVote(vote.rewardId)}
              className={`w-full rounded-[24px] border p-4 text-left transition-all duration-300 sm:p-5 ${
                isSelected
                  ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-gold/50'
              } ${userHasVoted && !isSelected ? 'opacity-60' : ''} ${
                !userHasVoted && !isVoting ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14 ${
                  isSelected ? 'bg-gold/20 text-gold' : 'bg-[var(--bg-tertiary)] text-gold'
                }`}>
                  <PrizeIcon type={vote.icon || vote.type} className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`truncate text-sm font-semibold sm:text-base ${
                      isSelected ? 'text-gold' : 'text-[var(--text-primary)]'
                    }`}>
                      {vote.name}
                    </p>
                    <span className="ml-2 shrink-0 text-sm font-bold text-gold">
                      {vote.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isLeading ? 'bg-gold' : 'bg-gold/50'
                      }`}
                      style={{ width: `${Math.max(vote.percentage, 2)}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {vote.count} {vote.count === 1 ? 'voto' : 'votos'}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 text-center">
                  <span className="inline-block rounded-full bg-gold/20 px-4 py-1 text-xs font-semibold text-gold">
                    Tu voto
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 rounded-[32px] border border-gold/15 bg-[var(--bg-card)] p-5 text-center shadow-xl shadow-gold/5">
        {userHasVoted ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">✅</span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Ya has votado este mes
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              ¡Gracias por participar! El premio ganador se anunciará al final del mes.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Selecciona un premio y haz clic para votar. Total de votos emitidos:{' '}
            <span className="font-semibold text-gold">{totalVotes}</span>
          </p>
        )}
      </div>
    </section>
  )
}
