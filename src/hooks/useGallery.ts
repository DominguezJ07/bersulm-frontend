import { useQuery } from '@tanstack/react-query'
import { galleryService } from '@/services/gallery.service'

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: () => galleryService.getGallery(),
    staleTime: 5 * 60 * 1000,
  })
}
