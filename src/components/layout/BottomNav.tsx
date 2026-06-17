import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Scissors, CalendarDays, Gift, Wallet, Settings, ChevronUp, X, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminNotifications } from '@/hooks/useAdminNotifications'
import { AdminNotificationsPanel } from '@/components/AdminNotificationsPanel'
import { ROUTES } from '@/constants/routes'
import logoBersulm from '@/assets/logo-bersulm.svg'

const mainTabs = [
  { label: 'Inicio', path: ROUTES.HOME, Icon: Home },
  { label: 'Servicios', path: ROUTES.SERVICES, Icon: Scissors },
  { label: 'Reservas', path: ROUTES.RESERVAS, Icon: CalendarDays },
  { label: 'Premios', path: ROUTES.REWARDS, Icon: Gift },
]

const moreTabs = [
  { label: 'Fidelidad', path: ROUTES.LOYALTY, Icon: Wallet },
  { label: 'Ajustes', path: ROUTES.SETTINGS, Icon: Settings },
]

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [showNotifications, setShowNotifications] =
    useState(false)
  const { unreadCount } = useAdminNotifications()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [moreOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
    >
      {/* Desktop header */}
      <div className="hidden border-b border-[var(--border-color)] bg-surface-dark/95 backdrop-blur-md md:flex">
        <div className="mx-auto flex w-full max-w-[1580px] items-center justify-between px-[var(--page-px)] py-4">
          <NavLink to={ROUTES.HOME} className="flex items-center gap-3 text-base uppercase tracking-[0.35em] text-gold">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gold bg-surface-dark">
              <img src={logoBersulm} alt="BERSULM" className="h-full w-full object-cover" />
            </div>
            <span className="hidden font-medium sm:inline">BERSULM</span>
          </NavLink>

          <nav>
            <ul className="flex items-center gap-1 lg:gap-8">
              {[...mainTabs, ...moreTabs].map(({ label, path }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }: { isActive: boolean }) =>
                      `rounded-full px-3 py-2 text-sm font-medium transition lg:px-4 ${
                        isActive
                          ? 'bg-gold/10 text-gold'
                          : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {isAdmin && (
            <div className="relative">
              <button
                onClick={() =>
                  setShowNotifications((prev) => !prev)}
                className="relative flex h-10 w-10 items-center
                  justify-center rounded-full border
                  border-[var(--border-color)]
                  bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                  transition hover:border-gold hover:text-gold"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1
                    flex h-5 w-5 items-center justify-center
                    rounded-full bg-gold text-xs font-bold
                    text-surface-dark">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AdminNotificationsPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}

          {!isAdmin && <div className="w-16" />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="border-t border-[var(--border-color)] bg-surface-dark md:hidden">
        <ul className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] pt-2">
          {mainTabs.map(({ label, path, Icon }) => (
            <li key={path} className="flex-1">
              <NavLink
                to={path}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-[10px] font-semibold transition sm:text-[11px] ${
                    isActive
                      ? 'bg-surface-light text-gold'
                      : 'text-[var(--text-secondary)] hover:bg-surface-light/50 hover:text-white'
                  }`
                }
              >
                <Icon size={20} className="mb-0.5" />
                <span className="truncate">{label}</span>
              </NavLink>
            </li>
          ))}

          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={`flex w-full flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-[10px] font-semibold transition sm:text-[11px] ${
                moreOpen
                  ? 'bg-surface-light text-gold'
                  : 'text-[var(--text-secondary)] hover:bg-surface-light/50 hover:text-white'
              }`}
            >
              <ChevronUp size={20} className="mb-0.5" />
              <span>Más</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* "Más" bottom sheet overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-3xl border-t border-gold/20 bg-surface-dark px-6 pb-[max(2rem,env(safe-area-inset-bottom,2rem))] pt-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Más opciones
              </h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="space-y-2">
              {moreTabs.map(({ label, path, Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-medium transition ${
                        isActive
                          ? 'bg-gold/10 text-gold'
                          : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={22} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}
