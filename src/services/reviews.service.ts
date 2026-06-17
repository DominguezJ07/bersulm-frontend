import api from '@/lib/api'

export interface ReviewItem {
  _id: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  authorName: string
  authorAvatar?: string | null
  appointmentId?: string | null
  createdAt: string
}

export const reviewsService = {
  getApproved: async (params?: {
    limit?: number
    skip?: number
  }) => {
    const response = await api.get('/reviews', { params })
    return response.data
  },

  getPending: async () => {
    const response = await api.get('/reviews/pending')
    return response.data
  },

  create: async (data: {
    appointmentId?: string
    rating: number
    comment: string
  }) => {
    const response = await api.post('/reviews', data)
    return response.data
  },

  updateStatus: async (
    id: string,
    action: 'approve' | 'reject'
  ) => {
    const response = await api.patch(
      `/reviews/${id}/status`,
      { action }
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`)
    return response.data
  },
}
