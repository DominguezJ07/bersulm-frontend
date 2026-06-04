import api from '@/lib/api'
import type { Reward, Raffle, VoteEntry, ApiResponse, SorteoCurrentData, Participant } from '@/types'

export const rewardsService = {
  getCurrentRaffle: async (): Promise<ApiResponse<SorteoCurrentData>> => {
    const response = await api.get('/raffles/current')
    return response.data
  },
  getRewards: async (): Promise<ApiResponse<Reward[]>> => {
    const response = await api.get('/rewards')
    return response.data
  },
  getVotes: async (): Promise<ApiResponse<VoteEntry[]>> => {
    const response = await api.get('/raffles/votes')
    return response.data
  },
  vote: async (
    rewardId: string,
    raffleId: string,
  ): Promise<ApiResponse<unknown>> => {
    const response = await api.post('/raffles/vote', { rewardId, raffleId })
    return response.data
  },
  spin: async (raffleId: string): Promise<ApiResponse<{ winner: string }>> => {
    const response = await api.post('/raffles/spin', { raffleId })
    return response.data
  },
  getParticipants: async (raffleId: string): Promise<ApiResponse<Participant[]>> => {
    const response = await api.get(`/raffles/participants/${raffleId}`)
    return response.data
  },
  addParticipant: async (raffleId: string, name: string): Promise<ApiResponse<unknown>> => {
    const response = await api.post('/raffles/participants', { raffleId, name })
    return response.data
  },
  removeParticipant: async (raffleId: string, participantId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.delete(`/raffles/participants/${raffleId}/${participantId}`)
    return response.data
  },
}
