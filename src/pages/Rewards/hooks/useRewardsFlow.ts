import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { rewardsService } from '@/services/rewards.service'
import { calculateRemainingTime, getMonthEnd, truncateName } from '@/lib/format'
import type { Reward, Raffle, VoteEntry } from '@/types'

const defaultParticipants = ['Daniel', 'Nico', 'Fe', 'Ca', 'San', 'M', 'Di', 'J']
const wheelColors = ['#f5a623', '#d4891a', '#b8740f']
const VOTE_STORAGE_KEY = 'bersulm_voted_reward'

function loadCachedVote(): { rewardId: string } | null {
  try {
    const raw = localStorage.getItem(VOTE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCachedVote(rewardId: string) {
  try {
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify({ rewardId }))
  } catch { /* noop */ }
}

function clearCachedVote() {
  try {
    localStorage.removeItem(VOTE_STORAGE_KEY)
  } catch { /* noop */ }
}

export function useRewardsFlow() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const raffleIdRef = useRef<string | null>(null)
  const [remaining, setRemaining] = useState(() => calculateRemainingTime(getMonthEnd()))
  const [currentDate, setCurrentDate] = useState(new Date())
  const [drawState, setDrawState] = useState({ isSpinning: false, winner: null as string | null })
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userHasVoted, setUserHasVoted] = useState(() => loadCachedVote() !== null)
  const [votedRewardId, setVotedRewardId] = useState<string | null>(() => {
    const cached = loadCachedVote()
    return cached?.rewardId ?? null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSpinLoading, setIsSpinLoading] = useState(false)
  const [votePercentages, setVotePercentages] = useState<Map<string, number>>(new Map())

  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin)
  const isLastDayOfMonth = useMemo(
    () => currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(),
    [currentDate],
  )

  const totalVotes = useMemo(
    () => rewards.reduce((sum, r) => sum + (Number(r.votes) || Number(r.voteCount) || 0), 0),
    [rewards],
  )

  const wheelRewardsData = useMemo(() => {
    return rewards.map((r) => {
      const rewardId = String(r._id || r.id || '')
      const votes = Number(r.votes) || Number(r.voteCount) || 0
      const pct = votePercentages.get(rewardId)
        ?? (totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0)
      return {
        id: rewardId,
        name: r.name || r.label || r.title || 'Premio',
        votes,
        pct,
      }
    })
  }, [rewards, totalVotes, votePercentages])

  const currentPrize = useMemo(() => {
    if (wheelRewardsData.length === 0) return ''
    return wheelRewardsData.reduce((a, b) => (a.votes > b.votes ? a : b)).name
  }, [wheelRewardsData])

  const wheelMode: 'rewards' | 'participants' = useMemo(() => {
    if (raffle?.status === 'voting') return 'rewards'
    return 'participants'
  }, [raffle?.status])

  const getWheelParticipants = useCallback(() => {
    if (raffle?.participants && Array.isArray(raffle.participants) && raffle.participants.length > 0) {
      return raffle.participants.slice(0, 8).map((p) => truncateName(p, 8))
    }
    return defaultParticipants
  }, [raffle])

  const normalizeVotes = useCallback((allVotes: VoteEntry[]) => {
    const counts: Record<string, number> = {}
    allVotes.forEach((v) => {
      const id = String(v.rewardId || v.reward || '')
      if (!id) return
      counts[id] = (counts[id] || 0) + 1
    })
    return counts
  }, [])

  const loadRaffle = useCallback(async () => {
    setIsLoading(true)
    try {
      const raffleRes = await rewardsService.getCurrentRaffle()
      const raffleData = (raffleRes.data as { raffle: Raffle }).raffle
      if (raffleData) {
        setRaffle(raffleData)
        raffleIdRef.current = raffleData._id || raffleData.id || null
        if (raffleData.status === 'completed' && (raffleData.winner || raffleData.winnerName || raffleData.result)) {
          setDrawState({
            isSpinning: false,
            winner: raffleData.winner || raffleData.winnerName || raffleData.result || null,
          })
        }
      }

      const rewardsRes = await rewardsService.getRewards()
      const rewardsData = (rewardsRes.data as Reward[]) || []
      setRewards(rewardsData)

      // Los votos agregados ya vienen en la respuesta de getCurrentRaffle
      // en el campo data.votes con { rewardId, name, count, percentage }
      const aggregatedVotes = (raffleRes.data as {
        votes?: Array<{
          rewardId: string
          name: string
          count: number
          percentage: number
        }>
        userHasVoted?: boolean
      })

      if (aggregatedVotes.votes && aggregatedVotes.votes.length > 0) {
        // Crear mapa de rewardId → { count, percentage }
        const voteMap = new Map(
          aggregatedVotes.votes.map(v => [v.rewardId, v])
        )

        setRewards((prev) =>
          prev.map((r) => {
            const rewardId = String(r._id || r.id || '')
            const voteData = voteMap.get(rewardId)
            return {
              ...r,
              votes: voteData?.count ?? 0,
              voteCount: voteData?.count ?? 0,
            }
          })
        )

        const percentageMap = new Map(
          aggregatedVotes.votes.map(v => [v.rewardId, v.percentage])
        )
        setVotePercentages(percentageMap)
      }

      // userHasVoted ya viene de getCurrentRaffle
      if (aggregatedVotes.userHasVoted !== undefined) {
        if (aggregatedVotes.userHasVoted) {
          setUserHasVoted(true)
          // El votedRewardId se mantiene desde localStorage
          const cached = loadCachedVote()
          if (cached) setVotedRewardId(cached.rewardId)
        } else {
          clearCachedVote()
          setUserHasVoted(false)
          setVotedRewardId(null)
        }
      }
    } catch {
      // No raffle active
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRaffle()
    const interval = window.setInterval(() => {
      setRemaining(calculateRemainingTime(getMonthEnd()))
      setCurrentDate(new Date())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [loadRaffle])

  const handleVote = useCallback(
    async (rewardId: string) => {
      const currentRaffleId = raffleIdRef.current
      if (!currentRaffleId) return

      if (!token) {
        navigate('/login')
        return
      }

      try {
        await rewardsService.vote(rewardId, currentRaffleId)
        saveCachedVote(rewardId)
        setUserHasVoted(true)
        setVotedRewardId(rewardId)

        const votesRes = await rewardsService.getVotes()
        const allVotes = (votesRes.data as VoteEntry[]) || []
        const voteCounts = normalizeVotes(allVotes)
        setRewards((prev) =>
          prev.map((r) => ({
            ...r,
            votes: voteCounts[String(r._id || r.id)] ?? (Number(r.votes) || Number(r.voteCount) || 0),
          })),
        )
      } catch {
        // Vote error handled silently
      }
    },
    [token, navigate, normalizeVotes],
  )

  const handleStartDraw = useCallback(async () => {
    const raffleId = raffle?._id || raffle?.id
    if (!isAdmin || !isLastDayOfMonth || drawState.isSpinning || raffle?.status === 'completed' || !raffleId) {
      return
    }

    setIsSpinLoading(true)
    setDrawState({ isSpinning: true, winner: null })

    try {
      await rewardsService.spin(raffleId)
      const participants = getWheelParticipants()
      const finalWinner = participants[Math.floor(Math.random() * participants.length)]

      setTimeout(() => {
        setDrawState({ isSpinning: false, winner: finalWinner })
        setIsSpinLoading(false)
      }, 5200)
    } catch {
      setDrawState({ isSpinning: false, winner: null })
      setIsSpinLoading(false)
    }
  }, [raffle, isAdmin, isLastDayOfMonth, drawState.isSpinning, getWheelParticipants])

  return {
    raffle,
    remaining,
    drawState,
    rewards,
    userHasVoted,
    votedRewardId,
    isLoading,
    isSpinLoading,
    isAdmin,
    isLastDayOfMonth,
    totalVotes,
    wheelRewardsData,
    currentPrize,
    wheelMode,
    getWheelParticipants,
    wheelColors,
    handleVote,
    handleStartDraw,
  }
}
