import { useEffect, useState } from 'react'
import { Award, Gift, RefreshCw, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui'
import api from '@/lib/api'
import type { LoyaltyProgress } from '@/types'

const possibleRewards = [
  'Corte Gratis',
  '30% Descuento',
  'Bebida Premium',
  'Tratamiento Capilar',
  'Kit de Productos',
  'Perfilado de Barba',
]

const benefits = [
  { title: 'Acumula Visitas', desc: 'Cada visita te acerca a una recompensa' },
  { title: 'Gana Recompensas', desc: 'Completa 5 visitas y reclama un premio' },
  { title: 'Beneficios VIP', desc: 'Acceso exclusivo a ofertas y promociones' },
]

function ScratchCard({
  isWinner,
  rewardText,
  onReveal,
  revealed: initialRevealed,
}: {
  isWinner: boolean
  rewardText: string
  onReveal: () => void
  revealed: boolean
}) {
  const [scratchRevealed, setScratchRevealed] = useState(initialRevealed || false)

  const handleReveal = () => {
    setScratchRevealed(true)
    onReveal()
  }

  if (scratchRevealed) {
    return (
      <div
        className={`flex h-32 items-center justify-center rounded-lg p-3 text-center font-bold transition-all ${
          isWinner
            ? 'scale-105 bg-gradient-to-br from-gold to-[#d4891a] text-surface-dark shadow-lg shadow-gold/50'
            : 'border border-gold bg-[var(--bg-card)] text-gold'
        }`}
      >
        {isWinner ? (
          <div className="text-center">
            <Award size={24} className="mx-auto mb-1" />
            <span className="text-sm">{rewardText}</span>
          </div>
        ) : (
          '\u2014'
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleReveal}
      className="group relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-gold/25 bg-[var(--bg-card)] text-base font-bold text-gold shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all hover:border-gold hover:shadow-[0_12px_36px_rgba(245,166,35,0.18)] md:h-28"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#f5a623" strokeWidth="1" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#hatch)" />
      </svg>
      <span className="relative z-10 text-center">
        <Gift size={24} className="mx-auto mb-1" />
        Rascar
      </span>
    </button>
  )
}

export default function Loyalty() {
  const { user: authUser, token } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [loyalty, setLoyalty] = useState<LoyaltyProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [scratchesRevealed, setScratchesRevealed] = useState<Record<number, boolean>>({})

  const visitsCompleted = (loyalty as unknown as { visits?: number })?.visits || 0
  const isCardComplete = visitsCompleted >= 5
  const winnerReward = winnerIndex !== null ? possibleRewards[winnerIndex] : null

  useEffect(() => {
    const loadLoyalty = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get('/loyalty')
        const data = response.data?.data || response.data
        setLoyalty(data)
        if (data?.winnerIndex !== undefined) {
          setWinnerIndex(data.winnerIndex)
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }

    loadLoyalty()
  }, [token])

  const handleAddVisit = async () => {
    if (!token) return

    try {
      const response = await api.post('/loyalty/visit', {})
      setLoyalty(response.data?.data || response.data)
      if (visitsCompleted + 1 >= 5 && winnerIndex === null) {
        setWinnerIndex(Math.floor(Math.random() * possibleRewards.length))
      }
    } catch {
      // silent
    }
  }

  const handleReset = async () => {
    setLoyalty({ ...loyalty, visits: 0 } as LoyaltyProgress)
    setWinnerIndex(null)
    setScratchesRevealed({})
    setIsFlipped(false)
  }

  const handleClaimReward = async () => {
    if (!token || winnerReward === null) return

    try {
      const response = await api.post('/loyalty/claim', { reward: winnerReward })
      setLoyalty(response.data?.data || response.data)
      setWinnerIndex(null)
      setScratchesRevealed({})
    } catch {
      // silent
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pb-24 pt-8 sm:px-8 lg:px-10">
        <Card className="p-8 text-center">
          <p className="text-lg text-[var(--text-secondary)]">
            Inicia sesión para ver tu tarjeta de fidelidad
          </p>
        </Card>
      </main>
    )
  }

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('bersulm_user') || '{}')
    } catch {
      return {}
    }
  })()
  const isAdmin = storedUser?.role === 'admin'
  const displayName = (loyalty as unknown as { user?: { name?: string } })?.user?.name || authUser?.name || 'Miembro BERSULM'

  return (
    <main className="bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <style>{`
        @keyframes flip { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }
        .card-3d { perspective: 1000px; cursor: pointer; width: 100%; margin: 0 auto; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { position: absolute; inset: 0; width: 100%; height: 100%; backface-visibility: hidden; display: flex; flex-direction: column; }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Programa de Fidelidad</p>
        <h1 className="mx-auto text-3xl font-semibold sm:text-4xl">
          Tu Tarjeta Premium BERSULM
        </h1>
      </header>

      <div className="my-8 flex justify-center">
        <div className="w-[92%] max-w-[420px]">
          <div className="relative" style={{ perspective: '1000px' }}>
            <div className="card-3d h-[240px] md:h-[260px]" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                <div className="card-face">
                  <Card className="flex h-full flex-col justify-between rounded-[24px] border border-gold/25 bg-[var(--bg-primary)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)] ring-1 ring-gold/15 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold uppercase tracking-[0.25em] text-gold sm:text-[26px]">
                          BERSULM
                        </h2>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-gold/70">
                          TARJETA PREMIUM
                        </p>
                      </div>
                      <div className="text-gold/90">
                        <Award size={20} />
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="text-base font-bold uppercase tracking-[0.15em] text-[var(--text-primary)]">
                        {displayName}
                      </p>
                    </div>

                    <div className="space-y-2 text-center text-[var(--text-secondary)]">
                      <p className="text-[11px] tracking-[0.2em] text-[var(--text-muted)]">**** **** **** 2026</p>
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-gold/80">
                        <span className="font-semibold text-gold">BERSULM VIP</span>
                        <span className="text-[var(--text-muted)]">Toca para girar</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="card-face card-back">
                  <Card className="flex h-full flex-col justify-between rounded-[28px] border border-gold/25 bg-[var(--bg-primary)] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.28)] ring-1 ring-gold/15 md:p-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">Tarjeta de fidelidad</p>
                      <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Progreso</h3>
                      <p className="text-xs text-gold/90">{visitsCompleted} de 5 visitas completadas</p>
                    </div>

                    <div className="grid gap-2 pb-2 md:gap-3">
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const isStamped = i < Math.min(visitsCompleted, 5)
                          return (
                            <div
                              key={i}
                              className={`aspect-square rounded-3xl border border-[var(--border-color)] p-2 text-center transition ${
                                isStamped
                                  ? 'bg-gold text-surface-dark shadow-[inset_0_0_0_2px_rgba(0,0,0,0.08)]'
                                  : 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                              }`}
                            >
                              <span className="block text-lg font-bold">{i + 1}</span>
                              <span className="mt-1 block text-[8px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                                BERSULM
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-1 text-center text-xs text-[var(--text-secondary)]">
                      <p>Completa 5 visitas para una recompensa.</p>
                      <p>Toca la tarjeta para girarla.</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-12 flex justify-center">
          <Card className="h-fit w-[90%] max-w-full border border-gold/20 p-6 sm:w-96">
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Panel Admin: Simula una visita para ver el progreso
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddVisit}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-2 font-semibold text-surface-dark transition-all hover:brightness-110"
              >
                <ChevronDown size={18} className="rotate-180" />
                Agregar Visita
              </button>
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gold/50 px-6 py-2 font-semibold text-gold transition-all hover:border-gold"
              >
                <RefreshCw size={18} />
                Reiniciar
              </button>
            </div>
          </Card>
        </div>
      )}

      {isCardComplete && !winnerIndex && (
        <section className="mb-12">
          <div className="rounded-lg bg-gradient-to-r from-gold to-[#d4891a] p-6 text-center text-surface-dark shadow-lg shadow-gold/30">
            <Award size={32} className="mx-auto mb-3" />
            <h2 className="mb-2 text-2xl font-bold">¡Tienes un regalo!</h2>
            <p className="text-sm font-semibold">Completaste tu tarjeta de fidelidad</p>
          </div>
        </section>
      )}

      {isCardComplete && (
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
              ¡Completaste tu tarjeta!
            </h2>
            <p className="mb-4 text-[var(--text-secondary)]">Posibles premios:</p>
            <div className="flex flex-wrap gap-2">
              {possibleRewards.map((reward, i) => (
                <span
                  key={i}
                  className="rounded-full border border-gold/30 bg-[var(--bg-card)] px-3 py-1 text-xs text-gold"
                >
                  {reward}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <ScratchCard
                key={i}
                isWinner={i === winnerIndex}
                rewardText={possibleRewards[i % possibleRewards.length] || 'Sorpresa'}
                revealed={scratchesRevealed[i] || false}
                onReveal={() =>
                  setScratchesRevealed({ ...scratchesRevealed, [i]: true })
                }
              />
            ))}
          </div>

          {winnerIndex !== null && Object.keys(scratchesRevealed).length > 0 && (
            <div className="text-center">
              <div className="mb-4 inline-block rounded-lg bg-gradient-to-r from-gold to-[#d4891a] p-6 shadow-lg shadow-gold/30">
                <p className="mb-2 text-lg font-bold text-surface-dark">¡GANASTE!</p>
                <p className="mb-4 text-xl font-bold text-surface-dark">{winnerReward}</p>
                <button
                  onClick={handleClaimReward}
                  className="rounded-lg bg-[var(--bg-card)] px-6 py-2 font-bold text-gold transition-all hover:brightness-150"
                >
                  Reclamar Premio
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">
          Beneficios del Programa
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Card
              key={i}
              className="border border-gold/20 bg-[var(--bg-card)] p-6 text-center transition-all hover:shadow-lg hover:shadow-gold/20"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-surface-dark">
                  <Gift size={24} />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">{benefit.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
