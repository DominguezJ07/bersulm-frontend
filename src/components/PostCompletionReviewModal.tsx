import { useState } from 'react'
import { Star, X, CheckCircle } from 'lucide-react'
import { reviewsService } from '@/services/reviews.service'
import toast from 'react-hot-toast'

interface PostCompletionReviewModalProps {
  appointmentId: string
  serviceName: string
  date: string
  time: string
  onClose: () => void
}

export function PostCompletionReviewModal({
  appointmentId,
  serviceName,
  date,
  time,
  onClose,
}: PostCompletionReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Selecciona una calificación')
      return
    }
    if (comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await reviewsService.create({
        appointmentId,
        rating,
        comment: comment.trim(),
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        || 'Error al enviar la reseña'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="w-full max-w-md rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle size={32} className="text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            ¡Gracias por tu reseña!
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Tu opinión será revisada antes de publicarse.
            ¡Nos vemos pronto en BERSULM!
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-gold py-3 text-sm font-semibold text-surface-dark transition hover:brightness-110"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl">

        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-gold hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-green-400">
            ¡Cita completada!
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
            ¿Cómo fue tu experiencia?
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {serviceName} · {date} a las {time}
          </p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Tu opinión nos ayuda a mejorar.
            Puedes cerrar esto si prefieres no dejar reseña.
          </p>
        </div>

        {/* Estrellas */}
        <div className="mb-5">
          <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
            Calificación
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  className={`transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-gold text-gold'
                      : 'text-[var(--border-color)]'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-sm text-gold">
              {['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][rating]}
            </p>
          )}
        </div>

        {/* Comentario */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            Comentario
            <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
              (mín. 10 caracteres)
            </span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Cuéntanos tu experiencia en BERSULM..."
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-gold resize-none"
          />
          <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
            {comment.length}/500
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-gold hover:text-[var(--text-primary)]"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-surface-dark transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-surface-dark border-surface-dark/30" />
                Enviando...
              </span>
            ) : (
              'Enviar reseña'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
