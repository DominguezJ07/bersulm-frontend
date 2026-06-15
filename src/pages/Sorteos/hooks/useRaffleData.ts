import { useState, useEffect, useRef, useCallback } from 'react'
import { rewardsService } from '@/services/rewards.service'
import type { SorteoCurrentData, SorteoVoteItem, WinnerReward, Participant } from '@/types'

export function useRaffleData() {
  const [phase, setPhase] = useState<'voting' | 'active' | 'completed' | null>(null)
  const [raffleId, setRaffleId] = useState<string | null>(null)
  const [votes, setVotes] = useState<SorteoVoteItem[]>([])
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [votedRewardId, setVotedRewardId] = useState<string | null>(() => {
    return localStorage.getItem('bersulm_voted_reward')
  })
  const [winnerReward, setWinnerReward] = useState<WinnerReward | null>(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [participantObjects, setParticipantObjects] = useState<Participant[]>([])
  const [manualParticipants, setManualParticipants] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTransition, setShowTransition] = useState(false)
  const [serverCountdown, setServerCountdown] = useState(0)

  const prevPhaseRef = useRef<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchRaffleData = useCallback(async () => {
    try {
      const res = await rewardsService.getCurrentRaffle()
      const data = res.data as SorteoCurrentData

      if (data.raffle) {
        setRaffleId(data.raffle._id || data.raffle.id || null)
        setParticipants(data.raffle.participants || [])
      }

      setPhase(data.phase || 'voting')
      setServerCountdown(data.countdown || 0)

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
  }, [fetchRaffleData])

  useEffect(() => {
    if (prevPhaseRef.current && prevPhaseRef.current === 'voting' && phase === 'active') {
      setShowTransition(true)
      fetchRaffleData()
      setTimeout(() => setShowTransition(false), 4000)
    }
    prevPhaseRef.current = phase
  }, [phase, fetchRaffleData])

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
    participantObjects,
    manualParticipants,
    isLoading,
    showTransition,
    serverCountdown,
    setPhase,
    setVotes,
    setUserHasVoted,
    setVotedRewardId,
    setWinnerReward,
    setWinnerId,
    setParticipants,
    setParticipantObjects,
    setManualParticipants,
    setShowTransition,
    fetchRaffleData,
  }
}
