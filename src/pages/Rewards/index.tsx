import { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Sparkles, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useRewardsFlow } from './hooks/useRewardsFlow'
import { useSorteosFlow } from '../Sorteos/hooks/useSorteosFlow'
import { CountdownTimer, WheelSpinner, RewardCard, RaffleHistory, AdminRewardsPanel } from './components'
import { CountdownBanner, VotingPhase, ActivePhase, CompletedPhase } from '../Sorteos/components'
import { onSocketEvent } from '@/lib/socket'

const wheelColors = ['#f5a623', '#d4891a', '#b8740f']

function SorteosContent() {
  const flow = useSorteosFlow()

  const rewardsData = useMemo(() =>
    flow.votes.map((v) => ({
      id: v.rewardId,
      name: v.name,
      votes: v.count,
      pct: v.percentage,
    })),
    [flow.votes],
  )

  const leadingPrize = useMemo(() => {
    if (rewardsData.length === 0) return ''
    return rewardsData.reduce((a, b) => (a.votes > b.votes ? a : b)).name
  }, [rewardsData])

  if (flow.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
      </div>
    )
  }

  if (!flow.phase) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <Sparkles className="h-12 w-12 text-gold/40" />
        <p className="text-lg text-[var(--text-muted)]">
          No hay sorteos activos en este momento.
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Vuelve pronto para participar en el próximo sorteo mensual.
        </p>
      </div>
    )
  }

  return (
    <>
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
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <WheelSpinner
              participants={[]}
              wheelColors={wheelColors}
              isSpinning={false}
              winner={null}
              raffleWinner={undefined}
              raffleStatus="voting"
              isAdmin={false}
              isLastDay={false}
              isSpinLoading={false}
              onStartDraw={() => {}}
              wheelMode="rewards"
              rewardsData={rewardsData}
              currentPrize={leadingPrize}
            />

            {flow.userHasVoted ? (
              <div className="flex flex-col items-center justify-center rounded-[32px] border border-gold/15 bg-[var(--bg-card)] p-8 text-center shadow-xl shadow-gold/5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                  <Gift className="h-8 w-8 text-gold" />
                </div>
                <p className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                  Ya has votado este mes
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  ¡Gracias por participar! El premio ganador se anunciará al final del mes.
                </p>
                {leadingPrize && (
                  <div className="mt-4 rounded-full bg-gold/10 px-4 py-2 text-sm text-gold">
                    Premio lider: <strong>{leadingPrize}</strong>
                  </div>
                )}
              </div>
            ) : (
              <VotingPhase
                votes={flow.votes}
                userHasVoted={flow.userHasVoted}
                votedRewardId={flow.votedRewardId}
                isVoting={flow.isVoting}
                onVote={flow.handleVote}
              />
            )}
          </div>
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
    </>
  )
}

export default function Rewards() {
  const [activeTab, setActiveTab] = useState<'premios' | 'sorteos'>('premios')
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const flow = useRewardsFlow()

  return (
    <main className="bg-[var(--bg-primary)] px-6 pt-8 pb-24 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <style>{`
        @keyframes wheel-spin {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(1980deg); }
          100% { transform: rotate(1800deg); }
        }
        @keyframes winner-fade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .winner-fade {
          animation: winner-fade 0.5s ease-out forwards;
        }
        @keyframes winner-fade-scale {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-winner-fade {
          animation: winner-fade-scale 0.6s ease-out forwards;
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
        <title>Premios y Sorteos | BERSULM</title>
        <meta name="description" content="Participa en sorteos mensuales y vota por tus premios favoritos en BERSULM." />
      </Helmet>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">
            {activeTab === 'premios' ? 'Sistema de Recompensas' : 'Sorteos Mensuales'}
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {activeTab === 'premios'
              ? 'Participa en nuestros sorteos mensuales'
              : 'Participa y gana premios exclusivos'}
          </h1>
          <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
            {activeTab === 'premios'
              ? 'Vota por los premios del próximo mes y participa en la ruleta de la suerte.'
              : 'Cada mes la comunidad vota por su premio favorito. El más votado se sortea entre todos los participantes. ¡Tú puedes ser el próximo ganador!'}
          </p>
        </header>

        <div className="flex shrink-0 gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('premios')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === 'premios'
                ? 'bg-gold text-surface-dark'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Premios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sorteos')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === 'sorteos'
                ? 'bg-gold text-surface-dark'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Sorteos
          </button>
        </div>
      </div>

      {activeTab === 'premios' && (
        <>
          {isAdmin && <AdminRewardsPanel />}

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <CountdownTimer
              days={flow.remaining.days}
              hours={flow.remaining.hours}
              minutes={flow.remaining.minutes}
              seconds={flow.remaining.seconds}
            />

            <WheelSpinner
              participants={flow.getWheelParticipants()}
              wheelColors={flow.wheelColors}
              isSpinning={flow.drawState.isSpinning}
              winner={flow.drawState.winner}
              raffleWinner={flow.raffle?.winner}
              raffleStatus={flow.raffle?.status}
              isAdmin={flow.isAdmin}
              isLastDay={flow.isLastDayOfMonth}
              isSpinLoading={flow.isSpinLoading}
              onStartDraw={flow.handleStartDraw}
              wheelMode={flow.wheelMode}
              rewardsData={flow.wheelRewardsData}
              currentPrize={flow.currentPrize}
            />
          </section>

          <section className="mt-10">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-gold">
                Vota por los Premios del Próximo Mes
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Elige las recompensas que más te emocionan
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                Participa con tu voto y ayuda a decidir los premios que estarán disponibles para
                clientes VIP.
              </p>
            </div>

            {flow.rewards.length === 0 && !flow.isLoading && (
              <p className="py-8 text-center text-[var(--text-muted)]">Cargando premios...</p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flow.rewards.map((reward) => {
                const rewardId = reward._id || reward.id || ''
                const voteCount =
                  flow.rewards.find(
                    (r) => (r._id || r.id) === rewardId,
                  )?.votes || Number(reward.voteCount) || 0

                return (
                  <RewardCard
                    key={rewardId}
                    reward={reward}
                    voteCount={voteCount as number}
                    totalVotes={flow.totalVotes}
                    votedRewardId={flow.votedRewardId}
                    userHasVoted={flow.userHasVoted}
                    isVoteDisabled={flow.userHasVoted}
                    onVote={flow.handleVote}
                  />
                )
              })}
            </div>

            <div className="mt-8 rounded-[32px] border border-gold/15 bg-[var(--bg-card)] p-6 text-sm text-[var(--text-secondary)] shadow-xl shadow-gold/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    Total de votaciones
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Gracias por ser parte del proceso de decisiones del próximo mes.
                  </p>
                </div>
                <div className="rounded-full bg-[var(--bg-primary)] px-4 py-2 text-sm font-semibold text-gold">
                  {flow.totalVotes} votos emitidos
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'sorteos' && (
        <>
          <SorteosContent />
          <RaffleHistory />
        </>
      )}
    </main>
  )
}
