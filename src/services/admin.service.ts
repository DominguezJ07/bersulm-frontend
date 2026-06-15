import api from '@/lib/api'
import type { ApiResponse, SorteoCurrentData, AppointmentStats, AdminAppointment } from '@/types'

export const adminService = {
  getAppointmentStats: async (): Promise<ApiResponse<AppointmentStats>> => {
    const response = await api.get('/appointments/stats')
    return response.data
  },

  getRecentAppointments: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<AdminAppointment[]>> => {
    const response = await api.get('/appointments/all', { params })
    return response.data
  },

  getCurrentRaffle: async (): Promise<ApiResponse<SorteoCurrentData>> => {
    const response = await api.get('/raffles/current')
    return response.data
  },

  updateAppointmentStatus: async (
    appointmentId: string,
    status: 'confirmed' | 'completed'
  ): Promise<ApiResponse<AdminAppointment>> => {
    const response = await api.patch(
      `/appointments/${appointmentId}/status`,
      { status }
    )
    return response.data
  },
}
