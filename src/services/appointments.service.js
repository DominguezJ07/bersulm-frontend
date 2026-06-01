import api from './api'

export const appointmentsService = {
  getAppointments: async () => {
    const response = await api.get('/appointments')
    return response.data
  },
  createAppointment: async (appointment) => {
    const response = await api.post('/appointments', appointment)
    return response.data
  },
  getAvailableSlots: async (serviceId, date) => {
    const response = await api.get(`/appointments/slots`, {
      params: { serviceId, date },
    })
    return response.data
  },
}
