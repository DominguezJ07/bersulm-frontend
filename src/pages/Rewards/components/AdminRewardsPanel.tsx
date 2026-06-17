import { useQuery } from '@tanstack/react-query'
import { Plus, Edit2, EyeOff, Eye, Gift } from 'lucide-react'
import api from '@/lib/api'
import { useRewardsAdmin } from '../hooks/useRewardsAdmin'
import { RewardFormModal } from './RewardFormModal'
import type { Reward } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  corte: 'Corte',
  descuento: 'Descuento',
  bebida: 'Bebida',
  tratamiento: 'Tratamiento',
  kit: 'Kit',
  perfilado: 'Perfilado',
}

export function AdminRewardsPanel() {
  const admin = useRewardsAdmin()

  const { data, isLoading } = useQuery({
    queryKey: ['rewards-admin'],
    queryFn: async () => {
      const res = await api.get('/rewards', {
        params: { includeInactive: 'true' }
      })
      const rewards = res.data?.data ?? res.data ?? []
      return Array.isArray(rewards) ? rewards : []
    },
  })

  const rewards: Reward[] = data ?? []

  return (
    <>
      <RewardFormModal
        isOpen={admin.isModalOpen}
        editingReward={admin.editingReward}
        isSubmitting={admin.isSubmitting}
        onClose={admin.closeModal}
        onSubmit={admin.handleSubmit}
      />

      <div className="mb-10 rounded-[28px] border
        border-gold/20 bg-[var(--bg-secondary)] p-6">

        {/* Header del panel */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]
              text-gold">
              Administración
            </p>
            <h2 className="mt-1 text-xl font-semibold
              text-[var(--text-primary)]">
              Gestión de Premios
              {rewards.length > 0 && (
                <span className="ml-2 text-sm font-normal
                  text-[var(--text-secondary)]">
                  ({rewards.length} premios)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={admin.openCreate}
            className="flex items-center gap-2 rounded-full
              bg-gold px-5 py-2.5 text-sm font-semibold
              text-surface-dark transition
              hover:brightness-110"
          >
            <Plus size={16} />
            Nuevo Premio
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-3
            sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse
                rounded-2xl border border-[var(--border-color)]
                bg-[var(--bg-card)] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl
                    bg-[var(--bg-tertiary)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-32 rounded
                      bg-[var(--bg-tertiary)]" />
                    <div className="h-3 w-20 rounded
                      bg-[var(--bg-tertiary)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sin premios */}
        {!isLoading && rewards.length === 0 && (
          <div className="py-10 text-center">
            <Gift size={32} className="mx-auto mb-3
              text-[var(--text-muted)] opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">
              No hay premios creados aún.
              Crea el primero con el botón de arriba.
            </p>
          </div>
        )}

        {/* Grid de premios */}
        {!isLoading && rewards.length > 0 && (
          <div className="grid gap-3
            sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const id = reward._id || reward.id || ''
              const isToggling = admin.togglingId === id

              return (
                <div
                  key={id}
                  className={`rounded-2xl border p-4
                    transition ${
                      reward.isActive
                        ? 'border-[var(--border-color)]'
                        : 'border-red-500/20 opacity-60'
                    }`}
                >
                  {/* Info del premio */}
                  <div className="mb-3 flex items-start gap-3">
                    <span className="text-2xl shrink-0">
                      {reward.icon || '🎁'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center
                        gap-2 flex-wrap">
                        <p className="text-sm font-semibold
                          text-[var(--text-primary)] truncate">
                          {reward.name}
                        </p>
                        {!reward.isActive && (
                          <span className="rounded-full
                            bg-red-500/15 px-2 py-0.5
                            text-xs font-semibold text-red-400
                            shrink-0">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-xs
                        text-[var(--text-muted)] mt-0.5">
                        {TYPE_LABELS[reward.type ?? '']
                          ?? reward.type}
                        {(reward as any).isLoyaltyReward && (
                          <span className="ml-2 text-gold">
                            · Fidelidad
                          </span>
                        )}
                      </p>
                      {reward.description && (
                        <p className="mt-1 text-xs
                          text-[var(--text-secondary)]
                          line-clamp-2">
                          {reward.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => admin.openEdit(reward)}
                      className="flex flex-1 items-center
                        justify-center gap-1.5 rounded-xl
                        border border-[var(--border-color)]
                        bg-[var(--bg-card)] py-2 text-xs
                        font-semibold text-[var(--text-secondary)]
                        transition hover:border-gold
                        hover:text-gold"
                    >
                      <Edit2 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        admin.handleToggleActive(reward)}
                      disabled={isToggling}
                      className={`flex flex-1 items-center
                        justify-center gap-1.5 rounded-xl
                        border py-2 text-xs font-semibold
                        transition disabled:opacity-50
                        disabled:cursor-not-allowed ${
                          reward.isActive
                            ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                    >
                      {isToggling ? (
                        <span className="h-3 w-3 animate-spin
                          rounded-full border-2
                          border-t-current border-current/30" />
                      ) : reward.isActive ? (
                        <><EyeOff size={12} /> Desactivar</>
                      ) : (
                        <><Eye size={12} /> Activar</>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
