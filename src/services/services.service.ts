import api from '@/lib/api'
import type { Service, ApiResponse } from '@/types'

interface CreateServicePayload {
  name: string
  description: string
  price: number
  durationMin: number
  icon: string
  category: 'corte' | 'barba' | 'color' | 'extra'
  isActive?: boolean
  order?: number
}

interface UpdateServicePayload extends Partial<CreateServicePayload> {}

export const servicesService = {
  getAll: async (): Promise<ApiResponse<Service[]>> => {
    const response = await api.get('/services')
    return response.data
  },
  getById: async (id: string): Promise<ApiResponse<Service>> => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },

  create: async (
    payload: CreateServicePayload
  ): Promise<ApiResponse<Service>> => {
    const response = await api.post('/services', payload)
    return response.data
  },

  update: async (
    id: string,
    payload: UpdateServicePayload
  ): Promise<ApiResponse<Service>> => {
    const response = await api.put(`/services/${id}`, payload)
    return response.data
  },

  toggleActive: async (
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<Service>> => {
    const response = await api.put(`/services/${id}`, { isActive })
    return response.data
  },
}
