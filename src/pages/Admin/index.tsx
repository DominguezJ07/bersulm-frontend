import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  CalendarDays, TrendingUp, Clock, CheckCircle,
  Award, Scissors, Image, RefreshCw, AlertCircle,
  ChevronRight, Users
} from 'lucide-react'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import { ROUTES } from '@/constants/routes'
import type { AdminAppointment, AppointmentStats } from '@/types'

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-[var(--bg-tertiary)]" />
        <div className="space-y-2">
          <div className="h-8 w-16 rounded bg-[var(--bg-tertiary)]" />
          <div className="h-3 w-24 rounded bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    </div>
  )
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold
      ${STATUS_STYLES[status] ?? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

interface StatCardProps {
  icon: React.ElementType
  value: number | string
  label: string
  iconColor: string
  isLoading?: boolean
}
function StatCard({ icon: Icon, value, label, iconColor, isLoading }: StatCardProps) {
  if (isLoading) return <StatSkeleton />
  return (
    <div className="rounded-[24px] border border-[var(--border-color)]
      bg-[var(--bg-secondary)] p-6 transition hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center
          rounded-2xl bg-[var(--bg-tertiary)] ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {value}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const {
    stats,
    recentAppointments,
    totalAppointments,
    raffle,
    isLoading,
    error,
    refetch,
    updateStatus,
    updatingId,
  } = useAdminDashboard()

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6
      pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">

      <Helmet>
        <title>Admin Dashboard | BERSULM</title>
      </Helmet>

      {/* HEADER */}
      <header className="mb-10 flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold">
            Panel de Control
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Dashboard BERSULM
          </h1>
          <p className="mt-3 max-w-xl text-base text-[var(--text-secondary)]">
            Administra reservas, sorteos y usuarios desde un solo lugar.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border
            border-[var(--border-color)] bg-[var(--bg-secondary)]
            px-4 py-2 text-sm text-[var(--text-secondary)]
            transition hover:border-gold hover:text-gold
            disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </header>

      {/* ERROR GLOBAL */}
      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl
          border border-red-500/30 bg-red-500/10 px-5 py-4">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* SECCIÓN 1 — ESTADÍSTICAS */}
      <section className="mb-10">
        <h2 className="mb-5 text-lg font-semibold text-[var(--text-primary)]">
          Resumen general
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            value={stats?.byStatus.pending ?? 0}
            label="Pendientes"
            iconColor="text-amber-400"
            isLoading={isLoading}
          />
          <StatCard
            icon={CheckCircle}
            value={stats?.byStatus.completed ?? 0}
            label="Completadas"
            iconColor="text-green-400"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* SECCIÓN 2 — SORTEO ACTUAL + ACCESOS RÁPIDOS (grid 2 columnas) */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">

        {/* SORTEO ACTUAL */}
        <section className="rounded-[24px] border border-[var(--border-color)]
          bg-[var(--bg-secondary)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sorteo actual</h2>
            <button
              onClick={() => navigate(ROUTES.REWARDS)}
              className="flex items-center gap-1 text-sm text-gold
                hover:underline"
            >
              Gestionar <ChevronRight size={14} />
            </button>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-10
                  rounded-xl bg-[var(--bg-tertiary)]" />
              ))}
            </div>
          )}

          {!isLoading && !raffle && (
            <div className="flex flex-col items-center justify-center
              py-8 text-center">
              <Award size={32} className="mb-3 text-[var(--text-muted)]
                opacity-40" />
              <p className="text-sm text-[var(--text-muted)]">
                No hay sorteo activo
              </p>
            </div>
          )}

          {!isLoading && raffle && (
            <div className="space-y-4">
              {/* Badge de fase */}
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs
                  font-semibold ${
                    raffle.phase === 'voting'
                      ? 'bg-blue-400/15 text-blue-400'
                      : raffle.phase === 'active'
                        ? 'bg-amber-400/15 text-amber-400'
                        : 'bg-green-400/15 text-green-400'
                  }`}>
                  {raffle.phase === 'voting' ? 'Votación activa'
                    : raffle.phase === 'active' ? 'Sorteo activo'
                    : 'Completado'}
                </span>
                {raffle.participantCount !== undefined && (
                  <span className="flex items-center gap-1 text-sm
                    text-[var(--text-secondary)]">
                    <Users size={14} />
                    {raffle.participantCount} participantes
                  </span>
                )}
              </div>

              {/* Votos en fase voting */}
              {raffle.phase === 'voting' && raffle.votes &&
                raffle.votes.length > 0 && (
                <div className="space-y-2">
                  {raffle.votes.slice(0, 3).map((vote) => (
                    <div key={vote.rewardId}>
                      <div className="mb-1 flex items-center
                        justify-between text-sm">
                        <span className="text-[var(--text-primary)]">
                          {vote.name}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {vote.count} votos
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full
                        bg-[var(--bg-tertiary)]">
                        <div
                          className="h-full rounded-full bg-gold
                            transition-all duration-500"
                          style={{ width: `${vote.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Premio ganador en fase active/completed */}
              {(raffle.phase === 'active' || raffle.phase === 'completed')
                && raffle.winnerReward && (
                <div className="rounded-2xl border border-gold/20
                  bg-gold/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em]
                    text-gold mb-1">Premio del mes</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {raffle.winnerReward.name}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ACCESOS RÁPIDOS */}
        <section className="rounded-[24px] border border-[var(--border-color)]
          bg-[var(--bg-secondary)] p-6">
          <h2 className="mb-5 text-lg font-semibold">Accesos rápidos</h2>
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
                className="flex w-full items-center gap-4 rounded-2xl
                  border border-[var(--border-color)] bg-[var(--bg-card)]
                  p-4 text-left transition hover:border-gold/50
                  hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center
                  justify-center rounded-xl bg-[var(--bg-tertiary)]
                  ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {label}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {desc}
                  </p>
                </div>
                <ChevronRight size={16}
                  className="text-[var(--text-muted)] shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* SECCIÓN 3 — ÚLTIMAS RESERVAS */}
      <section className="rounded-[24px] border border-[var(--border-color)]
        bg-[var(--bg-secondary)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Reservas recientes</h2>
            {totalAppointments > 0 && (
              <p className="text-sm text-[var(--text-secondary)]">
                {totalAppointments} reservas en total
              </p>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse h-14
                rounded-xl bg-[var(--bg-tertiary)]" />
            ))}
          </div>
        )}

        {!isLoading && recentAppointments.length === 0 && (
          <div className="py-12 text-center">
            <CalendarDays size={32} className="mx-auto mb-3
              text-[var(--text-muted)] opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">
              No hay reservas registradas
            </p>
          </div>
        )}

        {!isLoading && recentAppointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-[var(--border-color)]
                  text-left">
                  <th className="pb-3 text-xs uppercase tracking-[0.2em]
                    text-gold font-semibold">Cliente</th>
                  <th className="pb-3 text-xs uppercase tracking-[0.2em]
                    text-gold font-semibold">Fecha</th>
                  <th className="pb-3 text-xs uppercase tracking-[0.2em]
                    text-gold font-semibold">Hora</th>
                  <th className="pb-3 text-xs uppercase tracking-[0.2em]
                    text-gold font-semibold">Estado</th>
                  <th className="pb-3 text-xs uppercase tracking-[0.2em]
                    text-gold font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appt) => {
                  const clientName = typeof appt.userId === 'object'
                    ? appt.userId.name
                    : 'Usuario'
                  const clientEmail = typeof appt.userId === 'object'
                    ? appt.userId.email
                    : ''
                  return (
                    <tr
                      key={appt._id}
                      className="border-b border-[var(--border-color)]/40
                        transition hover:bg-[var(--bg-tertiary)]/50"
                    >
                      <td className="py-4 pr-4">
                        <p className="text-sm font-semibold
                          text-[var(--text-primary)]">
                          {clientName}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {clientEmail}
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-sm
                        text-[var(--text-secondary)]">
                        {appt.date}
                      </td>
                      <td className="py-4 pr-4 text-sm
                        text-[var(--text-secondary)]">
                        {appt.time}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-4">
                        {appt.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(appt._id, 'confirmed')}
                            disabled={updatingId === appt._id}
                            className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs
                              font-semibold text-blue-400 transition
                              hover:bg-blue-500/25 disabled:opacity-50
                              disabled:cursor-not-allowed"
                          >
                            {updatingId === appt._id ? (
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 animate-spin rounded-full
                                  border-2 border-t-blue-400 border-blue-400/30" />
                                Confirmando...
                              </span>
                            ) : (
                              'Confirmar'
                            )}
                          </button>
                        )}

                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appt._id, 'completed')}
                            disabled={updatingId === appt._id}
                            className="rounded-lg bg-green-500/15 px-3 py-1.5 text-xs
                              font-semibold text-green-400 transition
                              hover:bg-green-500/25 disabled:opacity-50
                              disabled:cursor-not-allowed"
                          >
                            {updatingId === appt._id ? (
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 animate-spin rounded-full
                                  border-2 border-t-green-400 border-green-400/30" />
                                Completando...
                              </span>
                            ) : (
                              'Completar'
                            )}
                          </button>
                        )}

                        {(appt.status === 'completed' || appt.status === 'cancelled') && (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
