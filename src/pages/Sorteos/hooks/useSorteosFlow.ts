import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRaffleData } from './useRaffleData'
import { useCountdown } from './useCountdown'
import { useRaffleSocket } from './useRaffleSocket'
import { useRaffleActions } from './useRaffleActions'

export function useSorteosFlow() {
  const { user, token } = useAuth()
  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin)

  const raffleData = useRaffleData()

  const { timeLeft, resetCountdown } = useCountdown(0)

  useEffect(() => {
    resetCountdown(raffleData.serverCountdown)
  }, [raffleData.serverCountdown, resetCountdown])

  useRaffleSocket({
    onVotingEnded: () => {
      raffleData.fetchRaffleData()
      raffleData.setShowTransition(true)
      setTimeout(() => raffleData.setShowTransition(false), 4000)
    },
    onWinner: () => raffleData.fetchRaffleData(),
    onUpdated: () => raffleData.fetchRaffleData(),
  })

  const actions = useRaffleActions({
    token,
    raffleId: raffleData.raffleId,
    isAdmin,
    participants: raffleData.participants,
    participantObjects: raffleData.participantObjects,
    onVoteSuccess: (rewardId, votes) => {
      raffleData.setUserHasVoted(true)
      raffleData.setVotedRewardId(rewardId)
      raffleData.setVotes(votes)
    },
    onSpinSuccess: (phase, winnerReward, winnerId) => {
      raffleData.setPhase(phase as 'completed')
      if (winnerReward) raffleData.setWinnerReward(winnerReward)
      if (winnerId) raffleData.setWinnerId(winnerId)
    },
    onParticipantsUpdate: (objects, names) => {
      raffleData.setParticipantObjects(objects)
      raffleData.setParticipants(names)
    },
  })

  return {
    phase: raffleData.phase,
    raffleId: raffleData.raffleId,
    votes: raffleData.votes,
    userHasVoted: raffleData.userHasVoted,
    votedRewardId: raffleData.votedRewardId,
    winnerReward: raffleData.winnerReward,
    participantCount: raffleData.participantCount,
    winnerId: raffleData.winnerId,
    participants: raffleData.participants,
    manualParticipants: raffleData.manualParticipants,
    timeLeft,
    isLoading: raffleData.isLoading,
    isVoting: actions.isVoting,
    isSpinning: actions.isSpinning,
    spinWinner: actions.spinWinner,
    showTransition: raffleData.showTransition,
    isAdmin,
    handleVote: actions.handleVote,
    handleSpin: actions.handleSpin,
    handleAddParticipant: actions.handleAddParticipant,
    handleRemoveParticipant: actions.handleRemoveParticipant,
    newParticipantName: actions.newParticipantName,
    setNewParticipantName: actions.setNewParticipantName,
    isAddingParticipant: actions.isAddingParticipant,
  }
}
