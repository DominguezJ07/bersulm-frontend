import { useEffect, useMemo, useState, useRef } from 'react'
import { ChevronDown, Clock3, Scissors, Percent, Coffee, Package, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

// Rewards loaded from backend

const defaultParticipants = ['Daniel', 'Nico', 'Fe', 'Ca', 'San', 'M', 'Di', 'J']
const wheelColors = ['#f5a623', '#d4891a', '#b8740f']

function getMonthEnd() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}

function calculateRemainingTime() {
  const target = getMonthEnd()
  const diff = target.getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

function normalizeVoteEntries(raw = []) {
  if (Array.isArray(raw)) {
    return raw.map((entry) => {
      const votes = typeof entry.voteCount === 'number' ? entry.voteCount : entry.votes ?? entry.count ?? 0
      return {
        rewardId: entry.rewardId || entry.id || entry.reward || entry.rewardName || entry.label,
        votes,
      }
    })
  }

  if (raw && typeof raw === 'object') {
    const entries = raw.votes || raw.items || raw.results
    if (Array.isArray(entries)) {
      return normalizeVoteEntries(entries)
    }

    return Object.keys(raw).map((key) => ({
      rewardId: key,
      votes: Number(raw[key]) || 0,
    }))
  }

  return []
}

function extractUserVoted(raw = {}) {
  return Boolean(raw.userHasVoted || raw.userVoted || raw.hasVoted || raw.voted)
}

function extractWinner(raw = {}) {
  return raw?.winner || raw?.winnerName || raw?.result || raw?.ganador || null
}

function truncateName(name, maxLength = 8) {
  return String(name).substring(0, maxLength)
}
export default function Rewards() {
  const { user, token } = useAuth()
  const [raffle, setRaffle] = useState(null)
  const [raffleId, setRaffleId] = useState(null)
  const raffleIdRef = useRef(null)
  const [raffleStatus, setRaffleStatus] = useState(null)
  const [remaining, setRemaining] = useState(calculateRemainingTime())
  const [currentDate, setCurrentDate] = useState(new Date())
  const [drawState, setDrawState] = useState({ isSpinning: false, winner: null })
  const [rewards, setRewards] = useState([])
  const [votes, setVotes] = useState({})
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [userVoted, setUserVoted] = useState(false)
  const [votedRewardId, setVotedRewardId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpinLoading, setIsSpinLoading] = useState(false)

  const navigate = useNavigate()

  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin)
  const isLastDayOfMonth = useMemo(() => {
    return currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  }, [currentDate])

  const safeVotes = votes && typeof votes === 'object' ? votes : {}
  const totalVotes = useMemo(() => Object.values(safeVotes).reduce((sum, value) => sum + Number(value || 0), 0), [safeVotes])

  const getWheelParticipants = () => {
    if (raffle?.participants && Array.isArray(raffle.participants) && raffle.participants.length > 0) {
      return raffle.participants.slice(0, 8).map(p => truncateName(p.name || p, 8))
    }
    return defaultParticipants
  }

  const loadRaffle = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('bersulm_token')

      // Cargar sorteo actual
      let raffleData = null
      try {
        const raffleRes = await axios.get('http://localhost:3000/api/v1/raffles/current')
        raffleData = raffleRes.data.data
        console.log('raffleData recibida:', raffleData)
        if (raffleData) {
          console.log('Seteando raffleId:', raffleData._id)
          setRaffle(raffleData)
          setRaffleId(raffleData._id || raffleData.id)
          // mantener también en ref para accesos síncronos
          raffleIdRef.current = raffleData._id || raffleData.id
          console.log('raffleId cargado:', raffleIdRef.current)
          setRaffleStatus(raffleData.status)

          const winner = extractWinner(raffleData)
          if (raffleData?.status === 'completed' && winner) {
            setDrawState({ isSpinning: false, winner })
          }
        }
      } catch (e) {
        console.log('Sin sorteo activo')
      }

      // Cargar premios (no requiere auth)
      try {
        const rewardsRes = await axios.get('http://localhost:3000/api/v1/rewards')
        const rewardsData = rewardsRes.data.data || rewardsRes.data || []
        setRewards(rewardsData)
        console.log('Premios cargados:', rewardsData.length)
      } catch (e) {
        console.error('Error cargando premios:', e)
      }

      // Cargar votos (requiere auth, opcional)
      if (token && raffleData) {
        try {
          const votesRes = await axios.get(
            'http://localhost:3000/api/v1/raffles/votes',
            { headers: { Authorization: `Bearer ${token}` } }
          )
          const allVotes = votesRes.data.data || []
          const voteCounts = {}
          allVotes.forEach(vote => {
            const id = vote.rewardId?.toString()
            if (id) {
              voteCounts[id] = (voteCounts[id] || 0) + 1
            }
          })
          setVotes(voteCounts)
          console.log('Votos contados:', voteCounts)

          try {
            const userId = JSON.parse(localStorage.getItem('bersulm_user'))?._id
            const myVote = allVotes.find(v => v.userId?.toString() === userId)
            if (myVote) {
              setUserVoted(true)
              setVotedRewardId(myVote.rewardId?.toString())
            }
          } catch (userError) {
            console.log('Error detectando voto del usuario:', userError.message)
          }
        } catch (e) {
          console.log('Error cargando votos:', e.message)
        }
      }
    } catch (error) {
      console.error('Error general:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(calculateRemainingTime())
      setCurrentDate(new Date())
    }, 1000)

    loadRaffle()

    return () => window.clearInterval(interval)
  }, [])

  const refreshVotes = async () => {
    try {
      const votesRes = await axios.get('http://localhost:3000/api/v1/raffles/votes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allVotes = votesRes.data?.data || votesRes.data || []

      const voteCounts = {}
      allVotes.forEach((v) => {
        const id = String(v.rewardId || v.reward || v.reward_id || '')
        if (!id) return
        voteCounts[id] = (voteCounts[id] || 0) + 1
      })

      // actualizar rewards con los conteos reales
      setRewards((current) =>
        current.map((r) => {
          const id = String(r._id || r.id || r.rewardId || r._key || '')
          return {
            ...r,
            votes: voteCounts[id] ?? (Number(r.votes) || Number(r.voteCount) || 0),
          }
        }),
      )

      // actualizar estado de voto del usuario
      const storedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('bersulm_user')) || {}
        } catch {
          return {}
        }
      })()
      const userIdLocal = storedUser?._id || storedUser?.id
      const myVote = allVotes.find((v) => String(v.userId || v.user_id) === String(userIdLocal))
      if (myVote) {
        setUserVoted(true)
        setVotedRewardId(String(myVote.rewardId || myVote.reward))
      }
    } catch (error) {
      console.error('Error refrescando votos:', error)
    }
  }

  const handleVote = async (rewardId) => {
    const currentRaffleId = raffleIdRef.current

    if (!currentRaffleId) {
      alert('No hay sorteo activo este mes')
      return
    }

    try {
      const token = localStorage.getItem('bersulm_token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await axios.post(
        'http://localhost:3000/api/v1/raffles/vote',
        { rewardId, raffleId: currentRaffleId },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      console.log('Voto registrado:', response.data)
      setUserVoted(true)
      setVotedRewardId(rewardId)

      try {
        const votesRes = await axios.get(
          'http://localhost:3000/api/v1/raffles/votes',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const allVotes = votesRes.data.data || []
        const voteCounts = {}
        allVotes.forEach(vote => {
          const id = vote.rewardId?.toString()
          if (id) {
            voteCounts[id] = (voteCounts[id] || 0) + 1
          }
        })
        setVotes(voteCounts)
      } catch (e) {
        console.log('Error recargando votos:', e.message)
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al votar'
      alert(msg)
    }
  }

  const handleStartDraw = async () => {
    if (!isAdmin || !isLastDayOfMonth || drawState.isSpinning || raffle?.status === 'completed' || !raffle?.id) {
      return
    }

    setIsSpinLoading(true)
    setDrawState({ isSpinning: true, winner: null })

    try {
      // Usar token admin si está disponible
      const adminToken = token || localStorage.getItem('bersulm_token')
      const response = await axios.post('http://localhost:3000/api/v1/raffles/spin', 
        { raffleId: raffle.id },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )

      const spinWinner = extractWinner(response.data?.data || response.data)
      const finalWinner = spinWinner || getWheelParticipants()[Math.floor(Math.random() * getWheelParticipants().length)]

      window.setTimeout(async () => {
        setDrawState({ isSpinning: false, winner: finalWinner })
        
        // Mostrar popup con el ganador
        alert(`¡Ganador: ${finalWinner}!`)
        
        await refreshVotes()
        try {
          const raffleResponse = await api.get('/raffles/current')
          const raffleData = raffleResponse.data?.data || raffleResponse.data || null
          setRaffle(raffleData)
        } catch (error) {
          console.error('Error actualizando sorteo después de girar:', error)
        }
      }, 5200)
    } catch (error) {
      console.error('Error al girar la ruleta:', error)
      alert(error.response?.data?.message || 'Error al girar la ruleta')
      setDrawState({ isSpinning: false, winner: null })
    } finally {
      setIsSpinLoading(false)
    }
  }

  return (
    <main className="px-6 pt-8 pb-24 sm:px-8 lg:px-10">
      <style>{`
        @keyframes wheel-spin {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(1980deg); }
          100% { transform: rotate(1800deg); }
        }

        .wheel-spin {
          animation: wheel-spin 5s cubic-bezier(.17,.67,.83,.67) forwards;
        }

        @keyframes winner-fade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .winner-fade {
          animation: winner-fade 0.5s ease-out forwards;
        }
      `}</style>

      <header className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Sistema de Recompensas</p>
        <h1 className="text-3xl font-semibold text-app sm:text-4xl">Participa en nuestros sorteos mensuales</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Próximo Sorteo</p>
              <h2 className="mt-3 text-2xl font-semibold text-app">Cuenta regresiva del sorteo</h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
                El sorteo se realizará el último día del mes, elige tu mejor estilo y cruza los dedos.
              </p>
            </div>
            <div className="rounded-3xl border border-[#f5a623]/20 bg-[#1f150c] p-4 text-[#f5a623] shadow-lg shadow-[#f5a623]/10">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em]">
                <Clock3 size={18} />
                <span>Próximo Sorteo</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Días', value: remaining.days },
              { label: 'Horas', value: remaining.hours },
              { label: 'Min', value: remaining.minutes },
              { label: 'Seg', value: remaining.seconds },
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-[#f5a623]/15 bg-[#2a1f0e] p-5 text-center">
                <p className="text-4xl font-semibold text-[#f5a623] sm:text-5xl">{String(item.value).padStart(2, '0')}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.35em] text-[#cccccc]">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Sorteo Mensual de Clientes</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">La ruleta gira con los nombres de nuestros clientes</h2>
            </div>
          </div>

          <div className="relative mt-8 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5a623] bg-card text-[#f5a623] shadow-lg shadow-[#f5a623]/15">
                <ChevronDown className="rotate-180" size={24} />
              </div>
            </div>

              <div className="relative h-[360px] w-[360px] rounded-full border border-[#f5a623]/20 bg-[#24180f] p-4 shadow-2xl shadow-[#000000]/40 sm:h-[380px] sm:w-[380px]">
              <svg
                viewBox="0 0 400 400"
                className={`h-full w-full rounded-full transition-transform duration-300 ${drawState.isSpinning ? 'wheel-spin' : ''}`}
                style={{ transformOrigin: '200px 200px' }}
              >
                {getWheelParticipants().map((name, index) => (
                  <g key={name} transform={`rotate(${index * 45} 200 200)`}>
                    <path
                      d="M200,200 L200,24 A176,176 0 0,1 324.5,75.5 Z"
                      fill={wheelColors[index % wheelColors.length]}
                      stroke="#1a1208"
                      strokeWidth="2"
                    />
                    <text
                      x="200"
                      y="62"
                      textAnchor="middle"
                      fill="#1a1208"
                      fontSize="18"
                      fontWeight="700"
                      letterSpacing="0.02em"
                      transform={`rotate(22.5 200 200)`}
                    >
                      {name}
                    </text>
                  </g>
                ))}
                <circle cx="200" cy="200" r="52" fill="var(--bg-primary)" />
                <circle cx="200" cy="200" r="42" fill="var(--gold)" />
              </svg>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            {(raffle?.status === 'active' || raffle?.status === 'completed') && raffle?.winner && (
              <div className="mb-6 flex justify-center">
                <div className="winner-fade rounded-[28px] border border-[#f5a623]/30 bg-card px-6 py-5 shadow-[0_0_40px_rgba(245,166,35,0.18)]">
                  <p className="text-center text-sm uppercase tracking-[0.35em] text-[#f5a623]">Ganador del Mes</p>
                  <p className="mt-2 text-center text-2xl font-bold text-app">{raffle.winner}</p>
                </div>
              </div>
            )}

            {isAdmin && isLastDayOfMonth && raffle?.status !== 'completed' ? (
              <button
                onClick={handleStartDraw}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-base py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={drawState.isSpinning || isSpinLoading}
              >
                {drawState.isSpinning ? '⏳ Girando Ruleta...' : '🎯 Iniciar Sorteo'}
              </button>
            ) : raffle?.status === 'completed' ? (
              <button type="button" className="w-full bg-amber-500 text-black font-bold text-base py-3 px-6 rounded-full cursor-default" disabled>
                🏆 Ver Ganador
              </button>
            ) : (
              <button type="button" className="w-full bg-gray-700 text-app-secondary font-bold text-base py-3 px-6 rounded-full cursor-default" disabled>
                🔒 Ruleta cerrada
              </button>
            )}
            <p className="max-w-sm text-sm text-[#cccccc]">
              Presiona el botón y mira cómo la ruleta decide al ganador del mes.
            </p>
            {drawState.winner && (
              <div className="winner-fade rounded-[28px] border border-[#f5a623]/30 bg-card px-5 py-4 text-app shadow-[0_0_40px_rgba(245,166,35,0.18)]">
                <div className="flex items-center justify-center gap-3 text-lg font-semibold text-[#f5a623]">
                  <Sparkles size={20} />
                  ¡Felicidades {drawState.winner}!
                </div>
                <p className="mt-2 text-sm text-[#cccccc]">Ha sido seleccionado como el ganador del sorteo mensual.</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Vota por los Premios del Próximo Mes</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Elige las recompensas que más te emocionan</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#cccccc]">
            Participa con tu voto y ayuda a decidir los premios que estarán disponibles para clientes VIP.
          </p>
        </div>

        {(!Array.isArray(rewards) || rewards.length === 0) && (
          <p className="text-gray-400 text-center py-8">
            Cargando premios...
          </p>
        )}

        {!isLoading && !raffleIdRef.current && (
          <div className="mb-6 rounded-lg border border-[#f5a623]/10 bg-[#2b1a12] p-4 text-sm text-[#f5a623]">
            No hay sorteo activo este mes. Las votaciones están deshabilitadas hasta que se cargue un sorteo.
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Array.isArray(rewards) ? rewards : []).map((reward) => {
            const voteCount = (safeVotes[reward._id] || safeVotes[reward.id] || 0)
            const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
            const title = reward.name || reward.label || reward.title || 'Premio'
            const description = reward.description || reward.desc || ''
            const displayLetter = (title && title[0]) || 'R'
            const isVoteDisabled = userVoted || !raffleIdRef.current
            return (
              <Card key={reward._id || reward.id} className="p-4 flex h-auto flex-col">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f5a623] text-[#1a1208] shadow-inner shadow-[#000000]/20">
                    <span className="text-lg font-bold">{displayLetter}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-[#cccccc]">{description}</p>
                </div>
                <div className="mt-6">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#f5a623] via-[#d4891a] to-[#b8740f]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#cccccc]">
                    <span>{voteCount} votos</span>
                    <span>{pct}%</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => handleVote(reward._id)}
                    disabled={userVoted || !raffleIdRef.current}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      votedRewardId === reward._id
                        ? 'bg-green-600 text-white cursor-default'
                        : userVoted || !raffleIdRef.current
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
                    }`}
                  >
                    {votedRewardId === reward._id ? '✓ Votado' : userVoted ? 'Ya votaste' : 'Votar'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 rounded-[32px] border border-[#f5a623]/15 bg-[#2a1f0e] p-6 text-sm text-[#cccccc] shadow-xl shadow-[#f5a623]/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-white">Total de votaciones</p>
              <p className="text-sm text-[#cccccc]">Gracias por ser parte del proceso de decisiones del próximo mes.</p>
            </div>
            <div className="rounded-full bg-[#1a1208] px-4 py-2 text-sm font-semibold text-[#f5a623]">{totalVotes} votos emitidos</div>
          </div>
        </div>
      </section>
    </main>
  )
}
