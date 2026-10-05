import { useState, useRef, useCallback, ChangeEvent, FormEvent, useEffect } from 'react'
import { X, Upload, Clock } from 'lucide-react'
import type { Raffle } from '@/types'

type DurationUnit = 'minutes' | 'hours' | 'days'

const unitToMinutes: Record<DurationUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 1440,
}

interface PrizeFormModalProps {
  isOpen: boolean
  isSubmitting: boolean
  editingRaffle: Raffle | null
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void> | void
}

type PreviewItem = {
  id: string
  src: string
  file?: File
}

function calculateDurationFromDate(raffleDate: string): { value: number; unit: DurationUnit } {
  const diffMs = new Date(raffleDate).getTime() - Date.now()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

  if (diffMinutes >= 1440 && diffMinutes % 1440 === 0) {
    return { value: diffMinutes / 1440, unit: 'days' }
  }
  if (diffMinutes >= 60 && diffMinutes % 60 === 0) {
    return { value: diffMinutes / 60, unit: 'hours' }
  }
  return { value: diffMinutes, unit: 'minutes' }
}

function resetFormState() {
  return {
    name: '',
    description: '',
    previews: [] as PreviewItem[],
    durationValue: 1,
    durationUnit: 'days' as DurationUnit,
    touched: false,
  }
}

export function PrizeFormModal({
  isOpen,
  isSubmitting,
  editingRaffle,
  onClose,
  onSubmit,
}: PrizeFormModalProps) {
  const isEditing = Boolean(editingRaffle)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [previews, setPreviews] = useState<PreviewItem[]>([])
  const [durationValue, setDurationValue] = useState<number>(1)
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days')
  const [touched, setTouched] = useState(false)
  const [inputKey, setInputKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Revocar object URLs al desmontar
  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.src.startsWith('blob:')) URL.revokeObjectURL(item.src)
      })
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    // Cada apertura fuerza un remount del input file para limpiar su DOM
    setInputKey((prev) => prev + 1)

    if (editingRaffle) {
      setName(editingRaffle.prize?.name || '')
      setDescription(editingRaffle.prize?.description || '')
      setPreviews(
        editingRaffle.prize?.images.map((src, index) => ({
          id: `existing-${index}`,
          src,
        })) || []
      )

      const duration = calculateDurationFromDate(editingRaffle.raffleDate)
      setDurationValue(duration.value)
      setDurationUnit(duration.unit)
    } else {
      const reset = resetFormState()
      setName(reset.name)
      setDescription(reset.description)
      setPreviews(reset.previews)
      setDurationValue(reset.durationValue)
      setDurationUnit(reset.durationUnit)
    }
    setTouched(false)
  }, [isOpen, editingRaffle])

  const clearImageState = useCallback(() => {
    setPreviews((prev) => {
      prev.forEach((item) => {
        if (item.src.startsWith('blob:')) URL.revokeObjectURL(item.src)
      })
      return []
    })
  }, [])

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const remainingSlots = 3 - previews.length

    if (remainingSlots <= 0) {
      e.target.value = ''
      return
    }

    const toAdd = selected.slice(0, remainingSlots)
    const newItems: PreviewItem[] = toAdd.map((file, index) => ({
      id: `blob-${Date.now()}-${index}`,
      src: URL.createObjectURL(file),
      file,
    }))

    setPreviews((prev) => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setPreviews((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item?.src.startsWith('blob:')) {
        URL.revokeObjectURL(item.src)
      }
      return prev.filter((p) => p.id !== id)
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)

    const hasImages = previews.length > 0
    if (!name.trim() || (!isEditing && !hasImages)) return

    const raffleDate = new Date(
      Date.now() + durationValue * unitToMinutes[durationUnit] * 60000
    ).toISOString()

    const formData = new FormData()
    formData.append('name', name.trim())
    if (description.trim()) {
      formData.append('description', description.trim())
    }
    formData.append('raffleDate', raffleDate)

    // Si hay archivos nuevos, los enviamos. En edición el backend reemplazará
    // las imágenes por estas; en creación son las imágenes iniciales.
    const filesToUpload = previews.map((p) => p.file).filter((f): f is File => Boolean(f))
    if (filesToUpload.length > 0) {
      filesToUpload.forEach((file) => formData.append('images', file))
    }

    try {
      await onSubmit(formData)
      // Submit exitoso: limpiar todo rastro de imágenes/texto antes de cerrar
      clearImageState()
      setName('')
      setDescription('')
      setDurationValue(1)
      setDurationUnit('days')
      setTouched(false)
    } catch {
      // Si falló, mantenemos el estado para que el usuario pueda corregir
    }
  }

  const isNameValid = name.trim().length > 0
  const isFilesValid = previews.length > 0
  const canSubmit = isNameValid && isFilesValid && !isSubmitting

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              Premio del sorteo
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              {isEditing
                ? `Editando: ${editingRaffle?.prize?.name || 'premio'}`
                : 'Crear premio del mes'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-gold hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
              Nombre del premio
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte Premium + Bebida"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-gold"
            />
            {touched && !isNameValid && (
              <p className="mt-1 text-xs text-red-400">
                El nombre es requerido
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe el premio brevemente..."
              className="w-full resize-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-gold"
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
              Imágenes del premio ({previews.length}/3)
            </label>
            <input
              key={inputKey}
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />

            {previews.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-3">
                {previews.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border-color)]"
                  >
                    <img
                      src={item.src}
                      alt={`Vista previa ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previews.length < 3 ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-4 text-sm text-[var(--text-secondary)] transition hover:border-gold hover:text-gold"
              >
                <Upload size={18} />
                {previews.length === 0 ? 'Seleccionar imágenes' : 'Agregar más imágenes'}
              </button>
            ) : (
              <p className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-center text-sm text-gold">
                Máximo 3 imágenes alcanzado
              </p>
            )}

            {touched && !isFilesValid && (
              <p className="mt-1 text-xs text-red-400">
                Debes subir al menos 1 imagen (máximo 3)
              </p>
            )}
          </div>

          {/* Duración */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Clock size={16} className="text-gold" />
              Duración del sorteo
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={1}
                value={durationValue}
                onChange={(e) => setDurationValue(Number(e.target.value))}
                className="w-20 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-gold"
              />
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-gold"
              >
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
                <option value="days">Días</option>
              </select>
              <span className="text-xs text-[var(--text-muted)]">
                hasta el sorteo
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-gold hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-surface-dark transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (isEditing ? 'Guardando...' : 'Creando...')
                : (isEditing ? 'Guardar cambios' : 'Crear premio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
