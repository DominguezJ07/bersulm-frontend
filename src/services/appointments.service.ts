import api from '@/lib/api'
import type {
  Appointment,
  TimeSlot,
  CreateAppointmentPayload,
  ApiResponse,
} from '@/types'

export const appointmentsService = {
  getAppointments: async (params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments/user', { params })
    return response.data
  },
  createAppointment: async (
    appointment: CreateAppointmentPayload,
  ): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/appointments', appointment)
    return response.data
  },
  getAvailableSlots: async (
    date: string,
    serviceId?: string,
  ): Promise<ApiResponse<TimeSlot[]>> => {
    const response = await api.get('/appointments/slots', {
      params: { date, serviceId },
    })
    return response.data
  },
}
