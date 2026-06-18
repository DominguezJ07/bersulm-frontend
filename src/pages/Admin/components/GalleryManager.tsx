import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Image, Plus, Trash2, X, Upload, Link } from 'lucide-react'
import api from '@/lib/api'

interface GalleryItem {
  _id: string
  imageUrl: string
  title: string
  category: 'todos' | 'cortes' | 'barba'
  isActive: boolean
  order: number
}

const gallerySchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  category: z.enum(['todos', 'cortes', 'barba']),
  order: z.coerce.number().default(0),
})

type GalleryFormData = z.infer<typeof gallerySchema>

export function GalleryManager() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)
  const [uploadMode, setUploadMode] =
    useState<'file' | 'url'>('file')
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)
  const [filePreview, setFilePreview] =
    useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { title: '', category: 'cortes', order: 0 },
  })

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['gallery-admin'],
    queryFn: async () => {
      const res = await api.get('/gallery')
      const data = res.data?.data ?? res.data ?? []
      return Array.isArray(data) ? (data as GalleryItem[]) : []
    },
  })

  const handleFileChange = (
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

  const handleCreate = async (formData: GalleryFormData) => {
    if (uploadMode === 'file' && !selectedFile) {
      toast.error('Selecciona una imagen')
      return
    }
    if (uploadMode === 'url' && !urlInput.trim()) {
      toast.error('Ingresa una URL de imagen')
      return
    }
    setIsSubmitting(true)
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
          title: formData.title,
          category: formData.category,
          order: formData.order,
          isActive: true,
        })
      } else {
        await api.post('/gallery', {
          imageUrl: urlInput.trim(),
          title: formData.title,
          category: formData.category,
          order: formData.order,
          isActive: true,
        })
      }
      toast.success('Foto añadida a la galería')
      reset()
      setSelectedFile(null)
      setFilePreview(null)
      setUrlInput('')
      setShowForm(false)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        || 'Error al añadir la foto'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta foto?')) return
    setDeletingId(id)
    try {
      await api.delete(`/gallery/${id}`)
      toast.success('Foto eliminada')
      refetch()
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    } catch {
      toast.error('Error al eliminar la foto')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    reset()
    setSelectedFile(null)
    setFilePreview(null)
    setUrlInput('')
  }

  return (
    <section className="rounded-[24px] border
      border-[var(--border-color)]
      bg-[var(--bg-secondary)] p-6">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold
            text-[var(--text-primary)]">
            Galería de fotos
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {items.length} foto
            {items.length !== 1 ? 's' : ''} subidas
          </p>
        </div>
        <button
          onClick={() =>
            showForm ? handleCloseForm() : setShowForm(true)}
          className="flex items-center gap-2 rounded-full
            bg-gold px-5 py-2.5 text-sm font-semibold
            text-surface-dark transition hover:brightness-110"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Añadir foto'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-gold/20
          bg-[var(--bg-card)] p-5">
          <p className="mb-4 text-sm font-semibold
            text-[var(--text-primary)]">Nueva foto</p>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex items-center gap-2 rounded-full
                px-4 py-2 text-sm font-semibold transition ${
                  uploadMode === 'file'
                    ? 'bg-gold text-surface-dark'
                    : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gold'
                }`}
            >
              <Upload size={14} />
              Desde mi equipo
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex items-center gap-2 rounded-full
                px-4 py-2 text-sm font-semibold transition ${
                  uploadMode === 'url'
                    ? 'bg-gold text-surface-dark'
                    : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gold'
                }`}
            >
              <Link size={14} />
              URL externa
            </button>
          </div>

          <form
            onSubmit={handleSubmit(handleCreate)}
            className="space-y-4"
          >
            {uploadMode === 'file' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {!filePreview ? (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center
                      justify-center gap-3 rounded-xl border-2
                      border-dashed border-[var(--border-color)]
                      bg-[var(--bg-secondary)] py-8 text-sm
                      text-[var(--text-muted)] transition
                      hover:border-gold hover:text-gold"
                  >
                    <Upload size={28} />
                    <span>Click para seleccionar imagen</span>
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
                        if (fileInputRef.current)
                          fileInputRef.current.value = ''
                      }}
                      className="absolute right-2 top-2 flex
                        h-8 w-8 items-center justify-center
                        rounded-full bg-black/60 text-white
                        hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()}
                      className="mt-2 w-full rounded-xl border
                        border-[var(--border-color)]
                        bg-[var(--bg-secondary)] py-2 text-xs
                        text-[var(--text-secondary)] transition
                        hover:border-gold hover:text-gold"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                )}
              </div>
            )}

            {uploadMode === 'url' && (
              <div>
                <label className="mb-1.5 block text-sm
                  font-medium text-[var(--text-primary)]">
                  URL de la imagen
                </label>
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-secondary)] px-4 py-3
                    text-sm text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    outline-none transition focus:border-gold"
                />
                {urlInput && (
                  <div className="mt-3 h-40 overflow-hidden
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm
                  font-medium text-[var(--text-primary)]">
                  Título
                </label>
                <input
                  {...register('title')}
                  placeholder="Fade Clásico"
                  className="w-full rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-secondary)] px-4 py-3
                    text-sm text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    outline-none transition focus:border-gold"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm
                  font-medium text-[var(--text-primary)]">
                  Categoría
                </label>
                <select
                  {...register('category')}
                  className="w-full rounded-xl border
                    border-[var(--border-color)]
                    bg-[var(--bg-secondary)] px-4 py-3
                    text-sm text-[var(--text-primary)]
                    outline-none transition focus:border-gold"
                >
                  <option value="cortes">Cortes</option>
                  <option value="barba">Barba</option>
                  <option value="todos">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm
                font-medium text-[var(--text-primary)]">
                Orden
                <span className="ml-1 text-xs font-normal
                  text-[var(--text-muted)]">
                  (menor número aparece primero)
                </span>
              </label>
              <input
                {...register('order')}
                type="number"
                min="0"
                placeholder="0"
                className="w-full rounded-xl border
                  border-[var(--border-color)]
                  bg-[var(--bg-secondary)] px-4 py-3
                  text-sm text-[var(--text-primary)]
                  outline-none transition focus:border-gold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gold py-3
                text-sm font-semibold text-surface-dark
                transition hover:brightness-110
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center
                  justify-center gap-2">
                  <span className="h-4 w-4 animate-spin
                    rounded-full border-2
                    border-t-surface-dark
                    border-surface-dark/30" />
                  Subiendo...
                </span>
              ) : 'Añadir a la galería'}
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2
          lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse
              rounded-2xl bg-[var(--bg-tertiary)] h-48" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="py-12 text-center">
          <Image size={32} className="mx-auto mb-3
            text-[var(--text-muted)] opacity-40" />
          <p className="text-sm text-[var(--text-muted)]">
            No has subido fotos aún.
            Las fotos predeterminadas del Home se mantienen.
          </p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2
          lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="group overflow-hidden rounded-2xl
                border border-[var(--border-color)]
                transition hover:border-gold/30"
            >
              <div className="h-48 overflow-hidden
                bg-[var(--bg-tertiary)]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover
                    transition group-hover:scale-105
                    duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/400x300?text=Error'
                  }}
                />
              </div>
              <div className="flex items-center
                justify-between gap-2
                bg-[var(--bg-card)] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold
                    text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]
                    capitalize">
                    {item.category === 'todos'
                      ? 'General' : item.category}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className="flex h-8 w-8 shrink-0
                    items-center justify-center rounded-lg
                    bg-red-500/10 text-red-400 transition
                    hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deletingId === item._id ? (
                    <span className="h-4 w-4 animate-spin
                      rounded-full border-2 border-t-red-400
                      border-red-400/30" />
                  ) : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
