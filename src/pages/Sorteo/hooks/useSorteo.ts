import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { rewardsService } from '@/services/rewards.service'
import { onSocketEvent } from '@/lib/socket'
import toast from 'react-hot-toast'
import type {
  SorteoCurrentData,
  Prize,
  Participant,
} from '@/types'

function secondsToTimeLeft(totalSeconds: number) {
  if (totalSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: Math.floor(totalSeconds % 60),
  }
}

export function useSorteo() {
  const { user } = useAuth()
  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin)

  const [phase, setPhase] = useState<'scheduled' | 'active' | 'completed' | null>(null)
  const [raffleId, setRaffleId] = useState<string | null>(null)
  const [prize, setPrize] = useState<Prize | null>(null)
  const [prizeName, setPrizeName] = useState<string | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [participantObjects, setParticipantObjects] = useState<Participant[]>([])
  const [winnerName, setWinnerName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [countdown, setCountdown] = useState(0)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const timeLeft = secondsToTimeLeft(displaySeconds)

  const [isSpinning, setIsSpinning] = useState(false)
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [showWinnerModal, setShowWinnerModal] = useState(false)

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshParticipants = useCallback(async (raffleIdValue: string) => {
    try {
      const res = await rewardsService.getParticipants(raffleIdValue)
      const data = (res.data as Participant[]) || []
      setParticipantObjects(data)
      setParticipants(data.map((p) => p.name))
    } catch {
      // silent participants fetch fail
    }
  }, [])

  const fetchRaffleData = useCallback(async () => {
    try {
      const res = await rewardsService.getCurrentRaffle()
      const data = res.data as SorteoCurrentData

      if (data.raffle) {
        setRaffleId(data.raffle._id || (data.raffle as any).id || null)
      }

      setPhase(data.phase || 'active')

      const serverSeconds = data.countdown || 0
      setCountdown(serverSeconds)

      if (data.prize) {
        setPrize(data.prize)
        setPrizeName(data.prize.name)
      }

      if (data.winnerName || data.raffle?.winnerName) {
        setWinnerName(data.winnerName || data.raffle?.winnerName || 'Ganador no identificado')
      }
    } catch {
      setPhase(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRaffleData()
  }, [fetchRaffleData])

  useEffect(() => {
    setDisplaySeconds(countdown)
  }, [countdown])

  useEffect(() => {
    if (displaySeconds <= 0) return
    const interval = setInterval(() => {
      setDisplaySeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [displaySeconds > 0])

  useEffect(() => {
    if (phase === 'active' && raffleId) {
      refreshParticipants(raffleId)
    }
  }, [phase, raffleId, refreshParticipants])

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    if (phase && phase !== 'completed') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await rewardsService.getCurrentRaffle()
          const data = res.data as SorteoCurrentData
          if (data.phase && data.phase !== phase) {
            setPhase(data.phase)
          }
          if (data.countdown !== undefined && data.countdown !== null) {
            setCountdown(data.countdown)
          }
          if (data.prize) {
            setPrize(data.prize)
            setPrizeName(data.prize.name)
          }
          if (data.winnerName || data.raffle?.winnerName) {
            setWinnerName(data.winnerName || data.raffle?.winnerName || 'Ganador no identificado')
          }
          const raffleIdValue = data.raffle?._id || (data.raffle as any)?.id
          if (raffleIdValue) {
            refreshParticipants(raffleIdValue)
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
  }, [phase, refreshParticipants])

  useEffect(() => {
    const unsubs: (() => void)[] = []

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

  const handleSpin = useCallback(async () => {
    if (!isAdmin || !raffleId) return

    setIsSpinning(true)
    try {
      await rewardsService.spin(raffleId)
      await new Promise((resolve) => setTimeout(resolve, 5200))

      const res = await rewardsService.getCurrentRaffle()
      const data = res.data as SorteoCurrentData & { raffle?: { winnerId?: string; winnerName?: string } }

      if (data.prize) {
        setPrize(data.prize)
        setPrizeName(data.prize.name)
      }

      setWinnerName(data.winnerName || data.raffle?.winnerName || 'Ganador no identificado')

      if (data.phase) setPhase(data.phase)

      setShowWinnerModal(true)
      toast.success('¡Sorteo realizado con éxito!')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al realizar el sorteo'
      toast.error(msg)
    } finally {
      setIsSpinning(false)
    }
  }, [isAdmin, raffleId])

  const handleAddParticipant = useCallback(async () => {
    if (!raffleId || !newParticipantName.trim()) return

    setIsAddingParticipant(true)
    try {
      await rewardsService.addParticipant(raffleId, newParticipantName.trim())
      setNewParticipantName('')
      await refreshParticipants(raffleId)
      toast.success('Participante agregado')
    } catch {
      toast.error('Error al agregar participante')
    } finally {
      setIsAddingParticipant(false)
    }
  }, [raffleId, newParticipantName, refreshParticipants])

  const handleRemoveParticipant = useCallback(
    async (index: number) => {
      if (!raffleId) return
      const p = participantObjects[index]
      if (!p) return

      try {
        await rewardsService.removeParticipant(raffleId, p._id)
        await refreshParticipants(raffleId)
        toast.success('Participante eliminado')
      } catch {
        toast.error('Error al eliminar participante')
      }
    },
    [raffleId, participantObjects, refreshParticipants],
  )

  const canSpin = isAdmin && phase === 'active' && displaySeconds <= 0
  const closeWinnerModal = useCallback(() => setShowWinnerModal(false), [])

  return {
    phase,
    raffleId,
    prize,
    prizeName,
    participants,
    participantObjects,
    winnerName,
    timeLeft,
    displaySeconds,
    isLoading,
    isAdmin,
    isSpinning,
    isAddingParticipant,
    canSpin,
    showWinnerModal,
    closeWinnerModal,
    newParticipantName,
    setNewParticipantName,
    handleSpin,
    handleAddParticipant,
    handleRemoveParticipant,
    fetchRaffleData,
  }
}
