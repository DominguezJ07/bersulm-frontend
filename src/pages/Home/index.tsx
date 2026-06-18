import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CalendarDays, Scissors, Gift, Star, Plus, X, Upload, Link as LinkIcon } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useServices } from '@/hooks/useServices'
import { galleryService } from '@/services/gallery.service'
import { reviewsService } from '@/services/reviews.service'
import { ROUTES } from '@/constants/routes'
import toast from 'react-hot-toast'
import api from '@/lib/api'
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

interface GalleryManagerInlineProps {
  onClose: () => void
  onAdd: () => void
}

function GalleryManagerInline({
  onClose, onAdd
}: GalleryManagerInlineProps) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] =
    useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<{
    _id: string
    title: string
    category: string
  } | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['gallery-manage'],
    queryFn: async () => {
      const res = await api.get('/gallery')
      const data = res.data?.data ?? res.data ?? []
      return Array.isArray(data) ? data : []
    },
  })

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta foto?')) return
    setDeletingId(id)
    try {
      await api.delete(`/gallery/${id}`)
      toast.success('Foto eliminada')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditCategory(item.category)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    setIsSaving(true)
    try {
      await api.put(`/gallery/${editingItem._id}`, {
        title: editTitle,
        category: editCategory,
      })
      toast.success('Foto actualizada')
      setEditingItem(null)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="animate-pulse h-24
            rounded-xl bg-[var(--bg-tertiary)]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          No hay fotos subidas aún.
        </p>
        <button
          onClick={onAdd}
          className="mt-4 rounded-full bg-gold px-5 py-2.5
            text-sm font-semibold text-surface-dark
            transition hover:brightness-110"
        >
          Añadir primera foto
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center
        justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {items.length} foto{items.length !== 1 ? 's' : ''}
          {' '}subidas
        </p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-full
            bg-gold px-4 py-2 text-xs font-semibold
            text-surface-dark transition
            hover:brightness-110"
        >
          <Plus size={13} />
          Añadir foto
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item._id}>
            {editingItem?._id === item._id ? (
              /* Modo edición */
              <div className="rounded-2xl border
                border-gold/30 bg-[var(--bg-card)] p-4">
                <div className="mb-3 h-24 overflow-hidden
                  rounded-xl">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/200x100?text=Error'
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <input
                    value={editTitle}
                    onChange={(e) =>
                      setEditTitle(e.target.value)}
                    className="w-full rounded-xl border
                      border-[var(--border-color)]
                      bg-[var(--bg-secondary)] px-3 py-2
                      text-sm text-[var(--text-primary)]
                      outline-none focus:border-gold"
                    placeholder="Título"
                  />
                  <select
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value)}
                    className="w-full rounded-xl border
                      border-[var(--border-color)]
                      bg-[var(--bg-secondary)] px-3 py-2
                      text-sm text-[var(--text-primary)]
                      outline-none focus:border-gold"
                  >
                    <option value="cortes">Cortes</option>
                    <option value="barba">Barba</option>
                    <option value="cejas">Cejas</option>
                    <option value="todos">General</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="flex-1 rounded-xl border
                        border-[var(--border-color)]
                        bg-[var(--bg-secondary)] py-2
                        text-xs font-semibold
                        text-[var(--text-secondary)]
                        transition hover:border-gold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex-1 rounded-xl bg-gold
                        py-2 text-xs font-semibold
                        text-surface-dark transition
                        hover:brightness-110
                        disabled:opacity-60"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Modo vista */
              <div className="flex items-center gap-3
                rounded-2xl border border-[var(--border-color)]
                bg-[var(--bg-card)] p-3 transition
                hover:border-gold/30">
                <div className="h-16 w-16 shrink-0
                  overflow-hidden rounded-xl
                  bg-[var(--bg-tertiary)]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/64x64?text=!'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm
                    font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="text-xs
                    text-[var(--text-muted)] capitalize">
                    {item.category === 'todos'
                      ? 'General' : item.category}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex h-8 w-8 items-center
                      justify-center rounded-lg
                      border border-[var(--border-color)]
                      text-[var(--text-secondary)]
                      transition hover:border-gold
                      hover:text-gold"
                    title="Editar"
                  >
                    <svg width="13" height="13"
                      viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="flex h-8 w-8 items-center
                      justify-center rounded-lg
                      bg-red-500/10 text-red-400
                      transition hover:bg-red-500/20
                      disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === item._id ? (
                      <span className="h-3 w-3
                        animate-spin rounded-full border-2
                        border-t-red-400
                        border-red-400/30" />
                    ) : (
                      <svg width="13" height="13"
                        viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                        <path d="M10,11v6M14,11v6"/>
                        <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [isLightMode, setIsLightMode] = useState(
    () => document.documentElement.classList
      .contains('light-mode')
  )
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [galleryFilter, setGalleryFilter] = useState('todos')
  const [showManageGallery, setShowManageGallery] =
    useState(false)

  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const queryClient = useQueryClient()

  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [uploadMode, setUploadMode] =
    useState<'file' | 'url'>('file')
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)
  const [filePreview, setFilePreview] =
    useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryCategory, setGalleryCategory] =
    useState<'cortes' | 'barba' | 'cejas' | 'todos'>('cortes')
  const [isUploading, setIsUploading] = useState(false)
  const galleryFileRef = useRef<HTMLInputElement>(null)

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
  const dbGalleryItems = rawGalleryItems.map((item) => ({
    url: item.imageUrl,
    label: item.title || '',
    category: item.category || 'todos',
  }))
  const galleryItems = [...dbGalleryItems, ...galleryImages]

  const activeServices: Service[] = (services ?? [])
    .filter((s) => (s as Service & { isActive?: boolean }).isActive !== false)
    .slice(0, 3)
  const resolvedServices = activeServices.length > 0 ? activeServices : []

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(
        document.documentElement.classList.contains('light-mode')
      )
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  const handleGalleryFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast.error('La imagen no puede superar 3MB')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) =>
      setFilePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleGallerySubmit = async () => {
    if (!galleryTitle.trim()) {
      toast.error('Ingresa un título para la foto')
      return
    }
    if (uploadMode === 'file' && !selectedFile) {
      toast.error('Selecciona una imagen')
      return
    }
    if (uploadMode === 'url' && !urlInput.trim()) {
      toast.error('Ingresa una URL de imagen')
      return
    }
    setIsUploading(true)
    try {
      if (uploadMode === 'file' && selectedFile) {
        const base64 = await new Promise<string>(
          (resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              resolve(result.split(',')[1])
            }
            reader.onerror = reject
            reader.readAsDataURL(selectedFile)
          }
        )
        await api.post('/gallery', {
          imageBase64: base64,
          mimeType: selectedFile.type,
          title: galleryTitle.trim(),
          category: galleryCategory,
          isActive: true,
          order: 0,
        })
      } else {
        await api.post('/gallery', {
          imageUrl: urlInput.trim(),
          title: galleryTitle.trim(),
          category: galleryCategory,
          isActive: true,
          order: 0,
        })
      }
      toast.success('Foto añadida a la galería')
      setShowGalleryModal(false)
      setSelectedFile(null)
      setFilePreview(null)
      setUrlInput('')
      setGalleryTitle('')
      setGalleryCategory('cortes')
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        || 'Error al añadir la foto'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>BERSULM | Barbería Premium</title>
        <meta name="description" content="Lo sublime va en el corazón del estilo masculino. Cortes, barba y tratamientos premium en un ambiente exclusivo." />
      </Helmet>
      <main className="bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* Modal añadir foto galería — solo admin */}
      {showGalleryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center
            justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setShowGalleryModal(false)}
        >
          <div className="w-full max-w-md rounded-[24px]
            border border-gold/20 bg-[var(--bg-secondary)]
            p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="mb-6 flex items-center
              justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]
                  text-gold">Galería</p>
                <h2 className="mt-1 text-xl font-semibold
                  text-[var(--text-primary)]">
                  Añadir foto
                </h2>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="flex h-9 w-9 items-center
                  justify-center rounded-full border
                  border-[var(--border-color)]
                  text-[var(--text-secondary)] transition
                  hover:border-gold hover:text-gold"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector modo */}
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center gap-2
                  rounded-full px-4 py-2 text-sm
                  font-semibold transition ${
                    uploadMode === 'file'
                      ? 'bg-gold text-surface-dark'
                      : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gold'
                  }`}
              >
                <Upload size={14} />
                Mi equipo
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex items-center gap-2
                  rounded-full px-4 py-2 text-sm
                  font-semibold transition ${
                    uploadMode === 'url'
                      ? 'bg-gold text-surface-dark'
                      : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gold'
                  }`}
              >
                <LinkIcon size={14} />
                URL externa
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload archivo */}
              {uploadMode === 'file' && (
                <div>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleGalleryFileChange}
                  />
                  {!filePreview ? (
                    <button
                      type="button"
                      onClick={() =>
                        galleryFileRef.current?.click()}
                      className="flex w-full flex-col
                        items-center justify-center gap-3
                        rounded-xl border-2 border-dashed
                        border-[var(--border-color)]
                        bg-[var(--bg-card)] py-8 text-sm
                        text-[var(--text-muted)] transition
                        hover:border-gold hover:text-gold"
                    >
                      <Upload size={28} />
                      <span>
                        Click para seleccionar imagen
                      </span>
                      <span className="text-xs">
                        JPG, PNG o WebP · Máx. 3MB
                      </span>
                    </button>
                  ) : (
                    <div className="relative">
                      <div className="h-48 overflow-hidden
                        rounded-xl border
                        border-[var(--border-color)]">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null)
                          setFilePreview(null)
                          if (galleryFileRef.current)
                            galleryFileRef.current.value = ''
                        }}
                        className="absolute right-2 top-2
                          flex h-8 w-8 items-center
                          justify-center rounded-full
                          bg-black/60 text-white
                          hover:bg-black/80"
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          galleryFileRef.current?.click()}
                        className="mt-2 w-full rounded-xl
                          border border-[var(--border-color)]
                          bg-[var(--bg-card)] py-2 text-xs
                          text-[var(--text-secondary)]
                          transition hover:border-gold
                          hover:text-gold"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* URL externa */}
              {uploadMode === 'url' && (
                <div>
                  <label className="mb-1.5 block text-sm
                    font-medium text-[var(--text-primary)]">
                    URL de la imagen
                  </label>
                  <input
                    value={urlInput}
                    onChange={(e) =>
                      setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... (no Google)"
                    className="w-full rounded-xl border
                      border-[var(--border-color)]
                      bg-[var(--bg-card)] px-4 py-3 text-sm
                      text-[var(--text-primary)]
                      placeholder:text-[var(--text-muted)]
                      outline-none transition
                      focus:border-gold"
                  />
                  {urlInput && (
                    <div className="mt-3 h-36 overflow-hidden
                      rounded-xl border
                      border-[var(--border-color)]">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement)
                            .style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="mb-1.5 block text-sm
                  font-medium text-[var(--text-primary)]">
                  Título
                </label>
                <input
                  value={galleryTitle}
                  onChange={(e) =>
                    setGalleryTitle(e.target.value)}
                  placeholder="Fade Clásico"
                  className="w-full rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-card)] px-4 py-3 text-sm
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    outline-none transition focus:border-gold"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="mb-1.5 block text-sm
                  font-medium text-[var(--text-primary)]">
                  Categoría
                </label>
                <select
                  value={galleryCategory}
                  onChange={(e) =>
                    setGalleryCategory(
                      e.target.value as
                        'cortes' | 'barba' | 'cejas' | 'todos'
                    )}
                  className="w-full rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-card)] px-4 py-3 text-sm
                    text-[var(--text-primary)] outline-none
                    transition focus:border-gold"
                >
                  <option value="cortes">Cortes</option>
                  <option value="barba">Barba</option>
                  <option value="cejas">Cejas</option>
                  <option value="todos">General</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="flex-1 rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-card)] py-3 text-sm
                    font-semibold text-[var(--text-secondary)]
                    transition hover:border-gold
                    hover:text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGallerySubmit}
                  disabled={isUploading}
                  className="flex-1 rounded-xl bg-gold py-3
                    text-sm font-semibold text-surface-dark
                    transition hover:brightness-110
                    disabled:opacity-60
                    disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="flex items-center
                      justify-center gap-2">
                      <span className="h-4 w-4 animate-spin
                        rounded-full border-2
                        border-t-surface-dark
                        border-surface-dark/30" />
                      Subiendo...
                    </span>
                  ) : 'Añadir foto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal gestionar galería — solo admin */}
      {showManageGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center
            justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setShowManageGallery(false)}
        >
          <div className="w-full max-w-2xl rounded-[24px]
            border border-gold/20 bg-[var(--bg-secondary)]
            p-8 shadow-2xl max-h-[85vh] overflow-y-auto">

            <div className="mb-6 flex items-center
              justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]
                  text-gold">Admin</p>
                <h2 className="mt-1 text-xl font-semibold
                  text-[var(--text-primary)]">
                  Gestionar galería
                </h2>
              </div>
              <button
                onClick={() => setShowManageGallery(false)}
                className="flex h-9 w-9 items-center
                  justify-center rounded-full border
                  border-[var(--border-color)]
                  text-[var(--text-secondary)] transition
                  hover:border-gold hover:text-gold"
              >
                <X size={18} />
              </button>
            </div>

            <GalleryManagerInline
              onClose={() => setShowManageGallery(false)}
              onAdd={() => {
                setShowManageGallery(false)
                setShowGalleryModal(true)
              }}
            />
          </div>
        </div>
      )}

      <section
        className="relative min-h-[80vh] overflow-hidden bg-cover bg-center text-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80')" }}
      >
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: isLightMode
              ? 'rgba(255,255,255,0.35)'
              : 'rgba(0,0,0,0.60)',
            backdropFilter: isLightMode ? 'blur(1px)' : 'none',
          }}
        />
        <div className={`relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 py-24 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-gold">BERSULM</p>
          <h1
            className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl"
            style={{ color: isLightMode ? '#1a1a1a' : '#ffffff' }}
          >
            Lo sublime va en el corazón del estilo masculino
          </h1>
          <p
            className="mt-6 max-w-2xl text-base sm:text-lg"
            style={{
              color: isLightMode
                ? 'rgba(30,30,30,0.85)'
                : 'rgba(255,255,255,0.80)',
            }}
          >
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
            {isAdmin && (
              <div className="mt-4 flex items-center
                justify-center gap-3">
                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="flex items-center gap-2 rounded-full
                    bg-gold px-5 py-2.5 text-sm font-semibold
                    text-surface-dark transition
                    hover:brightness-110"
                >
                  <Plus size={16} />
                  Añadir foto
                </button>
                <button
                  onClick={() => setShowManageGallery(true)}
                  className="flex items-center gap-2 rounded-full
                    border border-gold/40 px-5 py-2.5 text-sm
                    font-semibold text-gold transition
                    hover:bg-gold/10"
                >
                  Gestionar galería
                </button>
              </div>
            )}
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            {['todos', 'cortes', 'barba', 'cejas'].map((value) => (
              <button
                key={value}
                onClick={() => setGalleryFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${galleryFilter === value ? 'bg-gold text-surface-dark' : 'border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-gold hover:text-[var(--text-primary)]'}`}
              >
                {value === 'todos' ? 'Todos'
                  : value === 'cortes' ? 'Cortes'
                  : value === 'barba' ? 'Barba'
                  : 'Cejas'}
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
