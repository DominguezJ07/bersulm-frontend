import api from './api'

export const rewardsService = {
  getMonthlyPrize: async () => {
    const response = await api.get('/rewards/monthly')
    return response.data
  },
  votePrize: async (vote) => {
    const response = await api.post('/rewards/vote', vote)
    return response.data
  },
}
