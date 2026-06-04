import { Trophy, Users, Sparkles, Plus, X } from 'lucide-react'
import { PrizeIcon } from './PrizeIcon'
import type { WinnerReward } from '@/types'

interface ActivePhaseProps {
  winnerReward: WinnerReward | null
  participantCount: number
  participants: string[]
  isAdmin: boolean
  isSpinning: boolean
  spinWinner: string | null
  onSpin: () => void
  newParticipantName: string
  onNewParticipantNameChange: (val: string) => void
  onAddParticipant: () => void
  onRemoveParticipant: (index: number) => void
  isAddingParticipant: boolean
}

export function ActivePhase({
  winnerReward,
  participantCount,
  participants,
  isAdmin,
  isSpinning,
  spinWinner,
  onSpin,
  newParticipantName,
  onNewParticipantNameChange,
  onAddParticipant,
  onRemoveParticipant,
  isAddingParticipant,
}: ActivePhaseProps) {
  const count = participantCount > 0 ? participantCount : participants.length

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Sorteo en Curso
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
          ¡Llegó el gran día!
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          El premio más votado por la comunidad está en juego.
        </p>
      </div>

      <div className="rounded-[32px] border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6 text-center shadow-xl shadow-gold/10">
        <Trophy className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gold/80">
          Premio del Mes
        </p>
        {winnerReward ? (
          <>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
                <PrizeIcon type={winnerReward.icon || winnerReward.type} className="h-7 w-7 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                {winnerReward.name}
              </h3>
            </div>
            {winnerReward.description && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {winnerReward.description}
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-lg font-semibold text-gold">
            Calculando premio ganador...
          </p>
        )}
      </div>

      <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <Users className="h-5 w-5 text-gold" />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Participantes
          </p>
        </div>

        <p className="text-3xl font-bold text-[var(--text-primary)]">{count}</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {count === 1 ? 'persona participa' : 'personas participan'} en este sorteo
        </p>

        {isAdmin && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => onNewParticipantNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddParticipant() }}
              placeholder="Nombre del participante"
              className="flex-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-gold/50"
            />
            <button
              type="button"
              onClick={onAddParticipant}
              disabled={isAddingParticipant || !newParticipantName.trim()}
              className="flex shrink-0 items-center gap-1 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-surface-dark transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              {isAddingParticipant ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        )}

        {participants.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {participants.map((name, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                  isAdmin
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
              >
                {name}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(i)}
                    className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-red-500/20 hover:text-red-400 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="text-center">
          {isSpinning ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold/30 bg-[var(--bg-card)]">
                <Sparkles className="h-10 w-10 animate-pulse text-gold" />
              </div>
              <p className="text-sm font-semibold text-gold">Girando la ruleta...</p>
            </div>
          ) : spinWinner ? (
            <div className="rounded-[32px] border-2 border-gold bg-gold/10 p-6 animate-winner-fade">
              <Sparkles className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
                ¡{spinWinner}!
              </p>
              <p className="mt-1 text-sm text-gold">
                es el ganador de este mes
              </p>
            </div>
          ) : (
            <button
              onClick={onSpin}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-surface-dark shadow-lg shadow-gold/30 transition-all hover:brightness-110 active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              Realizar Sorteo
            </button>
          )}
        </div>
      )}
    </section>
  )
}
