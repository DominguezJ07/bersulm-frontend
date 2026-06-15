import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { appointmentsService } from '@/services/appointments.service'

interface UseUserAppointmentsOptions {
  limit?: number
}

interface AppointmentItem {
  _id?: string
  id?: string
  status?: string
  state?: string
  service?: string
  serviceName?: string
  title?: string
  date?: string
  schedule?: string
  datetime?: string
  time?: string
  hour?: string
}

export function useUserAppointments({ limit = 3 }: UseUserAppointmentsOptions = {}) {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async (signal: AbortSignal) => {
    if (!token) {
      setAppointments([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await appointmentsService.getAppointments()
      if (signal.aborted) return
      const list = (Array.isArray(res.data) ? res.data.slice(0, limit) : []) as AppointmentItem[]
      setAppointments(list)
    } catch (err) {
      if (!signal.aborted) {
        setError('Error al cargar las reservas')
        setAppointments([])
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [token, limit])

  useEffect(() => {
    const controller = new AbortController()
    loadAppointments(controller.signal)
    return () => controller.abort()
  }, [loadAppointments])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    loadAppointments(controller.signal)
  }, [loadAppointments])

  return { appointments, isLoading, error, refetch }
}
