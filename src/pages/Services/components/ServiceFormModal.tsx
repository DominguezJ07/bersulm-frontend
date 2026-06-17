import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Service } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().default(''),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  durationMin: z.coerce.number().min(1, 'La duración mínima es 1 minuto'),
  icon: z.string().min(1, 'El ícono es requerido'),
  category: z.enum(['corte', 'barba', 'color', 'extra']),
  order: z.coerce.number().default(0),
})

type ServiceFormData = {
  name: string
  description: string
  price: number
  durationMin: number
  icon: string
  category: 'corte' | 'barba' | 'color' | 'extra'
  order: number
}

interface ServiceFormModalProps {
  isOpen: boolean
  editingService: Service | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: ServiceFormData) => void
}

export function ServiceFormModal({
  isOpen,
  editingService,
  isSubmitting,
  onClose,
  onSubmit,
}: ServiceFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      durationMin: 30,
      icon: '\u2702\ufe0f',
      category: 'corte',
      order: 0,
    },
  })

  useEffect(() => {
    if (editingService) {
      reset({
        name: editingService.name || '',
        description: editingService.description
          || editingService.desc || '',
        price: typeof editingService.price === 'number'
          ? editingService.price
          : parseFloat(String(editingService.price)) || 0,
        durationMin: editingService.durationMin
          || editingService.duration || 30,
        icon: editingService.icon || '\u2702\ufe0f',
        category: (editingService.category as any) || 'corte',
        order: editingService.order || 0,
      })
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        durationMin: 30,
        icon: '\u2702\ufe0f',
        category: 'corte',
        order: 0,
      })
    }
  }, [editingService, reset, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-[24px] border
        border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl
        max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              {editingService ? 'Editar' : 'Nuevo'} servicio
            </p>
            <h2 className="mt-1 text-xl font-semibold
              text-[var(--text-primary)]">
              {editingService
                ? `Editando: ${editingService.name}`
                : 'Crear nuevo servicio'}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">

          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-sm font-medium
              text-[var(--text-primary)]">
              Nombre del servicio
            </label>
            <input
              {...register('name')}
              placeholder="Ej: Corte Clásico"
              className="w-full rounded-xl border border-[var(--border-color)]
                bg-[var(--bg-card)] px-4 py-3 text-sm
                text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
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
                <span className="ml-1 text-xs font-normal
                  text-[var(--text-muted)]">(opcional)</span>
              </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe el servicio brevemente..."
              className="w-full rounded-xl border border-[var(--border-color)]
                bg-[var(--bg-card)] px-4 py-3 text-sm
                text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                outline-none transition focus:border-gold resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Precio y Duración en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium
                text-[var(--text-primary)]">
                Precio ($)
              </label>
              <input
                {...register('price')}
                type="number"
                min="0"
                step="any"
                placeholder="25000"
                className="w-full rounded-xl border border-[var(--border-color)]
                  bg-[var(--bg-card)] px-4 py-3 text-sm
                  text-[var(--text-primary)] outline-none
                  transition focus:border-gold"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium
                text-[var(--text-primary)]">
                Duración (min)
              </label>
              <input
                {...register('durationMin')}
                type="number"
                min="1"
                placeholder="30"
                className="w-full rounded-xl border border-[var(--border-color)]
                  bg-[var(--bg-card)] px-4 py-3 text-sm
                  text-[var(--text-primary)] outline-none
                  transition focus:border-gold"
              />
              {errors.durationMin && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.durationMin.message}
                </p>
              )}
            </div>
          </div>

          {/* Ícono y Categoría en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium
                text-[var(--text-primary)]">
                Ícono (emoji)
              </label>
              <input
                {...register('icon')}
                placeholder="✂️"
                className="w-full rounded-xl border border-[var(--border-color)]
                  bg-[var(--bg-card)] px-4 py-3 text-sm
                  text-[var(--text-primary)] outline-none
                  transition focus:border-gold"
              />
              {errors.icon && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.icon.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium
                text-[var(--text-primary)]">
                Categoría
              </label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-[var(--border-color)]
                  bg-[var(--bg-card)] px-4 py-3 text-sm
                  text-[var(--text-primary)] outline-none
                  transition focus:border-gold"
              >
                <option value="corte">Corte</option>
                <option value="barba">Barba</option>
                <option value="color">Color</option>
                <option value="extra">Extra</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* Orden */}
          <div>
            <label className="mb-1.5 block text-sm font-medium
              text-[var(--text-primary)]">
              Orden de aparición
            </label>
            <input
              {...register('order')}
              type="number"
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-[var(--border-color)]
                bg-[var(--bg-card)] px-4 py-3 text-sm
                text-[var(--text-primary)] outline-none
                transition focus:border-gold"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Los servicios con menor número aparecen primero
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-color)]
                bg-[var(--bg-card)] py-3 text-sm font-semibold
                text-[var(--text-secondary)] transition
                hover:border-gold hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gold py-3 text-sm
                font-semibold text-surface-dark transition
                hover:brightness-110 disabled:opacity-60
                disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (editingService ? 'Guardando...' : 'Creando...')
                : (editingService ? 'Guardar cambios' : 'Crear servicio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
