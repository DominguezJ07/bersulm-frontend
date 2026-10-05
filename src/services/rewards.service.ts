import api from '@/lib/api'
import type { Reward, Raffle, ApiResponse, SorteoCurrentData, Participant } from '@/types'

export const rewardsService = {
  getCurrentRaffle: async (): Promise<ApiResponse<SorteoCurrentData>> => {
    const response = await api.get('/raffles/current')
    return response.data
  },
  getHistory: async (page: number, limit: number): Promise<ApiResponse<unknown>> => {
    const response = await api.get('/raffles/history', { params: { page, limit } })
    return response.data
  },
  getAllRaffles: async (page = 1, limit = 20): Promise<ApiResponse<{ raffles: Raffle[]; total: number; totalPages: number }>> => {
    const response = await api.get('/raffles/admin/all', { params: { page, limit } })
    return response.data
  },
  updatePrize: async (raffleId: string, formData: FormData): Promise<ApiResponse<Raffle>> => {
    const response = await api.put(`/raffles/${raffleId}/prize`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  deleteRaffle: async (raffleId: string): Promise<void> => {
    await api.delete(`/raffles/${raffleId}`)
  },
  getRewards: async (): Promise<ApiResponse<Reward[]>> => {
    const response = await api.get('/rewards')
    return response.data
  },
  createPrize: async (formData: FormData): Promise<ApiResponse<Raffle>> => {
    const response = await api.post('/raffles/create-monthly', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  spin: async (raffleId: string): Promise<ApiResponse<{ winner: string }>> => {
    const response = await api.post('/raffles/spin', { raffleId })
    return response.data
  },
  closeMonth: async (): Promise<ApiResponse<unknown>> => {
    const response = await api.post('/raffles/close-month')
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

  updateDeadline: async (raffleId: string, durationMinutes: number): Promise<ApiResponse<unknown>> => {
    const response = await api.patch(`/raffles/${raffleId}/deadline`, { durationMinutes })
    return response.data
  },
}
