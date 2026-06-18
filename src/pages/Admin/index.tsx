import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  CalendarDays, TrendingUp, Clock, CheckCircle,
  Award, Scissors, ChevronRight, Users,
  RefreshCw, Star, CheckCircle2,
  XCircle, User
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { GalleryManager } from './components'
import api from '@/lib/api'

interface AppointmentStats {
  total: number
  thisMonth: number
  byStatus: {
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

interface AdminAppointment {
  _id: string
  userId: { name: string; email: string } | string
  serviceId: { name: string } | string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

interface PendingReview {
  _id: string
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-400/15 text-amber-400',
  confirmed: 'bg-blue-400/15 text-blue-400',
  completed: 'bg-green-400/15 text-green-400',
  cancelled: 'bg-red-400/15 text-red-400',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(year, month - 1, day))
}

function getClientName(
  userId: AdminAppointment['userId']
): string {
  return typeof userId === 'object' ? userId.name : 'Cliente'
}

function getServiceName(
  serviceId: AdminAppointment['serviceId']
): string {
  return typeof serviceId === 'object'
    ? serviceId.name : 'Servicio'
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-[24px] border
      border-[var(--border-color)]
      bg-[var(--bg-secondary)] p-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl
          bg-[var(--bg-tertiary)]" />
        <div className="space-y-2">
          <div className="h-8 w-16 rounded
            bg-[var(--bg-tertiary)]" />
          <div className="h-3 w-24 rounded
            bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, value, label, iconColor, isLoading,
}: {
  icon: React.ElementType
  value: number
  label: string
  iconColor: string
  isLoading?: boolean
}) {
  if (isLoading) return <StatSkeleton />
  return (
    <div className="rounded-[24px] border
      border-[var(--border-color)]
      bg-[var(--bg-secondary)] p-6
      transition hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center
          justify-center rounded-2xl
          bg-[var(--bg-tertiary)] ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold
            text-[var(--text-primary)]">{value}</p>
          <p className="text-sm
            text-[var(--text-secondary)]">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actioningReviewId, setActioningReviewId] =
    useState<string | null>(null)

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/appointments/stats')
      return res.data?.data as AppointmentStats
    },
  })

  const {
    data: appointmentsData,
    isLoading: apptLoading,
    refetch: refetchAppts,
  } = useQuery({
    queryKey: ['admin-appointments-recent'],
    queryFn: async () => {
      const res = await api.get('/appointments/all', {
        params: { page: 1, limit: 5 }
      })
      return {
        appointments: (res.data?.data ?? []) as AdminAppointment[],
        total: res.data?.total ?? 0,
      }
    },
  })

  const { data: raffleData } = useQuery({
    queryKey: ['raffle-current-admin'],
    queryFn: async () => {
      const res = await api.get('/raffles/current')
      return res.data?.data
    },
  })

  const {
    data: pendingReviews = [],
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['reviews-pending'],
    queryFn: async () => {
      const res = await api.get('/reviews/pending')
      // Cubrir todos los formatos posibles de ApiResponse
      const raw = res.data?.data
      if (Array.isArray(raw)) return raw as PendingReview[]
      if (raw?.reviews && Array.isArray(raw.reviews))
        return raw.reviews as PendingReview[]
      if (Array.isArray(res.data?.reviews))
        return res.data.reviews as PendingReview[]
      return [] as PendingReview[]
    },
  })

  const stats = statsData
  const appointments = appointmentsData?.appointments ?? []
  const totalAppointments = appointmentsData?.total ?? 0
  const raffle = raffleData
  const isLoading = statsLoading || apptLoading

  const handleRefresh = () => {
    refetchStats()
    refetchAppts()
    refetchReviews()
  }

  const handleReviewAction = useCallback(
    async (id: string, action: 'approve' | 'reject') => {
      setActioningReviewId(id)
      try {
        await api.patch(`/reviews/${id}/status`, { action })
        toast.success(
          action === 'approve'
            ? 'Reseña aprobada y publicada'
            : 'Reseña rechazada'
        )
        refetchReviews()
        queryClient.invalidateQueries({
          queryKey: ['reviews-home']
        })
      } catch {
        toast.error('Error al procesar la reseña')
      } finally {
        setActioningReviewId(null)
      }
    },
    [refetchReviews, queryClient]
  )

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]
      px-6 pb-24 pt-8 text-[var(--text-primary)]
      sm:px-8 lg:px-10">

      <Helmet>
        <title>Dashboard Admin | BERSULM</title>
      </Helmet>

      {/* HEADER */}
      <header className="mb-10 flex items-start
        justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em]
            text-gold">Panel de Control</p>
          <h1 className="mt-3 text-3xl font-semibold
            sm:text-4xl">
            Dashboard BERSULM
          </h1>
          <p className="mt-3 max-w-xl text-base
            text-[var(--text-secondary)]">
            Administra reservas, sorteos y usuarios
            desde un solo lugar.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl
            border border-[var(--border-color)]
            bg-[var(--bg-secondary)] px-4 py-2 text-sm
            text-[var(--text-secondary)] transition
            hover:border-gold hover:text-gold
            disabled:opacity-50"
        >
          <RefreshCw size={16}
            className={isLoading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </header>

      {/* ESTADÍSTICAS */}
      <section className="mb-10">
        <h2 className="mb-5 text-lg font-semibold">
          Resumen general
        </h2>
        <div className="grid grid-cols-2 gap-4
          lg:grid-cols-4">
          <StatCard
            icon={CalendarDays}
            value={stats?.total ?? 0}
            label="Total reservas"
            iconColor="text-gold"
            isLoading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            value={stats?.thisMonth ?? 0}
            label="Este mes"
            iconColor="text-blue-400"
            isLoading={isLoading}
          />
          <StatCard
            icon={Clock}
            value={stats?.byStatus?.pending ?? 0}
            label="Pendientes"
            iconColor="text-amber-400"
            isLoading={isLoading}
          />
          <StatCard
            icon={CheckCircle}
            value={stats?.byStatus?.completed ?? 0}
            label="Completadas"
            iconColor="text-green-400"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* SORTEO + ACCESOS RÁPIDOS */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">

        {/* Sorteo actual */}
        <section className="rounded-[24px] border
          border-[var(--border-color)]
          bg-[var(--bg-secondary)] p-6">
          <div className="mb-5 flex items-center
            justify-between">
            <h2 className="text-lg font-semibold">
              Sorteo actual
            </h2>
            <button
              onClick={() => navigate(ROUTES.REWARDS)}
              className="flex items-center gap-1 text-sm
                text-gold hover:underline"
            >
              Gestionar <ChevronRight size={14} />
            </button>
          </div>

          {!raffle ? (
            <div className="flex flex-col items-center
              justify-center py-8 text-center">
              <Award size={32} className="mb-3
                text-[var(--text-muted)] opacity-40" />
              <p className="text-sm text-[var(--text-muted)]">
                No hay sorteo activo
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <span className={`rounded-full px-3 py-1
                text-xs font-semibold ${
                  raffle.phase === 'voting'
                    ? 'bg-blue-400/15 text-blue-400'
                    : raffle.phase === 'active'
                      ? 'bg-amber-400/15 text-amber-400'
                      : 'bg-green-400/15 text-green-400'
                }`}>
                {raffle.phase === 'voting'
                  ? 'Votación activa'
                  : raffle.phase === 'active'
                    ? 'Sorteo activo'
                    : 'Completado'}
              </span>

              {raffle.phase === 'voting' &&
                raffle.votes?.slice(0, 3).map((vote: any) => (
                  <div key={vote.rewardId}>
                    <div className="mb-1 flex justify-between
                      text-sm">
                      <span>{vote.rewardName || vote.name}</span>
                      <span className="text-[var(--text-secondary)]">
                        {vote.voteCount || vote.count || 0} votos
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden
                      rounded-full bg-[var(--bg-tertiary)]">
                      <div
                        className="h-full rounded-full bg-gold
                          transition-all duration-500"
                        style={{ width: `${vote.percentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}

              {(raffle.phase === 'active' ||
                raffle.phase === 'completed') &&
                raffle.winnerReward && (
                <div className="rounded-2xl border
                  border-gold/20 bg-gold/5 p-4">
                  <p className="text-xs uppercase
                    tracking-[0.2em] text-gold mb-1">
                    Premio del mes
                  </p>
                  <p className="font-semibold">
                    {raffle.winnerReward.name}
                  </p>
                </div>
              )}

              {raffle.participantCount !== undefined && (
                <span className="flex items-center gap-1
                  text-sm text-[var(--text-secondary)]">
                  <Users size={14} />
                  {raffle.participantCount} participantes
                </span>
              )}
            </div>
          )}
        </section>

        {/* Accesos rápidos */}
        <section className="rounded-[24px] border
          border-[var(--border-color)]
          bg-[var(--bg-secondary)] p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Accesos rápidos
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Award,
                label: 'Gestionar Fidelidad',
                desc: 'Agregar visitas a clientes',
                action: () => navigate(ROUTES.LOYALTY),
                color: 'text-gold',
              },
              {
                icon: Scissors,
                label: 'Gestionar Servicios',
                desc: 'Crear y editar servicios',
                action: () => navigate(ROUTES.SERVICES),
                color: 'text-blue-400',
              },
              {
                icon: CalendarDays,
                label: 'Ver Sorteos',
                desc: 'Gestionar sorteo mensual',
                action: () => navigate(ROUTES.REWARDS),
                color: 'text-amber-400',
              },
            ].map(({ icon: Icon, label, desc, action, color }) => (
              <button
                key={label}
                onClick={action}
                className="flex w-full items-center gap-4
                  rounded-2xl border
                  border-[var(--border-color)]
                  bg-[var(--bg-card)] p-4 text-left
                  transition hover:border-gold/50
                  hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 shrink-0
                  items-center justify-center rounded-xl
                  bg-[var(--bg-tertiary)] ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm
                    text-[var(--text-secondary)]">
                    {desc}
                  </p>
                </div>
                <ChevronRight size={16}
                  className="text-[var(--text-muted)]
                    shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* RESERVAS RECIENTES */}
      <section className="mb-10 rounded-[24px] border
        border-[var(--border-color)]
        bg-[var(--bg-secondary)] p-6">
        <div className="mb-5 flex items-center
          justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Reservas recientes
            </h2>
            {totalAppointments > 0 && (
              <p className="text-sm
                text-[var(--text-secondary)]">
                {totalAppointments} reservas en total
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(ROUTES.RESERVAS)}
            className="flex items-center gap-1 text-sm
              text-gold hover:underline"
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>

        {apptLoading && (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="animate-pulse h-14
                rounded-xl bg-[var(--bg-tertiary)]" />
            ))}
          </div>
        )}

        {!apptLoading && appointments.length === 0 && (
          <div className="py-12 text-center">
            <CalendarDays size={32} className="mx-auto mb-3
              text-[var(--text-muted)] opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">
              No hay reservas registradas
            </p>
          </div>
        )}

        {!apptLoading && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b
                  border-[var(--border-color)] text-left">
                  <th className="pb-3 text-xs uppercase
                    tracking-[0.2em] text-gold font-semibold">
                    Cliente
                  </th>
                  <th className="pb-3 text-xs uppercase
                    tracking-[0.2em] text-gold font-semibold">
                    Servicio
                  </th>
                  <th className="pb-3 text-xs uppercase
                    tracking-[0.2em] text-gold font-semibold">
                    Fecha
                  </th>
                  <th className="pb-3 text-xs uppercase
                    tracking-[0.2em] text-gold font-semibold">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id}
                    className="border-b
                      border-[var(--border-color)]/40
                      hover:bg-[var(--bg-tertiary)]/50
                      transition">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0
                          items-center justify-center
                          rounded-full bg-gold/15
                          text-sm font-bold text-gold">
                          <User size={14} />
                        </div>
                        <p className="text-sm font-semibold">
                          {getClientName(appt.userId)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm
                      text-[var(--text-secondary)]">
                      {getServiceName(appt.serviceId)}
                    </td>
                    <td className="py-4 pr-4 text-sm
                      text-[var(--text-secondary)]">
                      {formatDate(appt.date)} {appt.time}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1
                        text-xs font-semibold
                        ${STATUS_STYLES[appt.status] ?? ''}`}>
                        {STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RESEÑAS PENDIENTES — siempre visible */}
      <section className="rounded-[24px] border
        border-[var(--border-color)]
        bg-[var(--bg-secondary)] p-6">
        <div className="mb-5 flex items-center
          justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Reseñas pendientes
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {pendingReviews.length > 0
                ? `${pendingReviews.length} reseña${pendingReviews.length !== 1 ? 's' : ''} esperando revisión`
                : 'No hay reseñas pendientes de revisión'}
            </p>
          </div>
          {pendingReviews.length > 0 && (
            <span className="rounded-full bg-amber-400/15
              px-3 py-1 text-sm font-semibold text-amber-400">
              Pendientes
            </span>
          )}
        </div>

        {pendingReviews.length === 0 ? (
          <div className="py-8 text-center">
            <Star size={28} className="mx-auto mb-3
              text-[var(--text-muted)] opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">
              Cuando los clientes dejen reseñas aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review._id}
                className="rounded-2xl border
                  border-[var(--border-color)]
                  bg-[var(--bg-card)] p-4">
                <div className="flex items-start
                  justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center
                      gap-3 mb-2">
                      <div className="flex h-8 w-8 shrink-0
                        items-center justify-center
                        rounded-full bg-gold/15
                        text-sm font-bold text-gold">
                        {review.authorName?.[0]?.toUpperCase()
                          ?? 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold
                          text-[var(--text-primary)]">
                          {review.authorName}
                        </p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12}
                              className={s <= review.rating
                                ? 'fill-gold text-gold'
                                : 'text-[var(--border-color)]'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm
                      text-[var(--text-secondary)]
                      line-clamp-2">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() =>
                        handleReviewAction(review._id, 'approve')}
                      disabled={actioningReviewId === review._id}
                      className="flex items-center gap-1.5
                        rounded-xl bg-green-500/15 px-3 py-1.5
                        text-xs font-semibold text-green-400
                        transition hover:bg-green-500/25
                        disabled:opacity-50
                        disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 size={13} />
                      Aprobar
                    </button>
                    <button
                      onClick={() =>
                        handleReviewAction(review._id, 'reject')}
                      disabled={actioningReviewId === review._id}
                      className="flex items-center gap-1.5
                        rounded-xl bg-red-500/10 px-3 py-1.5
                        text-xs font-semibold text-red-400
                        transition hover:bg-red-500/20
                        disabled:opacity-50
                        disabled:cursor-not-allowed"
                    >
                      <XCircle size={13} />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GALERÍA */}
      <div className="mt-10">
        <GalleryManager />
      </div>
    </main>
  )
}
