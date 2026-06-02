import api from '@/lib/api'
import type { Service, ApiResponse } from '@/types'

export const servicesService = {
  getAll: async (): Promise<ApiResponse<Service[]>> => {
    const response = await api.get('/services')
    return response.data
  },
  getById: async (id: string): Promise<ApiResponse<Service>> => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },
}
