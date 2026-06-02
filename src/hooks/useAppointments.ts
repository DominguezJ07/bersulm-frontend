import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsService } from '@/services/appointments.service'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import type { CreateAppointmentPayload, TimeSlot } from '@/types'

export function useAppointments() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await appointmentsService.getAppointments()
      return res.data
    },
    enabled: isAuthenticated,
  })

  const createAppointment = useMutation({
    mutationFn: async (payload: CreateAppointmentPayload) => {
      const res = await appointmentsService.createAppointment(payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Reserva confirmada con éxito')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al crear la reserva'
      toast.error(msg)
    },
  })

  return {
    appointments: appointmentsQuery.data ?? [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment,
    refetch: appointmentsQuery.refetch,
  }
}

export function useAvailableSlots(date: string | null) {
  return useQuery({
    queryKey: ['slots', date],
    queryFn: async (): Promise<TimeSlot[]> => {
      if (!date) return []
      const res = await appointmentsService.getAvailableSlots(date)
      const raw = res.data
      return Array.isArray(raw)
        ? raw.map((s) => ({
            time: s.time || s.slot || '',
            available: s.available !== false,
          }))
        : []
    },
    enabled: Boolean(date),
  })
}
