export interface Reward {
  _id: string
  id?: string
  name: string
  label?: string
  title?: string
  description?: string
  desc?: string
  votes?: number
  voteCount?: number
  image?: string
}

export interface Raffle {
  _id: string
  id?: string
  month: string
  status: 'voting' | 'scheduled' | 'active' | 'completed'
  raffleDate: string
  winnerId?: string
  winnerReward?: string | WinnerReward
  winner?: string
  winnerName?: string
  result?: string
  participants?: string[]
  createdAt?: string
}

export interface WinnerReward {
  _id: string
  name: string
  description?: string
  icon: string
  type: string
}

export interface SorteoVoteItem {
  rewardId: string
  name: string
  icon: string
  type: string
  count: number
  percentage: number
}

export interface Participant {
  _id: string
  name: string
}

export interface SorteoCurrentData {
  raffle: Raffle
  countdown: number
  phase: 'voting' | 'active' | 'completed'
  userHasVoted?: boolean
  votes?: SorteoVoteItem[]
  winnerReward?: WinnerReward | null
  participantCount?: number
  winnerId?: string
  manualParticipants?: string[]
}

export interface VoteEntry {
  rewardId: string
  reward?: string
  rewardName?: string
  label?: string
  id?: string
  votes: number
  voteCount?: number
  count?: number
  userId?: string
  user_id?: string
}
