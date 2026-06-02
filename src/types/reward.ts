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
  winnerReward?: string
  winner?: string
  winnerName?: string
  result?: string
  participants?: string[]
  createdAt?: string
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
