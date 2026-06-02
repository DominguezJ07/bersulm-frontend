import { NavLink } from 'react-router-dom'
import { Home, Scissors, CalendarDays, Gift, Wallet, Settings } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import logoBersulm from '@/assets/logo-bersulm.svg'

const tabs = [
  { label: 'Inicio', path: ROUTES.HOME, Icon: Home },
  { label: 'Servicios', path: ROUTES.SERVICES, Icon: Scissors },
  { label: 'Reservas', path: ROUTES.RESERVAS, Icon: CalendarDays },
  { label: 'Premios', path: ROUTES.REWARDS, Icon: Gift },
  { label: 'Fidelidad', path: ROUTES.LOYALTY, Icon: Wallet },
  { label: 'Ajustes', path: ROUTES.SETTINGS, Icon: Settings },
]

export function BottomNav() {
  return (
    <header className="bg-surface-dark text-white">
      <div className="hidden items-center justify-between border-b border-gold px-6 py-4 md:flex lg:px-10 xl:px-16">
        <div className="flex items-center gap-3 text-base uppercase tracking-[0.35em] text-gold">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-surface-dark overflow-hidden">
            <img src={logoBersulm} alt="BERSULM" className="h-full w-full object-cover" />
          </div>
          <span className="font-medium">BERSULM</span>
        </div>

        <nav>
          <ul className="flex flex-wrap items-center justify-center gap-8">
            {tabs.map(({ label, path }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }: { isActive: boolean }) =>
                    `text-base font-medium transition ${
                      isActive ? 'text-gold' : 'text-white hover:text-gold'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="w-16" />
      </div>

      <nav className="border-t border-[var(--border-color)] bg-surface-dark px-4 py-3 md:hidden">
        <ul className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          {tabs.map(({ label, path, Icon }) => (
            <li key={path} className="flex-1">
              <NavLink
                to={path}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex flex-col items-center justify-center rounded-3xl px-3 py-2 text-[11px] font-semibold transition ${
                    isActive
                      ? 'bg-surface-light text-gold'
                      : 'text-[var(--text-secondary)] hover:bg-surface-light hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="mt-1">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
