export interface ClaimedReward {
  rewardId: string
  rewardName: string
  claimedAt: string
  usedAt: string | null
}

export interface LoyaltyCard {
  _id: string
  userId: string
  visits: number
  totalVisits: number
  status: 'active' | 'reward_pending' | 'reward_claimed'
  currentCycle: number
  rewardId: string | null
  rewardWon: string | null
  claimedRewards: ClaimedReward[]
  minigameCards: number[] | null
}

export interface MinigameState {
  cardsCount: number
  availableRewards: Array<{ rewardId: string; name: string }>
}

export interface MinigameRevealResult {
  won: boolean
  reward: { id: string; name: string } | null
  cardStatus: 'active' | 'reward_pending' | 'reward_claimed'
  currentCycle: number
}
