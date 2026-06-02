import { Helmet } from 'react-helmet-async'
import { useRewardsFlow } from './hooks/useRewardsFlow'
import { CountdownTimer, WheelSpinner, RewardCard } from './components'

export default function Rewards() {
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
      `}</style>

      <Helmet>
        <title>Recompensas | BERSULM</title>
        <meta name="description" content="Participa en sorteos mensuales y vota por tus premios favoritos en BERSULM." />
      </Helmet>
      <header className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Sistema de Recompensas
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Participa en nuestros sorteos mensuales
        </h1>
      </header>

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
    </main>
  )
}
