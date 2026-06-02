import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Gift, Award, ArrowLeft, Sparkles } from 'lucide-react'
import { loyaltyService } from '@/services/loyalty.service'
import type { MinigameState, MinigameRevealResult } from '@/types'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui'

type GamePhase = 'loading' | 'error' | 'playing' | 'revealing' | 'result'

interface CardState {
  index: number
  revealed: boolean
  isWinner: boolean
  flipping: boolean
}

const CONFETTI_COLORS = ['#f5a623', '#d4891a', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9']
const CONFETTI_COUNT = 40

export default function LoyaltyMinigame() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<GamePhase>('loading')
  const [error, setError] = useState('')
  const [minigame, setMinigame] = useState<MinigameState | null>(null)
  const [cards, setCards] = useState<CardState[]>([])
  const [result, setResult] = useState<MinigameRevealResult | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleBack = useCallback(() => {
    navigate(ROUTES.LOYALTY)
  }, [navigate])

  useEffect(() => {
    const init = async () => {
      try {
        const response = await loyaltyService.getMinigame()
        const data = response.data
        setMinigame(data)

        const initialCards: CardState[] = Array.from({ length: data.cardsCount }, (_, i) => ({
          index: i,
          revealed: false,
          isWinner: false,
          flipping: false,
        }))
        setCards(initialCards)
        setPhase('playing')
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Error al iniciar el minijuego'
        setError(msg)
        setPhase('error')
      }
    }

    init()
  }, [])

  const handleCardTap = useCallback(
    async (cardIndex: number) => {
      if (phase !== 'playing') return
      if (cards[cardIndex]?.revealed) return

      setPhase('revealing')
      setSelectedIndex(cardIndex)

      setCards((prev) =>
        prev.map((c) => (c.index === cardIndex ? { ...c, flipping: true } : c)),
      )

      try {
        await new Promise((r) => setTimeout(r, 600))

        const response = await loyaltyService.revealCard(cardIndex)
        const data = response.data
        setResult(data)

        setCards((prev) =>
          prev.map((c) =>
            c.index === cardIndex
              ? { ...c, revealed: true, isWinner: data.won, flipping: false }
              : c,
          ),
        )

        await new Promise((r) => setTimeout(r, 800))
        setPhase('result')
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data
            ?.message || 'Error al revelar la carta'
        const status = (err as { response?: { status?: number } })?.response?.status

        if (status === 409) {
          setCards((prev) =>
            prev.map((c) => (c.index === cardIndex ? { ...c, flipping: false } : c)),
          )
          setPhase('playing')
          return
        }

        if (status === 400 && msg.includes('reward_pending')) {
          setError('No tienes un premio pendiente')
          setPhase('error')
          return
        }

        setCards((prev) =>
          prev.map((c) => (c.index === cardIndex ? { ...c, flipping: false } : c)),
        )
        setPhase('playing')
      }
    },
    [phase, cards],
  )

  const rewardName =
    minigame?.availableRewards?.[0]?.name || 'un premio sorpresa'

  if (phase === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pb-24 pt-8 sm:px-8 lg:px-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
      </main>
    )
  }

  if (phase === 'error') {
    return (
      <main className="bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-md text-center">
          <Card className="border border-red-500/30 p-8">
            <Award size={40} className="mx-auto mb-4 text-red-400" />
            <p className="mb-4 text-lg text-[var(--text-secondary)]">{error}</p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2 font-semibold text-surface-dark transition-all hover:brightness-110"
            >
              <ArrowLeft size={18} />
              Volver a Fidelidad
            </button>
          </Card>
        </div>
      </main>
    )
  }

  if (phase === 'result' && result) {
    return (
      <main className="bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes result-pop-in {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(245,166,35,0.4); }
            50% { box-shadow: 0 0 40px rgba(245,166,35,0.7); }
          }
        `}</style>

        <div className="mx-auto max-w-md text-center">
          <div className="mb-8" style={{ animation: 'result-pop-in 0.5s ease-out forwards' }}>
            {result.won ? (
              <div className="rounded-3xl border-2 border-gold bg-gradient-to-b from-gold/15 to-transparent p-8 shadow-2xl" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
                {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
                  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
                  const left = Math.random() * 100
                  const delay = Math.random() * 2
                  const size = 6 + Math.random() * 8
                  const duration = 2 + Math.random() * 2
                  return (
                    <div
                      key={i}
                      className="pointer-events-none fixed top-0 z-50 rounded-sm"
                      style={{
                        left: `${left}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: color,
                        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                      }}
                    />
                  )
                })}
                <Sparkles size={48} className="mx-auto mb-4 text-gold" />
                <p className="mb-2 text-3xl font-black uppercase tracking-[0.15em] text-gold">
                  ¡GANASTE!
                </p>
                <div className="my-4 inline-block rounded-xl bg-gold px-6 py-3">
                  <p className="text-xl font-bold text-surface-dark">
                    {result.reward?.name || 'Premio'}
                  </p>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  ¡Disfruta tu premio en tu próxima visita!
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-xl">
                <p className="mb-4 text-5xl">😔</p>
                <p className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
                  ¡Sigue participando!
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Vuelve a completar 5 visitas para intentarlo de nuevo.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3 text-base font-bold text-surface-dark transition-all hover:brightness-110 active:scale-95"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <style>{`
        @keyframes cardFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        .card-scene { perspective: 600px; }
        .card-flipper { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .card-flipper.flipping { transform: rotateY(180deg); }
        .card-front, .card-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .card-back { transform: rotateY(180deg); }
        @keyframes cardPopIn {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .card-enter {
          animation: cardPopIn 0.4s ease-out forwards;
        }
      `}</style>

      <Helmet>
        <title>Minijuego de Fidelidad | BERSULM</title>
        <meta name="description" content="Descubre tu premio de fidelidad en BERSULM." />
      </Helmet>

      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Minijuego de Fidelidad</p>
        <h1 className="mx-auto mt-2 text-3xl font-semibold sm:text-4xl">
          ¡Descubre tu Premio!
        </h1>
      </header>

      <div className="mx-auto mb-6 max-w-md text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-[var(--bg-card)] px-4 py-2">
          <Gift size={18} className="text-gold" />
          <span className="text-sm text-[var(--text-secondary)]">
            Puedes ganar:{' '}
            <span className="font-semibold text-gold">{rewardName}</span>
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-md">
        <div className="mb-4 grid grid-cols-4 gap-3">
          {cards.slice(0, 8).map((card) => (
            <button
              key={card.index}
              type="button"
              disabled={phase !== 'playing' || card.revealed}
              onClick={() => handleCardTap(card.index)}
              className="card-enter aspect-square w-full"
              style={{ animationDelay: `${card.index * 0.06}s` }}
            >
              <div className="card-scene h-full w-full">
                <div
                  className={`card-flipper ${card.flipping || card.revealed ? 'flipping' : ''}`}
                >
                  <div className="card-front cursor-pointer border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent shadow-md transition-all hover:border-gold hover:shadow-gold/20 active:scale-95">
                    <span className="text-2xl font-bold text-gold">?</span>
                  </div>
                  <div
                    className={`card-back border-2 shadow-md ${
                      card.isWinner
                        ? 'border-gold bg-gradient-to-br from-gold to-[#d4891a]'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                    }`}
                  >
                    {card.isWinner ? (
                      <div className="text-center text-surface-dark">
                        <Sparkles size={24} className="mx-auto mb-1" />
                        <span className="text-xs font-bold">PREMIUM</span>
                      </div>
                    ) : (
                      <span className="text-2xl text-[var(--text-muted)]">✕</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          {cards.slice(8, 10).map((card) => (
            <button
              key={card.index}
              type="button"
              disabled={phase !== 'playing' || card.revealed}
              onClick={() => handleCardTap(card.index)}
              className="card-enter aspect-square w-[calc(50%-0.375rem)] max-w-[120px]"
              style={{ animationDelay: `${card.index * 0.06}s` }}
            >
              <div className="card-scene h-full w-full">
                <div
                  className={`card-flipper ${card.flipping || card.revealed ? 'flipping' : ''}`}
                >
                  <div className="card-front cursor-pointer border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent shadow-md transition-all hover:border-gold hover:shadow-gold/20 active:scale-95">
                    <span className="text-2xl font-bold text-gold">?</span>
                  </div>
                  <div
                    className={`card-back border-2 shadow-md ${
                      card.isWinner
                        ? 'border-gold bg-gradient-to-br from-gold to-[#d4891a]'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                    }`}
                  >
                    {card.isWinner ? (
                      <div className="text-center text-surface-dark">
                        <Sparkles size={24} className="mx-auto mb-1" />
                        <span className="text-xs font-bold">PREMIUM</span>
                      </div>
                    ) : (
                      <span className="text-2xl text-[var(--text-muted)]">✕</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        {phase === 'revealing'
          ? 'Revelando carta...'
          : 'Elige una carta para descubrir tu premio'}
      </p>
    </main>
  )
}
