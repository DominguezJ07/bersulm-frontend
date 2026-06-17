import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CalendarDays, Scissors, Gift, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useServices } from '@/hooks/useServices'
import { galleryService } from '@/services/gallery.service'
import { reviewsService } from '@/services/reviews.service'
import { ROUTES } from '@/constants/routes'
import type { Service, GalleryItem } from '@/types'

const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80', category: 'cortes', label: 'Fade Clásico' },
  { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80', category: 'barba', label: 'Barba Perfilada' },
  { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80', category: 'cortes', label: 'Corte Moderno' },
  { url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80', category: 'barba', label: 'Barba Completa' },
  { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', category: 'cortes', label: 'Estilo Premium' },
  { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80', category: 'barba', label: 'Diseño de Barba' },
]

const features = [
  { icon: Scissors, title: 'Maestros del estilo', desc: 'Cortes precisos y acabados premium basados en técnica profesional.' },
  { icon: Gift, title: 'Experiencia VIP', desc: 'Ambiente exclusivo, servicio rápido y atención personalizada.' },
  { icon: Star, title: 'Acabados perfectos', desc: 'Productos premium seleccionados para cada tipo de cabello y barba.' },
]

const stats = [
  { value: '5+', label: 'Años de experiencia' },
  { value: '2k+', label: 'Clientes felices' },
  { value: '4.9', label: 'Valoración promedio' },
]

const faqs = [
  { q: '¿Necesito reserva?', a: 'Recomendamos reservar para asegurar tu horario preferido, aunque aceptamos walk-ins cuando hay disponibilidad.' },
  { q: '¿Qué productos usan?', a: 'Usamos marcas premium profesionales para lograr resultados duraderos y confort en la piel.' },
  { q: '¿Cuánto dura un corte?', a: 'Un corte estándar toma entre 25 y 45 minutos según el servicio y estilo elegido.' },
]

function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return String(price)
  return `$${num.toLocaleString('es-CO')}`
}

export default function Home() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [galleryFilter, setGalleryFilter] = useState('todos')

  const { data: services, isLoading: servicesLoading } = useServices()

  const { data: galleryData, isLoading: galleryLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => galleryService.getGallery(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews-home'],
    queryFn: () => reviewsService.getApproved({ limit: 6 }),
    staleTime: 10 * 60 * 1000,
  })

  const reviews = (reviewsData as any)?.data?.reviews
    ?? (reviewsData as any)?.reviews
    ?? []

  const rawGalleryItems: GalleryItem[] = galleryData?.data ?? []
  const galleryItems =
    rawGalleryItems.length > 0
      ? rawGalleryItems.map((item) => ({
          url: item.imageUrl,
          label: item.title,
          category: item.category,
        }))
      : galleryImages

  const activeServices: Service[] = (services ?? [])
    .filter((s) => (s as Service & { isActive?: boolean }).isActive !== false)
    .slice(0, 3)
  const resolvedServices = activeServices.length > 0 ? activeServices : []

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Helmet>
        <title>BERSULM | Barbería Premium</title>
        <meta name="description" content="Lo sublime va en el corazón del estilo masculino. Cortes, barba y tratamientos premium en un ambiente exclusivo." />
      </Helmet>
      <main className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section
        className="relative min-h-[80vh] overflow-hidden bg-cover bg-center text-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className={`relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 py-24 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-gold">BERSULM</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Lo sublime va en el corazón del estilo masculino
          </h1>
          <p className="mt-6 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
            Vive una experiencia premium con cortes, barba y tratamientos diseñados para cada detalle.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate(ROUTES.RESERVAS)}
              className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-surface-dark transition hover:brightness-110"
            >
              <CalendarDays size={18} /> Reservar cita
            </button>
            <button
              onClick={() => {
                document.querySelector('#servicios-section')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
              className="inline-flex items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-8 py-4 text-[var(--text-secondary)] transition hover:border-gold hover:text-[var(--text-primary)]"
            >
              Ver servicios
            </button>
          </div>
        </div>
      </section>

      <section className="border-y border-gold bg-[var(--bg-secondary)] py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-[var(--page-px)] sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="space-y-3 rounded-[32px] bg-[var(--bg-tertiary)] p-8 text-center shadow-xl shadow-black/10">
              <p className="text-5xl font-bold text-gold">{item.value}</p>
              <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="servicios-section" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Descubre</p>
              <h2 className="mt-3 text-3xl font-semibold">Servicios que transforman tu estilo</h2>
            </div>
            <p className="max-w-xl text-[var(--text-secondary)]">
              Corta, perfila y renueva tu presencia con tratamientos exclusivos y atención personalizada.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {servicesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl shadow-black/5">
                  <div className="mb-6 inline-flex h-14 w-14 animate-pulse items-center justify-center rounded-3xl bg-[var(--bg-tertiary)]" />
                  <div className="h-7 w-2/3 animate-pulse rounded bg-[var(--bg-tertiary)]" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--bg-tertiary)]" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--bg-tertiary)]" />
                  </div>
                </div>
              ))
            ) : resolvedServices.length > 0 ? (
              resolvedServices.map((service) => (
                <div key={service._id || service.id} className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl shadow-black/5 transition hover:-translate-y-1">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--bg-tertiary)] text-gold">
                    <Scissors size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">{service.name}</h3>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">{service.description || service.desc || ''}</p>
                  {service.price != null && (
                    <p className="mt-4 text-lg font-bold text-gold">{formatPrice(service.price)}</p>
                  )}
                </div>
              ))
            ) : (
              features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl shadow-black/5 transition hover:-translate-y-1">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--bg-tertiary)] text-gold">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">{desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Galería</p>
            <h2 className="mt-3 text-3xl font-semibold">Nuestros estilos en acción</h2>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            {['todos', 'cortes', 'barba'].map((value) => (
              <button
                key={value}
                onClick={() => setGalleryFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${galleryFilter === value ? 'bg-gold text-surface-dark' : 'border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-gold hover:text-[var(--text-primary)]'}`}
              >
                {value === 'todos' ? 'Todos' : value === 'cortes' ? 'Cortes' : 'Barba'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[32px] bg-[var(--bg-secondary)] shadow-xl shadow-black/10">
                  <div className="h-72 w-full animate-pulse bg-[var(--bg-tertiary)]" />
                  <div className="p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--bg-tertiary)]" />
                  </div>
                </div>
              ))
            ) : (
              galleryItems
                .filter((image) => galleryFilter === 'todos' || image.category === galleryFilter)
                .map((image) => (
                  <div key={image.url} className="overflow-hidden rounded-[32px] bg-[var(--bg-secondary)] shadow-xl shadow-black/10">
                    <img src={image.url} alt={image.label} className="h-72 w-full object-cover" />
                    <div className="p-4 text-sm text-[var(--text-primary)]">{image.label}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-10 shadow-xl shadow-black/5">
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Clientes</p>
              <h2 className="mt-3 text-3xl font-semibold">Testimonios que hablan por sí solos</h2>
              <p className="mt-4 text-[var(--text-secondary)]">Cortes impecables, servicio atento y resultados fuera de serie.</p>
            </div>
            <div className="grid gap-4">
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((review: any) => (
                  <div key={review._id}
                    className="rounded-[32px] bg-[var(--bg-tertiary)] p-6">
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= review.rating
                            ? 'fill-gold text-gold'
                            : 'text-[var(--border-color)]'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      {review.authorAvatar ? (
                        <img
                          src={review.authorAvatar}
                          alt={review.authorName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                          {review.authorName?.[0]?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {review.authorName}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Cliente verificado
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                ['Excelente servicio y atención al detalle',
                 'Ambiente profesional y resultados increíbles',
                 'Siempre vuelvo por la calidad del trabajo'
                ].map((text) => (
                  <div key={text}
                    className="rounded-[32px] bg-[var(--bg-tertiary)] p-6">
                    <div className="mb-3 flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16}
                          className="fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      "{text}"
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">C</div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Cliente BERSULM
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Listado de preguntas</p>
          <h2 className="mt-3 text-3xl font-semibold">Preguntas frecuentes</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq, idx) => (
                <div key={faq.q} className="rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-[var(--text-primary)]"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <span className="text-gold transition-transform duration-200">{faqOpen === idx ? '\u2212' : '+'}</span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: faqOpen === idx ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-4">
                        <p className="text-sm text-[var(--text-secondary)]">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
