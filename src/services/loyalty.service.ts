import api from '@/lib/api'
import type { LoyaltyProgress, ApiResponse } from '@/types'

export const loyaltyService = {
  getProgress: async (): Promise<ApiResponse<LoyaltyProgress>> => {
    const response = await api.get('/loyalty/progress')
    return response.data
  },
  redeemReward: async (): Promise<ApiResponse<unknown>> => {
    const response = await api.post('/loyalty/redeem')
    return response.data
  },
}
