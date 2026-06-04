import { Helmet } from 'react-helmet-async'
import { Sparkles } from 'lucide-react'
import { useSorteosFlow } from './hooks/useSorteosFlow'
import { CountdownBanner, VotingPhase, ActivePhase, CompletedPhase } from './components'

export default function Sorteos() {
  const flow = useSorteosFlow()

  return (
    <main className="bg-[var(--bg-primary)] px-6 pt-8 pb-24 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <style>{`
        @keyframes winner-fade {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-winner-fade {
          animation: winner-fade 0.6s ease-out forwards;
        }
        @keyframes transition-pop {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-transition-pop {
          animation: transition-pop 0.5s ease-out forwards;
        }
      `}</style>

      <Helmet>
        <title>Sorteos | BERSULM</title>
        <meta
          name="description"
          content="Participa en los sorteos mensuales de BERSULM. Vota por tus premios favoritos y gana recompensas exclusivas."
        />
      </Helmet>

      <header className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Sorteos Mensuales
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Participa y gana premios exclusivos
        </h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
          Cada mes la comunidad vota por su premio favorito. El más votado se sortea entre
          todos los participantes. ¡Tú puedes ser el próximo ganador!
        </p>
      </header>

      {flow.isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
        </div>
      )}

      {!flow.isLoading && !flow.phase && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <Sparkles className="h-12 w-12 text-gold/40" />
          <p className="text-lg text-[var(--text-muted)]">
            No hay sorteos activos en este momento.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Vuelve pronto para participar en el próximo sorteo mensual.
          </p>
        </div>
      )}

      {flow.showTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/90 backdrop-blur-sm">
          <div className="animate-transition-pop text-center">
            <Sparkles className="mx-auto h-16 w-16 text-gold" />
            <p className="mt-4 text-2xl font-bold text-gold">¡Votación cerrada!</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              El premio del mes ha sido elegido. ¡Comienza el sorteo!
            </p>
          </div>
        </div>
      )}

      {!flow.isLoading && flow.phase && (
        <div className="space-y-8">
          <CountdownBanner
            days={flow.timeLeft.days}
            hours={flow.timeLeft.hours}
            minutes={flow.timeLeft.minutes}
            seconds={flow.timeLeft.seconds}
            label={
              flow.phase === 'voting'
                ? 'Tiempo para votar'
                : flow.phase === 'active'
                  ? 'Tiempo del sorteo'
                  : 'Sorteo finalizado'
            }
          />

          {flow.phase === 'voting' && (
            <VotingPhase
              votes={flow.votes}
              userHasVoted={flow.userHasVoted}
              votedRewardId={flow.votedRewardId}
              isVoting={flow.isVoting}
              onVote={flow.handleVote}
            />
          )}

          {flow.phase === 'active' && (
            <ActivePhase
              winnerReward={flow.winnerReward}
              participantCount={flow.participantCount}
              participants={flow.participants}
              isAdmin={flow.isAdmin}
              isSpinning={flow.isSpinning}
              spinWinner={flow.spinWinner}
              onSpin={flow.handleSpin}
              newParticipantName={flow.newParticipantName}
              onNewParticipantNameChange={flow.setNewParticipantName}
              onAddParticipant={flow.handleAddParticipant}
              onRemoveParticipant={flow.handleRemoveParticipant}
              isAddingParticipant={flow.isAddingParticipant}
            />
          )}

          {flow.phase === 'completed' && (
            <CompletedPhase
              winnerReward={flow.winnerReward}
              winnerId={flow.winnerId}
            />
          )}
        </div>
      )}
    </main>
  )
}
