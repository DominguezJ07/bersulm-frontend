import { Trophy, Sparkles } from 'lucide-react'
import { PrizeIcon } from './PrizeIcon'
import type { WinnerReward } from '@/types'

interface CompletedPhaseProps {
  winnerReward: WinnerReward | null
  winnerId: string | null
}

export function CompletedPhase({ winnerReward, winnerId }: CompletedPhaseProps) {
  return (
    <section className="space-y-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Sorteo Finalizado
        </p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
          ¡Tenemos un ganador!
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          El sorteo de este mes ha concluido. ¡Felicidades al afortunado ganador!
        </p>
      </div>

      <div className="animate-winner-fade rounded-[32px] border-2 border-gold bg-gradient-to-br from-gold/15 via-gold/5 to-transparent p-8 text-center shadow-2xl shadow-gold/20">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
          <Trophy className="h-10 w-10 text-gold" />
        </div>

        <h3 className="mt-6 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          ¡Felicidades!
        </h3>

        {winnerReward && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
              <PrizeIcon type={winnerReward.icon || winnerReward.type} className="h-8 w-8 text-gold" />
            </div>
            <p className="text-xl font-semibold text-gold">{winnerReward.name}</p>
            {winnerReward.description && (
              <p className="max-w-sm text-sm text-[var(--text-secondary)]">
                {winnerReward.description}
              </p>
            )}
          </div>
        )}

        {winnerId && (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            ID del ganador: {winnerId}
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <Sparkles className="h-6 w-6 animate-pulse text-gold" />
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 text-center shadow-xl">
        <p className="text-sm text-[var(--text-secondary)]">
          Gracias a todos los que participaron. ¡Nos vemos en el próximo sorteo!
        </p>
      </div>
    </section>
  )
}
