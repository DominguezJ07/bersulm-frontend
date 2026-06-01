import { useEffect, useState } from 'react'
import { Award, Gift, Check, RefreshCw, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import Card from '../../components/ui/Card'

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

// Componente Scratch Card individual
function ScratchCard({ isWinner, rewardText, onReveal, revealed }) {
  const [scratchRevealed, setScratchRevealed] = useState(revealed || false)

  const handleReveal = () => {
    setScratchRevealed(true)
    onReveal()
  }

  if (scratchRevealed) {
    return (
      <div
        className={`h-32 rounded-lg flex items-center justify-center font-bold text-center p-3 cursor-default transition-all ${
          isWinner
            ? 'bg-gradient-to-br from-[#f5a623] to-[#d4891a] text-[#1a1208] shadow-lg shadow-[#f5a623]/50 scale-105'
            : 'bg-[#2a1f0e] border border-[#f5a623] text-[#f5a623]'
        }`}
      >
        {isWinner ? (
          <div className="text-center">
            <Award size={24} className="mx-auto mb-1" />
            <span className="text-sm">{rewardText}</span>
          </div>
        ) : (
          '—'
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleReveal}
      className="h-32 rounded-lg bg-[#3a2a1a] border-2 border-[#f5a623] flex items-center justify-center text-[#f5a623] font-bold text-lg hover:shadow-lg hover:shadow-[#f5a623]/30 transition-all cursor-pointer relative overflow-hidden group"
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
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
  const [loyalty, setLoyalty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [winnerIndex, setWinnerIndex] = useState(null)
  const [scratchesRevealed, setScratchesRevealed] = useState({})

  const visitsCompleted = loyalty?.visits || 0
  const isCardComplete = visitsCompleted >= 5
  const winnerReward = winnerIndex !== null ? possibleRewards[winnerIndex] : null

  // Cargar datos de lealtad
  useEffect(() => {
    const loadLoyalty = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get('http://localhost:3000/api/v1/loyalty', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setLoyalty(response.data.data || response.data)
        
        // Si hay premio ganador pero no se ha revelado aún
        if (response.data.data?.winnerIndex !== undefined) {
          setWinnerIndex(response.data.data.winnerIndex)
        }
      } catch (error) {
        console.error('Error cargando tarjeta:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLoyalty()
  }, [token])

  const handleAddVisit = async () => {
    if (!token) return

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/loyalty/visit',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setLoyalty(response.data.data || response.data)
      
      if (visitsCompleted + 1 >= 5 && winnerIndex === null) {
        setWinnerIndex(Math.floor(Math.random() * possibleRewards.length))
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al agregar visita')
    }
  }

  const handleReset = async () => {
    if (!token) return

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/loyalty/reset',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setLoyalty(response.data.data || response.data)
      setWinnerIndex(null)
      setScratchesRevealed({})
      setIsFlipped(false)
    } catch (error) {
      console.error('Error reseteando:', error)
    }
  }

  const handleClaimReward = async () => {
    if (!token || winnerReward === null) return

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/loyalty/claim',
        { reward: winnerReward },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('¡Premio reclamado! ' + response.data?.message || '')
      setLoyalty(response.data.data || response.data)
      setWinnerIndex(null)
      setScratchesRevealed({})
    } catch (error) {
      alert(error.response?.data?.message || 'Error al reclamar premio')
    }
  }

  if (!token) {
    return (
      <main className="px-6 pt-8 pb-24 sm:px-8 lg:px-10 min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg text-[#cccccc]">Inicia sesión para ver tu tarjeta de fidelidad</p>
        </Card>
      </main>
    )
  }

  const displayName = loyalty?.user?.name || authUser?.name || 'Miembro BERSULM'
  const user = JSON.parse(localStorage.getItem('bersulm_user') || '{}')
  const isAdmin = user?.role === 'admin'

  return (
    <main className="px-6 pt-8 pb-24 sm:px-8 lg:px-10 bg-app">
      <style>{`
        @keyframes flip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        
        @keyframes flipReverse {
          0% { transform: rotateY(180deg); }
          100% { transform: rotateY(0deg); }
        }

        .flip-animation {
          animation: flip 0.6s ease-in-out forwards;
        }

        .flip-reverse-animation {
          animation: flipReverse 0.6s ease-in-out forwards;
        }

        .card-3d {
          perspective: 1000px;
          cursor: pointer;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .card-inner.flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Programa de Fidelidad</p>
        <h1 className="text-3xl font-semibold text-app mx-auto sm:text-4xl">Tu Tarjeta Premium BERSULM</h1>
      </header>

      <div className="flex justify-center items-center my-8">
        <div className="w-[90%] sm:w-96 max-w-full">
          <div className="relative" style={{ perspective: '1000px' }}>
            <div className="card-3d h-48 md:h-56" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* FRENTE */}
                <div className="card-face">
                  <Card className="p-6 md:p-8 h-full flex flex-col justify-between bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] border-2 border-[#f5a623]/20 shadow-2xl shadow-[#f5a623]/10">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-xl md:text-2xl font-bold text-[#f5a623]">BERSULM</div>
                        <Award size={28} className="text-[#f5a623]" />
                      </div>
                      <p className="text-xs uppercase tracking-widest text-[#f5a623]/70">Tarjeta Premium</p>
                    </div>

                      <div className="text-center py-2 md:py-4">
                      <p className="text-lg md:text-xl font-bold text-app">{displayName}</p>
                    </div>

                    <div>
                      <p className="text-xs md:text-sm text-[#cccccc] mb-2 text-center tracking-wider">**** **** **** 2026</p>
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-bold text-[#f5a623]">BERSULM VIP</p>
                        <p className="text-xs text-[#cccccc]">Toca para girar</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* REVERSO */}
                <div className="card-face card-back">
                  <Card className="p-6 md:p-8 h-full flex flex-col justify-between bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] border-2 border-[#f5a623]/20 shadow-2xl shadow-[#f5a623]/10">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-app mb-2">Progreso de Visitas</h3>
                      <p className="text-xs md:text-sm text-[#f5a623]">{visitsCompleted} de 5 visitas completadas</p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold transition-all text-xs ${
                            i < visitsCompleted
                              ? 'bg-[var(--gold)] text-[var(--bg-primary)]'
                                : 'border-2 border-[#f5a623] text-[#f5a623]'
                          }`}>
                          {i < visitsCompleted ? '✓' : ''}
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs text-[#cccccc] text-center mb-1">Completa 5 visitas para una recompensa</p>
                      <p className="text-xs text-[#f5a623]/70 text-center">Toca la tarjeta para voltearla</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-center mb-12">
          <Card className="p-6 border border-[#f5a623]/20 bg-[#2a1f0e] h-fit w-[90%] sm:w-96 max-w-full">
            <p className="text-sm text-[#cccccc] mb-4">📱 Panel Admin: Simula una visita para ver el progreso</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddVisit}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-[#f5a623] hover:bg-[#d4891a] text-[#1a1208] font-semibold rounded-lg transition-all w-full"
              >
                <ChevronDown size={18} className="rotate-180" />
                Agregar Visita
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-[#f5a623]/50 hover:border-[#f5a623] text-[#f5a623] font-semibold rounded-lg transition-all w-full"
              >
                <RefreshCw size={18} />
                Reiniciar
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* BANNER DE COMPLETITUD */}
      {isCardComplete && !winnerIndex && (
        <section className="mb-12">
          <div className="p-6 rounded-lg bg-gradient-to-r from-[#f5a623] to-[#d4891a] text-[#1a1208] text-center shadow-lg shadow-[#f5a623]/30">
            <Award size={32} className="mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">¡Tienes un regalo!</h2>
            <p className="text-sm font-semibold">Completaste tu tarjeta de fidelidad</p>
          </div>
        </section>
      )}

      {/* SECCIÓN DE SCRATCH CARDS */}
      {isCardComplete && (
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">¡Completaste tu tarjeta!</h2>
            <p className="text-[#cccccc] mb-4">Posibles premios:</p>
            <div className="flex flex-wrap gap-2">
              {possibleRewards.map((reward, i) => (
                <span key={i} className="px-3 py-1 bg-[#2a1f0e] border border-[#f5a623]/30 text-[#f5a623] text-xs rounded-full">
                  {reward}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <ScratchCard
                key={i}
                isWinner={i === winnerIndex}
                rewardText={possibleRewards[i] || 'Sorpresa'}
                revealed={scratchesRevealed[i] || false}
                onReveal={() => setScratchesRevealed({ ...scratchesRevealed, [i]: true })}
              />
            ))}
          </div>

          {winnerIndex !== null && Object.keys(scratchesRevealed).length > 0 && (
            <div className="text-center">
              <div className="inline-block p-6 bg-gradient-to-r from-[#f5a623] to-[#d4891a] rounded-lg mb-4 shadow-lg shadow-[#f5a623]/30">
                <p className="text-[#1a1208] font-bold text-lg mb-2">¡GANASTE!</p>
                <p className="text-[#1a1208] font-bold text-xl mb-4">{winnerReward}</p>
                <button
                  onClick={handleClaimReward}
                  className="px-6 py-2 bg-[#1a1208] hover:bg-[#0f0a06] text-[#f5a623] font-bold rounded-lg transition-all"
                >
                  Reclamar Premio
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* BENEFICIOS */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Beneficios del Programa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <Card key={i} className="p-6 border border-[#f5a623]/20 bg-[#2a1f0e] text-center hover:shadow-lg hover:shadow-[#f5a623]/20 transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--bg-primary)]">
                  <Gift size={24} />
                </div>
              </div>
                  <h3 className="text-lg font-bold text-app mb-2">{benefit.title}</h3>
              <p className="text-sm text-[#cccccc]">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
