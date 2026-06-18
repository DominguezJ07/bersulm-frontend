import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface GalleryItem {
  _id: string
  imageUrl: string
  title: string
  category: 'todos' | 'cortes' | 'barba'
  isActive: boolean
  order: number
  uploadedBy?: string
  createdAt?: string
}

export const galleryService = {
  getGallery: async (category?: string): Promise<any> => {
    const response = await api.get('/gallery', {
      params: category && category !== 'todos'
        ? { category }
        : undefined
    })
    return response.data
  },

  createItem: async (data: {
    imageUrl: string
    title: string
    category: 'todos' | 'cortes' | 'barba'
    isActive?: boolean
    order?: number
  }): Promise<any> => {
    const response = await api.post('/gallery', data)
    return response.data
  },

  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/gallery/${id}`)
  },
}
