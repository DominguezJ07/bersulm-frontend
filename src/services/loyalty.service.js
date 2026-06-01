import api from './api'

export const loyaltyService = {
  getProgress: async () => {
    const response = await api.get('/loyalty/progress')
    return response.data
  },
  redeemReward: async () => {
    const response = await api.post('/loyalty/redeem')
    return response.data
  },
}
