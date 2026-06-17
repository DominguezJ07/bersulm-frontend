import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { servicesService } from '@/services/services.service'
import toast from 'react-hot-toast'
import type { Service } from '@/types'

interface ServiceFormData {
  name: string
  description: string
  price: number
  durationMin: number
  icon: string
  category: 'corte' | 'barba' | 'color' | 'extra'
  order: number
}

export function useServicesAdmin() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] =
    useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const invalidateServices = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['services'] })
    queryClient.invalidateQueries({ queryKey: ['services', 'all'] })
  }, [queryClient])

  const openCreate = useCallback(() => {
    setEditingService(null)
    setIsModalOpen(true)
  }, [])

  const openEdit = useCallback((service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingService(null)
  }, [])

  const handleSubmit = useCallback(
    async (data: ServiceFormData) => {
      setIsSubmitting(true)
      try {
        if (editingService) {
          await servicesService.update(
            editingService._id || editingService.id || '',
            data
          )
          toast.success('Servicio actualizado correctamente')
        } else {
          await servicesService.create({
            ...data,
            isActive: true,
          })
          toast.success('Servicio creado correctamente')
        }
        invalidateServices()
        closeModal()
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message || 'Error al guardar el servicio'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingService, invalidateServices, closeModal]
  )

  const handleToggleActive = useCallback(
    async (service: Service) => {
      const id = service._id || service.id || ''
      setTogglingId(id)
      try {
        await servicesService.toggleActive(id, !service.isActive)
        const action = service.isActive ? 'desactivado' : 'activado'
        toast.success(`Servicio ${action} correctamente`)
        invalidateServices()
      } catch {
        toast.error('Error al cambiar el estado del servicio')
      } finally {
        setTogglingId(null)
      }
    },
    [invalidateServices]
  )

  return {
    isModalOpen,
    editingService,
    isSubmitting,
    togglingId,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleToggleActive,
  }
}
