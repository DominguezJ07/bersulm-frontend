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

export interface Prize {
  name: string
  description?: string
  images: string[]
}

export interface Raffle {
  _id: string
  id?: string
  month: string
  status: 'scheduled' | 'active' | 'completed'
  raffleDate: string
  winnerId?: string
  winner?: string
  winnerName?: string
  result?: string
  participants?: string[]
  prize: Prize | null
  createdAt?: string
}

export interface Participant {
  _id: string
  name: string
  userId?: string | null
  order?: number
}

export interface SorteoCurrentData {
  raffle: Raffle
  countdown: number
  phase: 'scheduled' | 'active' | 'completed'
  prize: Prize | null
  participantCount?: number
  participants?: Participant[]
  winnerId?: string
  winnerName?: string
  manualParticipants?: Participant[]
}
