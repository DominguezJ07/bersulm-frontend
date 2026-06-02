import api from '@/lib/api'
import type { LoyaltyCard, MinigameState, MinigameRevealResult, User, ApiResponse } from '@/types'

export const loyaltyService = {
  getCard: async (): Promise<ApiResponse<LoyaltyCard>> => {
    const response = await api.get('/loyalty')
    return response.data
  },

  getMinigame: async (): Promise<ApiResponse<MinigameState>> => {
    const response = await api.get('/loyalty/minigame')
    return response.data
  },

  revealCard: async (cardIndex: number): Promise<ApiResponse<MinigameRevealResult>> => {
    const response = await api.post('/loyalty/minigame/reveal', { cardIndex })
    return response.data
  },

  searchUsers: async (q: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get(`/auth/users/search?q=${encodeURIComponent(q)}`)
    return response.data
  },

  getUserCard: async (userId: string): Promise<ApiResponse<LoyaltyCard>> => {
    const response = await api.get(`/loyalty/user/${userId}`)
    return response.data
  },

  addVisit: async (userId: string): Promise<ApiResponse<LoyaltyCard>> => {
    const response = await api.post('/loyalty/visit', { userId })
    return response.data
  },
}
