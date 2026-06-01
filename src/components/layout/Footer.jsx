import { useNavigate } from 'react-router-dom'
import { Scissors, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import logoBersulm from '../../assets/logo-bersulm.svg'

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

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0f0a04] text-white">
      <div className="mx-auto max-w-[1580px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-y-10 gap-x-0 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[14px] uppercase tracking-[0.35em] text-[#f5a623]">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#f5a623] bg-[#0f0a04] overflow-hidden">
                <img src={logoBersulm} alt="BERSULM" className="h-full w-full object-cover" />
              </div>
              <span className="font-medium">BERSULM</span>
            </div>
            <p className="text-[14px] leading-7 text-[#cccccc]">Lo sublime va en el corazón</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-medium uppercase tracking-[0.35em] text-[#f5a623]">Navegación</h3>
            <ul className="space-y-3 text-[14px] text-[#cccccc]">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="text-left transition font-medium text-[#cccccc] hover:text-[#f5a623]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-medium uppercase tracking-[0.35em] text-[#f5a623]">Servicios</h3>
            <ul className="space-y-3 text-[14px] text-[#cccccc]">
              {servicesLinks.map((service) => (
                <li key={service}>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.SERVICES)}
                    className="text-left transition font-medium text-[#cccccc] hover:text-[#f5a623]"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-medium uppercase tracking-[0.35em] text-[#f5a623]">Contacto</h3>
            <div className="space-y-3 text-[14px] text-[#cccccc]">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#f5a623]" />
                <span>+34 612 345 678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#f5a623]" />
                <span>contacto@bersulm.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#f5a623]" />
                <span>Calle Principal 123, Madrid</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#f5a623]" />
                <span>Lun - Sab: 9:00 - 19:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#f5a623] pt-6 text-center text-[12px] text-[#999999]">
          © 2026 BERSULM. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
