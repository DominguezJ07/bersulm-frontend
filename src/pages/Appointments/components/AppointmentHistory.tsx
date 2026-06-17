import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppointments } from '@/hooks/useAppointments'
import { appointmentsService } from '@/services/appointments.service'
import toast from 'react-hot-toast'
import {
  CalendarDays, Clock, Scissors, XCircle,
  CheckCircle, AlertCircle, RefreshCw, X, Star
} from 'lucide-react'
import type { Appointment } from '@/types'
import { ReviewModal } from './ReviewModal'

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
  if (!dateStr) return 'Fecha pendiente'
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatPrice(price?: number | string): string {
  if (!price && price !== 0) return ''
  const num = typeof price === 'string'
    ? parseFloat(price) : price
  if (isNaN(num)) return ''
  return `$${num.toLocaleString('es-CO')}`
}

function isCancellable(appointment: Appointment): boolean {
  const status = appointment.status ?? 'pending'
  if (status === 'cancelled' || status === 'completed') return false
  if (!appointment.date || !appointment.time) return true
  const appointmentDate = new Date(
    `${appointment.date}T${appointment.time}`
  )
  return appointmentDate > new Date()
}

interface CancelModalProps {
  appointment: Appointment
  isSubmitting: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

function CancelModal({
  appointment,
  isSubmitting,
  onConfirm,
  onClose,
}: CancelModalProps) {
  const [reason, setReason] = useState('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center
        justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) =>
        e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="w-full max-w-md rounded-[24px] border
        border-red-500/20 bg-[var(--bg-secondary)] p-8
        shadow-2xl">

        {/* Header */}
        <div className="mb-6 flex items-start
          justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]
              text-red-400">
              Cancelar cita
            </p>
            <h2 className="mt-1 text-xl font-semibold
              text-[var(--text-primary)]">
              ¿Estás seguro?
            </h2>
            <p className="mt-2 text-sm
              text-[var(--text-secondary)]">
              Vas a cancelar tu cita del{' '}
              <span className="font-semibold
                text-[var(--text-primary)] capitalize">
                {formatDate(appointment.date)}
              </span>{' '}
              a las{' '}
              <span className="font-semibold
                text-[var(--text-primary)]">
                {appointment.time}
              </span>.
              Esta acción no se puede deshacer.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 shrink-0 items-center
              justify-center rounded-full border
              border-[var(--border-color)]
              text-[var(--text-secondary)] transition
              hover:border-red-400 hover:text-red-400
              disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Motivo opcional */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium
            text-[var(--text-primary)]">
            Motivo de cancelación
            <span className="ml-1 text-xs font-normal
              text-[var(--text-muted)]">(opcional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ej: Surgió algo imprevisto..."
            className="w-full rounded-xl border
              border-[var(--border-color)]
              bg-[var(--bg-card)] px-4 py-3 text-sm
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              outline-none transition focus:border-red-400
              resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border
              border-[var(--border-color)]
              bg-[var(--bg-card)] py-3 text-sm font-semibold
              text-[var(--text-secondary)] transition
              hover:border-gold
              hover:text-[var(--text-primary)]
              disabled:opacity-50"
          >
            Volver
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-red-500 py-3
              text-sm font-semibold text-white transition
              hover:bg-red-600 disabled:opacity-60
              disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center
                justify-center gap-2">
                <span className="h-4 w-4 animate-spin
                  rounded-full border-2 border-t-white
                  border-white/30" />
                Cancelando...
              </span>
            ) : (
              'Sí, cancelar cita'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppointmentHistory() {
  const [filter, setFilter] = useState<string>('all')
  const [cancellingAppointment, setCancellingAppointment] =
    useState<Appointment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewingAppointment, setReviewingAppointment] =
    useState<Appointment | null>(null)

  const { appointments, isLoading, error, refetch } =
    useAppointments()
  const queryClient = useQueryClient()

  const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ]

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filter)

  const handleCancelClick = useCallback(
    (appointment: Appointment) => {
      setCancellingAppointment(appointment)
    }, []
  )

  const handleCancelConfirm = useCallback(
    async (reason: string) => {
      if (!cancellingAppointment) return
      setIsSubmitting(true)
      try {
        await appointmentsService.cancelAppointment(
          cancellingAppointment._id,
          reason
        )
        toast.success('Cita cancelada correctamente')
        queryClient.invalidateQueries({
          queryKey: ['appointments']
        })
        setCancellingAppointment(null)
      } catch (err: unknown) {
        const msg =
          (err as {
            response?: { data?: { message?: string } }
          })?.response?.data?.message
          || 'No se pudo cancelar la cita'
        toast.error(msg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [cancellingAppointment, queryClient]
  )

  const handleCancelClose = useCallback(() => {
    if (!isSubmitting) setCancellingAppointment(null)
  }, [isSubmitting])

  return (
    <>
      {cancellingAppointment && (
        <CancelModal
          appointment={cancellingAppointment}
          isSubmitting={isSubmitting}
          onConfirm={handleCancelConfirm}
          onClose={handleCancelClose}
        />
      )}

      {reviewingAppointment && (
        <ReviewModal
          appointment={reviewingAppointment}
          onClose={() => setReviewingAppointment(null)}
          onSuccess={() => setReviewingAppointment(null)}
        />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em]
              text-gold">
              Historial
            </p>
            <h2 className="mt-2 text-2xl font-semibold
              text-[var(--text-primary)]">
              Mis citas
              {appointments.length > 0 && (
                <span className="ml-2 text-base font-normal
                  text-[var(--text-secondary)]">
                  ({appointments.length} en total)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl
              border border-[var(--border-color)]
              bg-[var(--bg-secondary)] px-4 py-2 text-sm
              text-[var(--text-secondary)] transition
              hover:border-gold hover:text-gold"
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
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm
                font-semibold transition ${
                  filter === f.key
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse
                rounded-[24px] border
                border-[var(--border-color)]
                bg-[var(--bg-secondary)] p-6">
                <div className="flex items-center
                  justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded
                      bg-[var(--bg-tertiary)]" />
                    <div className="h-6 w-48 rounded
                      bg-[var(--bg-tertiary)]" />
                  </div>
                  <div className="h-8 w-24 rounded-full
                    bg-[var(--bg-tertiary)]" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 rounded-xl
                      bg-[var(--bg-tertiary)]" />
                  ))}
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
              Error al cargar tus citas. Intenta de nuevo.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm text-gold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin citas */}
        {!isLoading && !error && appointments.length === 0 && (
          <div className="rounded-[28px] border
            border-[var(--border-color)]
            bg-[var(--bg-secondary)] py-16 text-center">
            <CalendarDays size={40} className="mx-auto mb-4
              text-[var(--text-muted)] opacity-40" />
            <p className="text-lg font-semibold
              text-[var(--text-primary)]">
              Aún no tienes citas
            </p>
            <p className="mt-2 text-sm
              text-[var(--text-secondary)]">
              Crea tu primera reserva usando el formulario
              de arriba.
            </p>
          </div>
        )}

        {/* Sin resultados con filtro */}
        {!isLoading && !error && appointments.length > 0
          && filtered.length === 0 && (
          <div className="rounded-[28px] border
            border-[var(--border-color)]
            bg-[var(--bg-secondary)] py-12 text-center">
            <p className="text-[var(--text-secondary)]">
              No tienes citas con estado "
              {filters.find((f) => f.key === filter)?.label}".
            </p>
          </div>
        )}

        {/* Lista de citas */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((appointment) => {
              const status = appointment.status ?? 'pending'
              const config =
                STATUS_CONFIG[
                  status as keyof typeof STATUS_CONFIG
                ] ?? STATUS_CONFIG.pending
              const StatusIcon = config.icon
              const cancellable = isCancellable(appointment)

              return (
                <div
                  key={appointment._id}
                  className={`rounded-[24px] border
                    bg-[var(--bg-secondary)] p-6 transition
                    hover:border-gold/30 ${
                      status === 'cancelled'
                        ? 'border-red-500/20 opacity-75'
                        : 'border-[var(--border-color)]'
                    }`}
                >
                  {/* Cabecera */}
                  <div className="flex items-start
                    justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0
                        items-center justify-center rounded-2xl
                        bg-[var(--bg-tertiary)] text-gold">
                        <Scissors size={20} />
                      </div>
                      <div>
                        <p className="text-xs uppercase
                          tracking-[0.2em]
                          text-[var(--text-muted)]">
                          Servicio
                        </p>
                        <p className="font-semibold
                          text-[var(--text-primary)]">
                          {(appointment as any).serviceName
                            || appointment.service?.name
                            || 'Servicio reservado'}
                        </p>
                      </div>
                    </div>

                    {/* Badge estado */}
                    <span className={`flex shrink-0
                      items-center gap-1.5 rounded-full
                      border px-3 py-1.5 text-xs font-semibold
                      ${config.classes}`}>
                      <StatusIcon size={12} />
                      {config.label}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="mt-5 grid grid-cols-2 gap-3
                    sm:grid-cols-3">
                    <div className="rounded-2xl
                      bg-[var(--bg-card)] p-4">
                      <div className="flex items-center gap-2
                        text-xs uppercase tracking-[0.2em]
                        text-gold">
                        <CalendarDays size={12} />
                        Fecha
                      </div>
                      <p className="mt-2 text-sm font-medium
                        text-[var(--text-primary)] capitalize">
                        {formatDate(appointment.date)}
                      </p>
                    </div>

                    <div className="rounded-2xl
                      bg-[var(--bg-card)] p-4">
                      <div className="flex items-center gap-2
                        text-xs uppercase tracking-[0.2em]
                        text-gold">
                        <Clock size={12} />
                        Hora
                      </div>
                      <p className="mt-2 text-sm font-medium
                        text-[var(--text-primary)]">
                        {appointment.time || 'Por confirmar'}
                      </p>
                    </div>

                    {appointment.totalPrice !== undefined
                      && appointment.totalPrice !== null
                      && appointment.totalPrice !== 0 && (
                      <div className="rounded-2xl
                        bg-[var(--bg-card)] p-4">
                        <p className="text-xs uppercase
                          tracking-[0.2em] text-gold">
                          Total
                        </p>
                        <p className="mt-2 text-sm font-bold
                          text-gold">
                          {formatPrice(appointment.totalPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  {(cancellable || status === 'completed') && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border-color)] pt-4">
                      {cancellable && (
                        <button
                          onClick={() =>
                            handleCancelClick(appointment)}
                          className="flex items-center gap-2
                            rounded-xl border border-red-500/20
                            bg-red-500/10 px-4 py-2.5 text-sm
                            font-semibold text-red-400 transition
                            hover:bg-red-500/20
                            hover:border-red-500/40"
                        >
                          <XCircle size={16} />
                          Cancelar cita
                        </button>
                      )}
                      {status === 'completed' && (
                        <button
                          onClick={() =>
                            setReviewingAppointment(appointment)}
                          className="flex items-center gap-2 rounded-xl
                            border border-gold/20 bg-gold/10 px-4 py-2.5
                            text-sm font-semibold text-gold transition
                            hover:bg-gold/20 hover:border-gold/40"
                        >
                          <Star size={16} />
                          Dejar reseña
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
