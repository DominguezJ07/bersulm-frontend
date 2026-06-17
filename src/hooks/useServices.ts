import { useQuery } from '@tanstack/react-query'
import { servicesService } from '@/services/services.service'
import type { Service } from '@/types'

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await servicesService.getAll()
      const data = res?.data ?? (res as unknown as { services: Service[] }).services
      const servicesList = Array.isArray(data) ? data : Array.isArray(res) ? res : []
      return servicesList.filter(s => s.isActive !== false)
    },
  })
}
