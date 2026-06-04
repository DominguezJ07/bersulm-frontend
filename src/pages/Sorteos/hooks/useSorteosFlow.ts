import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { rewardsService } from '@/services/rewards.service'
import { onSocketEvent } from '@/lib/socket'
import toast from 'react-hot-toast'
import type { SorteoCurrentData, SorteoVoteItem, WinnerReward, Participant } from '@/types'

function formatTimeLeft(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function useSorteosFlow() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [phase, setPhase] = useState<'voting' | 'active' | 'completed' | null>(null)
  const [raffleId, setRaffleId] = useState<string | null>(null)
  const [votes, setVotes] = useState<SorteoVoteItem[]>([])
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [votedRewardId, setVotedRewardId] = useState<string | null>(null)
  const [winnerReward, setWinnerReward] = useState<WinnerReward | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [participantObjects, setParticipantObjects] = useState<Participant[]>([])
  const [manualParticipants, setManualParticipants] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinWinner, setSpinWinner] = useState<string | null>(null)
  const [showTransition, setShowTransition] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)

  const prevPhaseRef = useRef<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const serverCountdownRef = useRef<number>(0)

  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin)

  const fetchRaffleData = useCallback(async () => {
    try {
      const res = await rewardsService.getCurrentRaffle()
      const data = res.data as SorteoCurrentData

      if (data.raffle) {
        setRaffleId(data.raffle._id || data.raffle.id || null)
        setParticipants(data.raffle.participants || [])
      }

      setPhase(data.phase || 'voting')
      serverCountdownRef.current = data.countdown || 0
      setTimeLeft(formatTimeLeft(data.countdown || 0))

      if (data.votes) {
        setVotes(data.votes)
      }
      if (data.userHasVoted !== undefined) {
        setUserHasVoted(data.userHasVoted)
      }
      if (data.winnerReward) {
        setWinnerReward(data.winnerReward)
      }
      if (data.participantCount !== undefined) {
        setParticipantCount(data.participantCount)
      }
      if (data.winnerId) {
        setWinnerId(data.winnerId)
      }
      if (data.manualParticipants) {
        setManualParticipants(data.manualParticipants)
      }
    } catch {
      // no raffle active
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRaffleData()

    countdownIntervalRef.current = setInterval(() => {
      serverCountdownRef.current = Math.max(0, serverCountdownRef.current - 1000)
      setTimeLeft(formatTimeLeft(serverCountdownRef.current))
    }, 1000)

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [fetchRaffleData])

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    if (phase === 'voting') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await rewardsService.getCurrentRaffle()
          const data = res.data as SorteoCurrentData
          if (data.votes) setVotes(data.votes)
          if (data.manualParticipants) {
            setManualParticipants(data.manualParticipants)
          }
          if (data.phase && data.phase !== 'voting') {
            setPhase(data.phase)
          }
          if (data.userHasVoted !== undefined) {
            setUserHasVoted(data.userHasVoted)
          }
        } catch {
          // silent poll fail
        }
      }, 10000)
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [phase])

  useEffect(() => {
    if (prevPhaseRef.current && prevPhaseRef.current === 'voting' && phase === 'active') {
      setShowTransition(true)
      fetchRaffleData()
      setTimeout(() => setShowTransition(false), 4000)
    }
    prevPhaseRef.current = phase
  }, [phase, fetchRaffleData])

  useEffect(() => {
    const unsubs: (() => void)[] = []

    unsubs.push(
      onSocketEvent('raffle:voting-ended', () => {
        fetchRaffleData()
        setShowTransition(true)
        setTimeout(() => setShowTransition(false), 4000)
      }),
    )

    unsubs.push(
      onSocketEvent('raffle:winner', () => {
        fetchRaffleData()
      }),
    )

    unsubs.push(
      onSocketEvent('raffle:updated', () => {
        fetchRaffleData()
      }),
    )

    return () => unsubs.forEach((fn) => fn())
  }, [fetchRaffleData])

  const handleVote = useCallback(
    async (rewardId: string) => {
      if (!token) {
        navigate('/login')
        return
      }

      if (!raffleId) return

      setIsVoting(true)
      try {
        await rewardsService.vote(rewardId, raffleId)
        setUserHasVoted(true)
        setVotedRewardId(rewardId)
        toast.success('¡Voto registrado correctamente!')

        const res = await rewardsService.getCurrentRaffle()
        const data = res.data as SorteoCurrentData
        if (data.votes) setVotes(data.votes)
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 409) {
          toast.error('Ya votaste este mes')
          setUserHasVoted(true)
        } else if (status === 400) {
          toast.error('La votación no está activa en este momento')
        } else if (status === 404) {
          toast.error('Sorteo no encontrado')
        } else {
          toast.error('Error al registrar el voto')
        }
      } finally {
        setIsVoting(false)
      }
    },
    [token, navigate, raffleId],
  )

  const handleSpin = useCallback(async () => {
    if (!isAdmin || !raffleId) return

    setIsSpinning(true)
    setSpinWinner(null)

    try {
      await rewardsService.spin(raffleId)
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const res = await rewardsService.getCurrentRaffle()
      const data = res.data as SorteoCurrentData

      if (data.phase === 'completed') {
        setPhase('completed')
        if (data.winnerReward) setWinnerReward(data.winnerReward)
        if (data.winnerId) setWinnerId(data.winnerId)
      }

      const participantList = participants.length > 0
        ? participants
        : ['Participante 1', 'Participante 2', 'Participante 3']
      const randomWinner = participantList[Math.floor(Math.random() * participantList.length)]
      setSpinWinner(randomWinner)

      toast.success('¡Sorteo realizado con éxito!')
    } catch {
      toast.error('Error al realizar el sorteo')
    } finally {
      setTimeout(() => setIsSpinning(false), 2000)
    }
  }, [isAdmin, raffleId, participants])

  const handleAddParticipant = useCallback(async () => {
    if (!raffleId || !newParticipantName.trim()) return

    setIsAddingParticipant(true)
    try {
      await rewardsService.addParticipant(raffleId, newParticipantName.trim())
      setNewParticipantName('')
      const res = await rewardsService.getParticipants(raffleId)
      const data = (res.data as Participant[]) || []
      setParticipantObjects(data)
      setParticipants(data.map((p) => p.name))
      toast.success('Participante agregado')
    } catch {
      toast.error('Error al agregar participante')
    } finally {
      setIsAddingParticipant(false)
    }
  }, [raffleId, newParticipantName])

  const handleRemoveParticipant = useCallback(async (index: number) => {
    if (!raffleId) return
    const p = participantObjects[index]
    if (!p) return

    try {
      await rewardsService.removeParticipant(raffleId, p._id)
      const res = await rewardsService.getParticipants(raffleId)
      const data = (res.data as Participant[]) || []
      setParticipantObjects(data)
      setParticipants(data.map((p2) => p2.name))
      toast.success('Participante eliminado')
    } catch {
      toast.error('Error al eliminar participante')
    }
  }, [raffleId, participantObjects])

  useEffect(() => {
    if (phase === 'active' && raffleId) {
      rewardsService.getParticipants(raffleId).then((res) => {
        const data = (res.data as Participant[]) || []
        if (data.length > 0) {
          setParticipantObjects(data)
          setParticipants(data.map((p) => p.name))
        }
      }).catch(() => {})
    }
  }, [phase, raffleId])

  return {
    phase,
    raffleId,
    votes,
    userHasVoted,
    votedRewardId,
    winnerReward,
    participantCount,
    winnerId,
    participants,
    manualParticipants,
    timeLeft,
    isLoading,
    isVoting,
    isSpinning,
    spinWinner,
    showTransition,
    isAdmin,
    handleVote,
    handleSpin,
    handleAddParticipant,
    handleRemoveParticipant,
    newParticipantName,
    setNewParticipantName,
    isAddingParticipant,
  }
}
