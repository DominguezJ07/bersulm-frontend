import api from './api'

export const servicesService = {
  getAll: async () => {
    const response = await api.get('/services')
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },
}
