import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Clock } from 'lucide-react'
import api from '../../services/api'

const categories = [
  { label: 'Todos', value: 'todos' },
  { label: 'Corte', value: 'corte' },
  { label: 'Barba', value: 'barba' },
  { label: 'Color', value: 'color' },
  { label: 'Extra', value: 'extra' },
]

export default function Services() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const fetchServices = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/services')
        const result = response.data
        const servicesList = result?.data?.services || result?.data || result || []
        if (mounted) setServices(Array.isArray(servicesList) ? servicesList : [])
      } catch (err) {
        if (mounted) setError('Error cargando servicios')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchServices()
    return () => {
      mounted = false
    }
  }, [])

  const filteredServices =
    activeFilter === 'todos'
      ? services
      : services.filter((service) => service.category === activeFilter)

  return (
    <main className="min-h-screen bg-app px-6 py-10 text-app sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Servicios</p>
          <h1 className="mt-4 text-4xl font-semibold text-app sm:text-5xl">Nuestros Servicios</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--accent)]">Elige el servicio perfecto para tu estilo y disfruta de una experiencia premium en BERSULM.</p>
        </header>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setActiveFilter(category.value)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 ${
                activeFilter === category.value
                  ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                  : 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="col-span-3 flex items-center justify-center py-10 text-[var(--accent)]">
              <div className="mr-3 h-6 w-6 animate-spin rounded-full border-4 border-t-[var(--accent)] border-[var(--border-color)]" />
              Cargando servicios...
            </div>
          )}

          {error && (
            <div className="col-span-3 text-center text-red-400">{error}</div>
          )}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="col-span-3 text-center text-[var(--text-secondary)]">No hay servicios disponibles.</div>
          )}

          {!loading && !error && filteredServices.map((service) => {
            const duration = service.durationMin ? `${service.durationMin} min` : '-'
            const price = typeof service.price === 'number' ? `$${service.price}` : service.price || '-'
            return (
              <article
                key={service._id}
                className="relative group overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_20px_50px_rgba(245,166,35,0.18)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-[var(--gold)]">
                  <Scissors size={28} />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-app">{service.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{service.description}</p>

                <div className="mt-6 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Clock size={16} className="text-[var(--gold)]" />
                  <span>{duration}</span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <span className="text-3xl font-bold text-[var(--gold)]">{price}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/reservas', { state: { selectedService: service } })}
                    className="rounded-full border border-transparent bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition duration-300 hover:bg-[#ddb251]"
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
  )
}
