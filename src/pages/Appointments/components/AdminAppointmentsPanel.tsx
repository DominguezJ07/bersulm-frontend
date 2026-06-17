import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  CalendarDays, Clock, User, Scissors,
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '@/lib/api'

interface AdminAppointment {
  _id: string
  userId: {
    _id?: string
    name: string
    email: string
    phone?: string
  } | string
  serviceId: {
    _id?: string
    name: string
    price?: number
    durationMin?: number
  } | string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalPrice?: number
  cancelReason?: string
  createdAt?: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    icon: AlertCircle,
    classes: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
  },
  confirmed: {
    label: 'Confirmada',
    icon: CheckCircle,
    classes: 'bg-blue-400/15 text-blue-400 border-blue-400/20',
  },
  completed: {
    label: 'Completada',
    icon: CheckCircle,
    classes: 'bg-green-400/15 text-green-400 border-green-400/20',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    classes: 'bg-red-400/15 text-red-400 border-red-400/20',
  },
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function getClientName(userId: AdminAppointment['userId']): string {
  if (typeof userId === 'object' && userId !== null) {
    return userId.name || userId.email || 'Cliente'
  }
  return 'Cliente'
}

function getClientEmail(userId: AdminAppointment['userId']): string {
  if (typeof userId === 'object' && userId !== null) {
    return userId.email || ''
  }
  return ''
}

function getServiceName(
  serviceId: AdminAppointment['serviceId']
): string {
  if (typeof serviceId === 'object' && serviceId !== null) {
    return serviceId.name || 'Servicio'
  }
  return 'Servicio'
}

export function AdminAppointmentsPanel() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null)
  const queryClient = useQueryClient()
  const LIMIT = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-appointments', statusFilter, page],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit: LIMIT,
      }
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await api.get('/appointments/all', { params })
      return res.data
    },
  })

  const appointments: AdminAppointment[] = data?.data ?? []
  const total: number = data?.total ?? 0
  const totalPages: number = Math.ceil(total / LIMIT) || 1

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['admin-appointments']
    })
  }, [queryClient])

  const handleConfirm = useCallback(async (id: string) => {
    setActionLoadingId(id)
    try {
      await api.patch(`/appointments/${id}/status`,
        { status: 'confirmed' })
      toast.success('Cita confirmada')
      invalidate()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Error al confirmar'
      toast.error(msg)
    } finally {
      setActionLoadingId(null)
    }
  }, [invalidate])

  const handleComplete = useCallback(async (id: string) => {
    setActionLoadingId(id)
    try {
      await api.patch(`/appointments/${id}/status`,
        { status: 'completed' })
      toast.success('Cita marcada como completada')
      invalidate()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Error al completar'
      toast.error(msg)
    } finally {
      setActionLoadingId(null)
    }
  }, [invalidate])

  const handleCancel = useCallback(async (id: string) => {
    if (!window.confirm(
      '¿Estás seguro de que quieres cancelar esta cita?'
    )) return
    setActionLoadingId(id)
    try {
      await api.patch(`/appointments/${id}/cancel-admin`,
        { reason: 'Cancelada por administrador' })
      toast.success('Cita cancelada')
      invalidate()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Error al cancelar'
      toast.error(msg)
    } finally {
      setActionLoadingId(null)
    }
  }, [invalidate])

  const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold">
            Panel Admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold
            text-[var(--text-primary)]">
            Gestión de Citas
            {total > 0 && (
              <span className="ml-2 text-base font-normal
                text-[var(--text-secondary)]">
                ({total} en total)
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border
            border-[var(--border-color)] bg-[var(--bg-secondary)]
            px-4 py-2 text-sm text-[var(--text-secondary)]
            transition hover:border-gold hover:text-gold"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setPage(1) }}
            className={`rounded-full px-4 py-2 text-sm
              font-semibold transition ${
                statusFilter === f.key
                  ? 'bg-gold text-surface-dark'
                  : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-gold hover:text-[var(--text-primary)]'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-[20px]
              border border-[var(--border-color)]
              bg-[var(--bg-secondary)] p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded
                    bg-[var(--bg-tertiary)]" />
                  <div className="h-3 w-28 rounded
                    bg-[var(--bg-tertiary)]" />
                </div>
                <div className="h-7 w-24 rounded-full
                  bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-500/20
          bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">
            Error al cargar las citas
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-gold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Sin resultados */}
      {!isLoading && !error && appointments.length === 0 && (
        <div className="rounded-[28px] border
          border-[var(--border-color)] bg-[var(--bg-secondary)]
          py-16 text-center">
          <CalendarDays size={40} className="mx-auto mb-4
            text-[var(--text-muted)] opacity-40" />
          <p className="text-[var(--text-secondary)]">
            No hay citas{statusFilter !== 'all'
              ? ` con estado "${filters.find(
                  f => f.key === statusFilter
                )?.label}"`
              : ''}.
          </p>
        </div>
      )}

      {/* Lista de citas */}
      {!isLoading && !error && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const status = appt.status ?? 'pending'
            const config =
              STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
              ?? STATUS_CONFIG.pending
            const StatusIcon = config.icon
            const isActioning = actionLoadingId === appt._id
            const clientName = getClientName(appt.userId)
            const clientEmail = getClientEmail(appt.userId)
            const serviceName = getServiceName(appt.serviceId)

            return (
              <div
                key={appt._id}
                className="rounded-[20px] border
                  border-[var(--border-color)]
                  bg-[var(--bg-secondary)] p-5 transition
                  hover:border-gold/20"
              >
                <div className="flex flex-col gap-4
                  sm:flex-row sm:items-center sm:justify-between">

                  {/* Info cliente y servicio */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0
                      items-center justify-center rounded-2xl
                      bg-gold/15 text-lg font-bold text-gold">
                      {clientName[0]?.toUpperCase() || 'C'}
                    </div>

                    <div className="min-w-0">
                      {/* Cliente */}
                      <div className="flex items-center gap-2">
                        <User size={12}
                          className="text-[var(--text-muted)]
                            shrink-0" />
                        <p className="text-sm font-semibold
                          text-[var(--text-primary)] truncate">
                          {clientName}
                        </p>
                      </div>
                      {clientEmail && (
                        <p className="text-xs
                          text-[var(--text-muted)] truncate">
                          {clientEmail}
                        </p>
                      )}

                      {/* Servicio, fecha y hora */}
                      <div className="mt-2 flex flex-wrap
                        items-center gap-3 text-xs
                        text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Scissors size={11}
                            className="text-gold" />
                          {serviceName}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11}
                            className="text-gold" />
                          {formatDate(appt.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-gold" />
                          {appt.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado y acciones */}
                  <div className="flex flex-wrap items-center
                    gap-2 sm:shrink-0">

                    {/* Badge estado */}
                    <span className={`flex items-center gap-1.5
                      rounded-full border px-3 py-1.5
                      text-xs font-semibold ${config.classes}`}>
                      <StatusIcon size={11} />
                      {config.label}
                    </span>

                    {/* Botón Confirmar (pending → confirmed) */}
                    {status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(appt._id)}
                        disabled={isActioning}
                        className="flex items-center gap-1.5
                          rounded-xl bg-blue-500/15 px-3 py-1.5
                          text-xs font-semibold text-blue-400
                          transition hover:bg-blue-500/25
                          disabled:opacity-50
                          disabled:cursor-not-allowed"
                      >
                        {isActioning ? (
                          <span className="h-3 w-3 animate-spin
                            rounded-full border-2
                            border-t-blue-400
                            border-blue-400/30" />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                        Confirmar
                      </button>
                    )}

                    {/* Botón Completar (confirmed → completed) */}
                    {status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(appt._id)}
                        disabled={isActioning}
                        className="flex items-center gap-1.5
                          rounded-xl bg-green-500/15 px-3 py-1.5
                          text-xs font-semibold text-green-400
                          transition hover:bg-green-500/25
                          disabled:opacity-50
                          disabled:cursor-not-allowed"
                      >
                        {isActioning ? (
                          <span className="h-3 w-3 animate-spin
                            rounded-full border-2
                            border-t-green-400
                            border-green-400/30" />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                        Completar
                      </button>
                    )}

                    {/* Botón Cancelar (pending o confirmed) */}
                    {(status === 'pending' ||
                      status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={isActioning}
                        className="flex items-center gap-1.5
                          rounded-xl bg-red-500/10 px-3 py-1.5
                          text-xs font-semibold text-red-400
                          transition hover:bg-red-500/20
                          disabled:opacity-50
                          disabled:cursor-not-allowed"
                      >
                        {isActioning ? (
                          <span className="h-3 w-3 animate-spin
                            rounded-full border-2
                            border-t-red-400
                            border-red-400/30" />
                        ) : (
                          <XCircle size={13} />
                        )}
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between
          border-t border-[var(--border-color)] pt-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center
                rounded-xl border border-[var(--border-color)]
                text-[var(--text-secondary)] transition
                hover:border-gold hover:text-gold
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center
                rounded-xl border border-[var(--border-color)]
                text-[var(--text-secondary)] transition
                hover:border-gold hover:text-gold
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
