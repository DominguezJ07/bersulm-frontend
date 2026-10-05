import { Helmet } from 'react-helmet-async'
import { Trophy, Users, Sparkles, Plus, X } from 'lucide-react'
import { useSorteo } from './hooks/useSorteo'
import { WheelSpinner, RaffleHistory, WinnerModal } from '../Rewards/components'

export default function Sorteo() {
  const {
    phase,
    prize,
    prizeName,
    participants,
    winnerName,
    timeLeft,
    displaySeconds,
    isLoading,
    isAdmin,
    isSpinning,
    canSpin,
    showWinnerModal,
    closeWinnerModal,
    newParticipantName,
    setNewParticipantName,
    handleSpin,
    handleAddParticipant,
    handleRemoveParticipant,
    isAddingParticipant,
  } = useSorteo()

  const wheelColors = ['#f5a623', '#d4891a', '#b8740f']
  const count = participants.length

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
        @keyframes wheel-spin {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(1980deg); }
          100% { transform: rotate(1800deg); }
        }
      `}</style>

      <Helmet>
        <title>Sorteo | BERSULM</title>
        <meta
          name="description"
          content="Participa en el sorteo mensual de BERSULM. Mira la ruleta en vivo y descubre al ganador."
        />
      </Helmet>

      <header className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">
          Sorteo Mensual
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          La ruleta del mes
        </h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
          Cada mes sorteamos un premio especial entre todos los participantes. ¡Tú puedes ser el próximo ganador!
        </p>
      </header>

      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
        </div>
      )}

      {!isLoading && !phase && (
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

      {!isLoading && phase === 'active' && (
        <section className="space-y-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">
              Sorteo en Curso
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              ¡Llegó el gran día!
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              El premio del mes está en juego. ¡Que gire la ruleta!
            </p>
          </div>

          <div className="rounded-[32px] border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6 text-center shadow-xl shadow-gold/10">
            <Trophy className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gold/80">
              Premio del Mes
            </p>
            {prize ? (
              <>
                {prize.images && prize.images.length > 0 && (
                  <div className={`mx-auto mt-4 grid max-w-xs gap-2 ${prize.images.length === 1 ? 'grid-cols-1' : prize.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {prize.images.map((src, index) => (
                      <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-xl border border-gold/20">
                        <img src={src} alt={`${prize.name} ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                  {prize.name}
                </h3>
                {prize.description && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {prize.description}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 text-lg font-semibold text-gold">
                Premio por definir...
              </p>
            )}
          </div>

          <section className="grid gap-6">
            <WheelSpinner
              participants={participants}
              wheelColors={wheelColors}
              isSpinning={isSpinning}
              winner={winnerName}
              raffleWinner={winnerName ?? undefined}
              raffleStatus={phase}
              isAdmin={isAdmin}
              isLastDay={false}
              isSpinLoading={false}
              onStartDraw={() => {}}
              currentPrize={prizeName ?? ''}
            />

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
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddParticipant() }}
                    placeholder="Nombre del participante"
                    className="flex-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-gold/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddParticipant}
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
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      {name}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(i)}
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
                ) : canSpin ? (
                  <button
                    onClick={handleSpin}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-surface-dark shadow-lg shadow-gold/30 transition-all hover:brightness-110 active:scale-95"
                  >
                    <Sparkles className="h-5 w-5" />
                    Girar Ruleta
                  </button>
                ) : phase === 'active' && displaySeconds > 0 ? (
                  <div className="space-y-4">
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-tertiary)] px-8 py-3 text-sm font-semibold text-[var(--text-muted)] cursor-not-allowed opacity-60"
                    >
                      <Sparkles className="h-5 w-5" />
                      Girar Ruleta
                    </button>
                    <p className="text-sm text-[var(--text-muted)]">
                      Podrás girar la ruleta cuando termine la cuenta regresiva del sorteo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-tertiary)] px-8 py-3 text-sm font-semibold text-[var(--text-muted)] cursor-not-allowed"
                    >
                      <Sparkles className="h-5 w-5" />
                      Girar Ruleta
                    </button>
                    <p className="text-sm text-[var(--text-muted)]">
                      El sorteo aún no está listo para girar
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      )}

      {!isLoading && phase === 'completed' && (
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
              ¡{winnerName || 'Ganador'}!
            </h3>

            {prizeName && (
              <p className="mt-3 text-xl font-semibold text-gold">
                ganó {prizeName}
              </p>
            )}

            {prize && prize.description && (
              <p className="mt-4 max-w-sm mx-auto text-sm text-[var(--text-secondary)]">
                {prize.description}
              </p>
            )}

            {prize && prize.images && prize.images.length > 0 && (
              <div className={`mx-auto mt-6 grid max-w-md gap-3 ${prize.images.length === 1 ? 'grid-cols-1' : prize.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {prize.images.map((src, index) => (
                  <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-2xl border border-gold/20">
                    <img src={src} alt={`${prize.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
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
      )}

      <RaffleHistory />

      <WinnerModal
        isOpen={showWinnerModal}
        winnerName={winnerName}
        prizeName={prizeName}
        onClose={closeWinnerModal}
      />
    </main>
  )
}
