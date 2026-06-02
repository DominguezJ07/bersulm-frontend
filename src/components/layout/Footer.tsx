import { useNavigate } from 'react-router-dom'
import { Scissors, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import logoBersulm from '@/assets/logo-bersulm.svg'

const navLinks = [
  { label: 'Inicio', path: ROUTES.HOME },
  { label: 'Servicios', path: ROUTES.SERVICES },
  { label: 'Reservas', path: ROUTES.RESERVAS },
  { label: 'Premios', path: ROUTES.REWARDS },
  { label: 'Fidelidad', path: ROUTES.LOYALTY },
  { label: 'Ajustes', path: ROUTES.SETTINGS },
]

const servicesLinks = [
  'Corte Clásico',
  'Corte + Barba',
  'Afeitado Clásico',
  'Coloración',
  'Diseño de Cejas',
]

export function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-surface-dark text-white">
      <div className="mx-auto max-w-[1580px] px-[var(--page-px)] py-10 sm:px-6 lg:px-8">
        <div className="grid gap-y-8 gap-x-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[14px] uppercase tracking-[0.35em] text-gold">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-surface-dark overflow-hidden">
                <img src={logoBersulm} alt="BERSULM" className="h-full w-full object-cover" />
              </div>
              <span className="font-medium">BERSULM</span>
            </div>
            <p className="text-[14px] leading-7 text-[var(--text-secondary)]">Lo sublime va en el corazón</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-medium uppercase tracking-[0.35em] text-gold">Navegación</h3>
            <ul className="space-y-3 text-[14px] text-[var(--text-secondary)]">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="text-left transition font-medium text-[var(--text-secondary)] hover:text-gold"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-medium uppercase tracking-[0.35em] text-gold">Servicios</h3>
            <ul className="space-y-3 text-[14px] text-[var(--text-secondary)]">
              {servicesLinks.map((service) => (
                <li key={service}>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.SERVICES)}
                    className="text-left transition font-medium text-[var(--text-secondary)] hover:text-gold"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-medium uppercase tracking-[0.35em] text-gold">Contacto</h3>
            <div className="space-y-3 text-[14px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gold" />
                <span>+34 612 345 678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gold" />
                <span>contacto@bersulm.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-gold" />
                <span>Calle Principal 123, Madrid</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gold" />
                <span>Lun - Sab: 9:00 - 19:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gold pt-6 text-center text-[12px] text-[var(--text-muted)]">
          &copy; 2026 BERSULM. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
