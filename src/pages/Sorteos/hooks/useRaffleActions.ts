import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { rewardsService } from '@/services/rewards.service'
import toast from 'react-hot-toast'
import type { SorteoCurrentData, SorteoVoteItem, WinnerReward, Participant } from '@/types'

interface UseRaffleActionsParams {
  token: string | null
  raffleId: string | null
  isAdmin: boolean
  participants: string[]
  participantObjects: Participant[]
  onVoteSuccess: (rewardId: string, votes: SorteoVoteItem[]) => void
  onSpinSuccess: (phase: string, winnerReward: WinnerReward | null, winnerId: string | null) => void
  onParticipantsUpdate: (objects: Participant[], names: string[]) => void
}

export function useRaffleActions({
  token,
  raffleId,
  isAdmin,
  participants,
  participantObjects,
  onVoteSuccess,
  onSpinSuccess,
  onParticipantsUpdate,
}: UseRaffleActionsParams) {
  const navigate = useNavigate()

  const [isVoting, setIsVoting] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinWinner, setSpinWinner] = useState<string | null>(null)
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')

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
        toast.success('¡Voto registrado correctamente!')

        const res = await rewardsService.getCurrentRaffle()
        const data = res.data as SorteoCurrentData
        if (data.votes) {
          localStorage.setItem('bersulm_voted_reward', rewardId)
          onVoteSuccess(rewardId, data.votes)
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 409) {
          toast.error('Ya votaste este mes')
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
    [token, navigate, raffleId, onVoteSuccess],
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
        onSpinSuccess('completed', data.winnerReward || null, data.winnerId || null)
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
  }, [isAdmin, raffleId, participants, onSpinSuccess])

  const handleAddParticipant = useCallback(async () => {
    if (!raffleId || !newParticipantName.trim()) return

    setIsAddingParticipant(true)
    try {
      await rewardsService.addParticipant(raffleId, newParticipantName.trim())
      setNewParticipantName('')
      const res = await rewardsService.getParticipants(raffleId)
      const data = (res.data as Participant[]) || []
      onParticipantsUpdate(data, data.map((p) => p.name))
      toast.success('Participante agregado')
    } catch {
      toast.error('Error al agregar participante')
    } finally {
      setIsAddingParticipant(false)
    }
  }, [raffleId, newParticipantName, onParticipantsUpdate])

  const handleRemoveParticipant = useCallback(async (index: number) => {
    if (!raffleId) return
    const p = participantObjects[index]
    if (!p) return

    try {
      await rewardsService.removeParticipant(raffleId, p._id)
      const res = await rewardsService.getParticipants(raffleId)
      const data = (res.data as Participant[]) || []
      onParticipantsUpdate(data, data.map((p2) => p2.name))
      toast.success('Participante eliminado')
    } catch {
      toast.error('Error al eliminar participante')
    }
  }, [raffleId, participantObjects, onParticipantsUpdate])

  return {
    isVoting,
    isSpinning,
    spinWinner,
    isAddingParticipant,
    newParticipantName,
    setNewParticipantName,
    handleVote,
    handleSpin,
    handleAddParticipant,
    handleRemoveParticipant,
  }
}
