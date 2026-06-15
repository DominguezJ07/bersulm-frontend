import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin.service'
import type {
  AppointmentStats,
  AdminAppointment,
  SorteoCurrentData
} from '@/types'

interface UseAdminDashboardReturn {
  stats: AppointmentStats | null
  recentAppointments: AdminAppointment[]
  totalAppointments: number
  raffle: SorteoCurrentData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  updateStatus: (appointmentId: string, newStatus: 'confirmed' | 'completed') => Promise<void>
  updatingId: string | null
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [recentAppointments, setRecentAppointments] = useState<AdminAppointment[]>([])
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [raffle, setRaffle] = useState<SorteoCurrentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Llamadas en paralelo — si una falla, las otras siguen
    const [statsResult, appointmentsResult, raffleResult] =
      await Promise.allSettled([
        adminService.getAppointmentStats(),
        adminService.getRecentAppointments({ page: 1, limit: 5 }),
        adminService.getCurrentRaffle(),
      ])

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value.data ?? null)
    }

    if (appointmentsResult.status === 'fulfilled') {
      const body = appointmentsResult.value as unknown as {
        data: AdminAppointment[]
        total: number
      }
      setRecentAppointments(body.data ?? [])
      setTotalAppointments(body.total ?? 0)
    }

    if (raffleResult.status === 'fulfilled') {
      setRaffle(raffleResult.value.data ?? null)
    }

    // Solo mostrar error si TODAS fallaron
    if (
      statsResult.status === 'rejected' &&
      appointmentsResult.status === 'rejected' &&
      raffleResult.status === 'rejected'
    ) {
      setError('Error al cargar el dashboard')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = useCallback(
    async (appointmentId: string, newStatus: 'confirmed' | 'completed') => {
      setUpdatingId(appointmentId)
      try {
        await adminService.updateAppointmentStatus(appointmentId, newStatus)

        // Actualizar el estado local sin recargar todo
        setRecentAppointments(prev =>
          prev.map(appt =>
            appt._id === appointmentId
              ? { ...appt, status: newStatus }
              : appt
          )
        )

        const label = newStatus === 'confirmed' ? 'confirmada' : 'completada'
        toast.success(`Reserva ${label} correctamente`)
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message || 'Error al actualizar el estado'
        toast.error(msg)
      } finally {
        setUpdatingId(null)
      }
    },
    []
  )

  return {
    stats,
    recentAppointments,
    totalAppointments,
    raffle,
    isLoading,
    error,
    refetch: load,
    updateStatus,
    updatingId,
  }
}
