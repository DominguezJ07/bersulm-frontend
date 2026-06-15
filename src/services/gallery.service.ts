import api from '@/lib/api'
import type { ApiResponse, GalleryItem } from '@/types'

export const galleryService = {
  getGallery: async (): Promise<ApiResponse<GalleryItem[]>> => {
    const response = await api.get('/gallery')
    return response.data
  },
}
