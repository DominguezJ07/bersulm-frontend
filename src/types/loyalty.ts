export interface LoyaltyProgress {
  totalVisits: number
  requiredVisits: number
  rewardAvailable: boolean
  nextRewardAt?: number
  history?: Array<{
    date: string
    service: string
  }>
}
