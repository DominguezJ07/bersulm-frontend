import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Reward } from '@/types'

const REWARD_TYPES = [
  { value: 'corte', label: 'Corte' },
  { value: 'descuento', label: 'Descuento' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'kit', label: 'Kit' },
  { value: 'perfilado', label: 'Perfilado' },
]

const rewardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  icon: z.string().min(1, 'El ícono es requerido'),
  type: z.enum([
    'corte', 'descuento', 'bebida',
    'tratamiento', 'kit', 'perfilado'
  ]),
  isActive: z.boolean().default(true),
  isLoyaltyReward: z.boolean().default(false),
})

type RewardFormData = z.infer<typeof rewardSchema>

interface RewardFormModalProps {
  isOpen: boolean
  editingReward: Reward | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: RewardFormData) => void
}

export function RewardFormModal({
  isOpen,
  editingReward,
  isSubmitting,
  onClose,
  onSubmit,
}: RewardFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '🎁',
      type: 'corte',
      isActive: true,
      isLoyaltyReward: false,
    },
  })

  const iconValue = watch('icon')

  useEffect(() => {
    if (editingReward) {
      reset({
        name: editingReward.name || '',
        description: editingReward.description || '',
        icon: editingReward.icon || '🎁',
        type: (editingReward.type as any) || 'corte',
        isActive: editingReward.isActive !== false,
        isLoyaltyReward:
          (editingReward as any).isLoyaltyReward || false,
      })
    } else {
      reset({
        name: '',
        description: '',
        icon: '🎁',
        type: 'corte',
        isActive: true,
        isLoyaltyReward: false,
      })
    }
  }, [editingReward, reset, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center
        justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) =>
        e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-[24px] border
        border-gold/20 bg-[var(--bg-secondary)] p-8
        shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]
              text-gold">
              {editingReward ? 'Editar' : 'Nuevo'} premio
            </p>
            <h2 className="mt-1 text-xl font-semibold
              text-[var(--text-primary)]">
              {editingReward
                ? `Editando: ${editingReward.name}`
                : 'Crear nuevo premio'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center
              rounded-full border border-[var(--border-color)]
              text-[var(--text-secondary)] transition
              hover:border-gold hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-sm font-medium
              text-[var(--text-primary)]">
              Nombre del premio
            </label>
            <input
              {...register('name')}
              placeholder="Ej: Corte Premium Gratis"
              className="w-full rounded-xl border
                border-[var(--border-color)]
                bg-[var(--bg-card)] px-4 py-3 text-sm
                text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                outline-none transition focus:border-gold"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1.5 block text-sm font-medium
              text-[var(--text-primary)]">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe el premio brevemente..."
              className="w-full rounded-xl border
                border-[var(--border-color)]
                bg-[var(--bg-card)] px-4 py-3 text-sm
                text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                outline-none transition focus:border-gold
                resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Ícono y Tipo en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium
                text-[var(--text-primary)]">
                Ícono (emoji)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{iconValue}</span>
                <input
                  {...register('icon')}
                  placeholder="🎁"
                  className="flex-1 rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-card)] px-4 py-3 text-sm
                    text-[var(--text-primary)] outline-none
                    transition focus:border-gold"
                />
              </div>
              {errors.icon && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.icon.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium
                text-[var(--text-primary)]">
                Tipo
              </label>
              <select
                {...register('type')}
                className="w-full rounded-xl border
                  border-[var(--border-color)]
                  bg-[var(--bg-card)] px-4 py-3 text-sm
                  text-[var(--text-primary)] outline-none
                  transition focus:border-gold"
              >
                {REWARD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 rounded-xl border
            border-[var(--border-color)] bg-[var(--bg-card)]
            p-4">

            {/* isActive */}
            <label className="flex items-center
              justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium
                  text-[var(--text-primary)]">
                  Premio activo
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Los premios inactivos no aparecen en la votación
                </p>
              </div>
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-5 w-5 accent-gold cursor-pointer"
              />
            </label>

            {/* isLoyaltyReward */}
            <label className="flex items-center
              justify-between gap-4 cursor-pointer border-t
              border-[var(--border-color)] pt-3">
              <div>
                <p className="text-sm font-medium
                  text-[var(--text-primary)]">
                  Premio de fidelidad
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Disponible para canjear con puntos de fidelidad
                </p>
              </div>
              <input
                {...register('isLoyaltyReward')}
                type="checkbox"
                className="h-5 w-5 accent-gold cursor-pointer"
              />
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border
                border-[var(--border-color)]
                bg-[var(--bg-card)] py-3 text-sm font-semibold
                text-[var(--text-secondary)] transition
                hover:border-gold
                hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gold py-3
                text-sm font-semibold text-surface-dark
                transition hover:brightness-110
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (editingReward
                    ? 'Guardando...'
                    : 'Creando...')
                : (editingReward
                    ? 'Guardar cambios'
                    : 'Crear premio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
