import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { appointmentsService } from '@/services/appointments.service'

interface UseUserAppointmentsOptions {
  limit?: number
  initialPage?: number
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

interface UseUserAppointmentsReturn {
  appointments: AppointmentItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  total: number
  hasNextPage: boolean
  hasPrevPage: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  refetch: () => void
}

export function useUserAppointments({
  limit = 20,
  initialPage = 1,
}: UseUserAppointmentsOptions = {}): UseUserAppointmentsReturn {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(
    async (targetPage: number) => {
      if (!token) {
        setAppointments([])
        setIsLoading(false)
        return
      }

      if (abortRef.current) {
        abortRef.current.abort()
      }
      abortRef.current = new AbortController()

      setIsLoading(true)
      setError(null)

      try {
        const res = await appointmentsService.getAppointments({
          page: targetPage,
          limit,
        })

        if (abortRef.current?.signal.aborted) return

        const list = (Array.isArray(res.data) ? res.data : []) as AppointmentItem[]
        setAppointments(list)
        setPage(targetPage)
        setTotalPages((res as unknown as { totalPages?: number }).totalPages ?? 1)
        setTotal((res as unknown as { total?: number }).total ?? list.length)
      } catch (err) {
        if (!abortRef.current?.signal.aborted) {
          setError('Error al cargar las reservas')
          setAppointments([])
        }
      } finally {
        if (!abortRef.current?.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [token, limit],
  )

  useEffect(() => {
    load(initialPage)
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [load, initialPage])

  const refetch = useCallback(() => {
    load(page)
  }, [load, page])

  const goToPage = useCallback(
    (target: number) => {
      if (target >= 1 && target <= totalPages) {
        load(target)
      }
    },
    [load, totalPages],
  )

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      load(page + 1)
    }
  }, [load, page, totalPages])

  const prevPage = useCallback(() => {
    if (page > 1) {
      load(page - 1)
    }
  }, [load, page])

  return {
    appointments,
    isLoading,
    error,
    page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    goToPage,
    nextPage,
    prevPage,
    refetch,
  }
}
