import { useRef, useEffect } from 'react'
import { Bell, X, Trash2, CalendarDays, XCircle } from 'lucide-react'
import { useAdminNotifications } from '@/hooks/useAdminNotifications'
import type { AdminNotification } from '@/hooks/useAdminNotifications'

function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string'
    ? new Date(date)
    : date
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours}h`
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

const TYPE_CONFIG: Record<
  AdminNotification['type'],
  { icon: typeof CalendarDays; color: string; bg: string; border: string }
> = {
  new_appointment: {
    icon: CalendarDays,
    color: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/20',
  },
  cancelled_appointment: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
}

interface AdminNotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminNotificationsPanel({
  isOpen,
  onClose,
}: AdminNotificationsPanelProps) {
  const { notifications, unreadCount, markAllRead, clearAll } =
    useAdminNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      setTimeout(markAllRead, 500)
    }
  }, [isOpen, unreadCount, markAllRead])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2
        w-80 rounded-[20px] border border-[var(--border-color)]
        bg-[var(--bg-secondary)] shadow-2xl
        sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between
        border-b border-[var(--border-color)] px-5 py-4">
        <div>
          <h3 className="font-semibold
            text-[var(--text-primary)]">
            Notificaciones
          </h3>
          {notifications.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              {notifications.length} notificación
              {notifications.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex h-8 w-8 items-center justify-center
                rounded-lg text-[var(--text-muted)] transition
                hover:bg-[var(--bg-tertiary)]
                hover:text-red-400"
              title="Limpiar todo"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center
              rounded-lg text-[var(--text-muted)] transition
              hover:bg-[var(--bg-tertiary)]
              hover:text-[var(--text-primary)]"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center
            justify-center py-12 text-center">
            <Bell size={28} className="mb-3
              text-[var(--text-muted)] opacity-40" />
            <p className="text-sm font-medium
              text-[var(--text-primary)]">
              Sin notificaciones
            </p>
            <p className="mt-1 text-xs
              text-[var(--text-muted)]">
              Las nuevas reservas y cancelaciones
              aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {notifications.map((notification) => {
              const config =
                TYPE_CONFIG[notification.type] ??
                TYPE_CONFIG.new_appointment
              const Icon = config.icon

              return (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-5 py-4
                    transition hover:bg-[var(--bg-tertiary)]/50
                    ${!notification.read
                      ? 'bg-gold/5'
                      : ''
                    }`}
                >
                  <div className={`flex h-9 w-9 shrink-0
                    items-center justify-center rounded-xl
                    border ${config.bg} ${config.border}
                    ${config.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start
                      justify-between gap-2">
                      <p className="text-sm font-semibold
                        text-[var(--text-primary)]">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2
                          shrink-0 rounded-full bg-gold" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs
                      text-[var(--text-secondary)]
                      leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="mt-1.5 text-xs
                      text-[var(--text-muted)]">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
