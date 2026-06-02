import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Scissors, Clock } from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import type { Service } from '@/types'

const categories = [
  { label: 'Todos', value: 'todos' },
  { label: 'Corte', value: 'corte' },
  { label: 'Barba', value: 'barba' },
  { label: 'Color', value: 'color' },
  { label: 'Extra', value: 'extra' },
]

function formatPrice(service: Service): string {
  if (typeof service.price === 'number') return `$${service.price}`
  return service.price || '-'
}

function formatDuration(service: Service): string {
  const d = service.durationMin || service.duration || service.length || service.duration_minutes
  return d ? `${d} min` : '-'
}

export default function Services() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const { data: services = [], isLoading, error } = useServices()
  const navigate = useNavigate()

  const filteredServices =
    activeFilter === 'todos'
      ? services
      : services.filter((s) => s.category === activeFilter)

  return (
    <>
      <Helmet>
        <title>Servicios | BERSULM</title>
        <meta name="description" content="Descubre nuestros servicios premium de barbería: cortes clásicos, modernos, barba, coloración y tratamientos capilares." />
      </Helmet>
      <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Servicios</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Nuestros Servicios</h1>
          <p className="mt-4 max-w-2xl text-lg text-gold">
            Elige el servicio perfecto para tu estilo y disfruta de una experiencia premium en BERSULM.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setActiveFilter(category.value)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
                activeFilter === category.value
                  ? 'bg-gold text-surface-dark'
                  : 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-gold hover:text-[var(--text-primary)]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading && (
            <div className="col-span-3 flex items-center justify-center py-10 text-gold">
              <div className="mr-3 h-6 w-6 animate-spin rounded-full border-4 border-t-gold border-[var(--border-color)]" />
              Cargando servicios...
            </div>
          )}

          {error && (
            <div className="col-span-3 text-center text-red-400">Error cargando servicios</div>
          )}

          {!isLoading && !error && filteredServices.length === 0 && (
            <div className="col-span-3 text-center text-[var(--text-secondary)]">
              No hay servicios disponibles.
            </div>
          )}

          {!isLoading &&
            !error &&
            filteredServices.map((service) => {
              const serviceKey = service._id || service.id || service.name
              return (
                <article
                  key={serviceKey}
                  className="group relative overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_50px_rgba(245,166,35,0.18)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-gold">
                    <Scissors size={28} />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">
                    {service.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Clock size={16} className="text-gold" />
                    <span>{formatDuration(service)}</span>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <span className="text-3xl font-bold text-gold">{formatPrice(service)}</span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/reservas', { state: { selectedService: service } })
                      }
                      className="rounded-full border border-transparent bg-gold px-6 py-3 text-sm font-semibold text-surface-dark transition duration-300 hover:brightness-110"
                    >
                      Reservar
                    </button>
                  </div>
                </article>
              )
            })}
        </div>
      </div>
    </main>
    </>
  )
}
