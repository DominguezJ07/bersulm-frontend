import { Sparkles } from 'lucide-react'

interface WinnerModalProps {
  isOpen: boolean
  winnerName: string | null
  prizeName: string | null
  onClose: () => void
}

export function WinnerModal({ isOpen, winnerName, prizeName, onClose }: WinnerModalProps) {
  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes winner-fade {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-winner-fade {
          animation: winner-fade 0.6s ease-out forwards;
        }
      `}</style>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="animate-winner-fade w-full max-w-md rounded-[32px] border-2 border-gold bg-gradient-to-br from-gold/15 via-[var(--bg-secondary)] to-[var(--bg-secondary)] p-8 text-center shadow-2xl shadow-gold/30">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
            <Sparkles className="h-10 w-10 text-gold animate-pulse" />
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-gold">
            ¡Tenemos ganador!
          </p>
          <h3 className="mt-3 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            {winnerName || 'Ganador'}
          </h3>
          {prizeName && (
            <p className="mt-3 text-xl font-semibold text-gold">
              ganó {prizeName}
            </p>
          )}
          <button
            onClick={onClose}
            className="mt-8 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-surface-dark transition hover:brightness-110"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}
