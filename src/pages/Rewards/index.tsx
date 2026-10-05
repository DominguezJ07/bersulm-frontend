import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useRewardsFlow } from './hooks/useRewardsFlow'
import { usePrizeAdmin } from './hooks/usePrizeAdmin'
import { CountdownTimer, AdminRewardsPanel, AdminRaffleManager, RaffleDurationControl, CurrentPrizeCard, PrizeFormModal } from './components'

export default function Rewards() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const flow = useRewardsFlow()
  const prizeAdmin = usePrizeAdmin({ onSuccess: flow.loadRaffle })

  return (
    <main className="bg-[var(--bg-primary)] px-6 pt-8 pb-24 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <style>{`
        @keyframes wheel-spin {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(1980deg); }
          100% { transform: rotate(1800deg); }
        }
      `}</style>

      <Helmet>
        <title>Premios | BERSULM</title>
        <meta name="description" content="Participa en el sorteo mensual de BERSULM y descubre los premios de fidelidad disponibles." />
      </Helmet>

      <header className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Sistema de Recompensas
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Premios y Sorteos
        </h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
          Descubre el premio del sorteo mensual y los beneficios exclusivos para clientes VIP.
        </p>
      </header>

      {isAdmin && <AdminRewardsPanel />}

      <section className="mt-10 space-y-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">
            Sorteo Mensual
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Premio del Sorteo Mensual
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Cada mes sorteamos un premio especial entre nuestros clientes. Aquí puedes ver el premio actual y la cuenta regresiva.
          </p>
        </div>

        {flow.isLoading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
          </div>
        )}

        {!flow.isLoading && !flow.raffle && (
          <>
            <CurrentPrizeCard
              prize={null}
              isAdmin={isAdmin}
              onCreateClick={prizeAdmin.openCreate}
            />
          </>
        )}

        {!flow.isLoading && flow.raffle && (
          <>
            <div className="space-y-4">
              <CountdownTimer
                days={flow.remaining.days}
                hours={flow.remaining.hours}
                minutes={flow.remaining.minutes}
                seconds={flow.remaining.seconds}
              />
              {isAdmin && flow.raffle.status === 'active' && (
                <RaffleDurationControl
                  raffleId={flow.raffle._id || (flow.raffle as any).id || ''}
                  onUpdated={flow.loadRaffle}
                />
              )}
            </div>

            <CurrentPrizeCard
              prize={flow.prize}
              isAdmin={isAdmin}
              onCreateClick={prizeAdmin.openCreate}
            />
          </>
        )}

        <PrizeFormModal
          isOpen={prizeAdmin.isModalOpen}
          isSubmitting={prizeAdmin.isSubmitting}
          editingRaffle={prizeAdmin.editingRaffle}
          onClose={prizeAdmin.closeModal}
          onSubmit={prizeAdmin.handleSubmit}
        />
      </section>

      {isAdmin && (
        <section className="mt-12">
          <AdminRaffleManager
            raffles={prizeAdmin.raffles}
            isLoading={prizeAdmin.isLoadingRaffles}
            page={prizeAdmin.page}
            totalPages={prizeAdmin.totalPages}
            onPageChange={prizeAdmin.setPage}
            onEdit={prizeAdmin.openEdit}
            onDelete={prizeAdmin.handleDelete}
            onCreate={prizeAdmin.openCreate}
          />
        </section>
      )}
    </main>
  )
}
