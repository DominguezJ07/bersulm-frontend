import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth.service'
import { Button, Card } from '@/components/ui'
import toast from 'react-hot-toast'
import { Camera, X, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'

const THEME_KEY = 'bersulm_theme'
const NOTIFICATIONS_KEY = 'bersulm_notifications'

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la contraseña'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-[#22c55e]/15 text-[#22c55e]',
  cancelled: 'bg-[#ef4444]/15 text-[#ef4444]',
  completed: 'bg-[#0ea5e9]/15 text-[#0ea5e9]',
}

function formatDate(value: string | undefined): string {
  if (!value) return 'Fecha pendiente'
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium'
  }).format(date)
}

function formatTime(value: string | undefined): string {
  if (!value) return 'Hora pendiente'
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getInitials(name?: string, email?: string) {
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('')
  }
  return email?.slice(0, 2).toUpperCase() || 'BS'
}

interface NotificationSettings {
  appointmentReminder: boolean
  promotions: boolean
}

interface AppointmentItem {
  _id?: string
  id?: string
  status?: string
  service?: string
  serviceName?: string
  date?: string
  time?: string
}

export default function Settings() {
  const { user, token, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem(THEME_KEY) || 'dark'
  )

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      appointmentReminder: true,
      promotions: true,
    })

  const [appointments, setAppointments] =
    useState<AppointmentItem[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] =
    useState(true)

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar || null
  )
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    setThemeMode(localStorage.getItem(THEME_KEY) || 'dark')
    const saved = localStorage.getItem(NOTIFICATIONS_KEY)
    if (saved) {
      try {
        setNotifications(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    )
  }, [notifications])

  useEffect(() => {
    if (!token) {
      setAppointments([])
      setIsLoadingAppointments(false)
      return
    }
    const controller = new AbortController()
    const load = async () => {
      setIsLoadingAppointments(true)
      try {
        const response = await api.get('/appointments/user', {
          signal: controller.signal,
        })
        const data =
          response.data?.data || response.data || []
        setAppointments(
          Array.isArray(data) ? data.slice(0, 3) : []
        )
      } catch {
        if (!controller.signal.aborted) setAppointments([])
      } finally {
        if (!controller.signal.aborted)
          setIsLoadingAppointments(false)
      }
    }
    load()
    return () => controller.abort()
  }, [token])

  useEffect(() => {
    if (showEditProfile) {
      profileForm.reset({
        name: user?.name || '',
        phone: user?.phone || '',
      })
    }
  }, [showEditProfile, user, profileForm])

  useEffect(() => {
    setAvatarPreview(user?.avatar || null)
  }, [user?.avatar])

  const handleThemeToggle = () => {
    const next = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(next)
    localStorage.setItem(THEME_KEY, next)
    if (next === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }

  const handleNotificationToggle = (
    key: keyof NotificationSettings
  ) => {
    setNotifications((current) => {
      const updated = { ...current, [key]: !current[key] }
      localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(updated)
      )
      return updated
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploadingAvatar(true)
    try {
      const response = await authService.updateAvatar(file)
      const updatedUser = response.data
      if (updatedUser) {
        updateUser(updatedUser)
        toast.success('Foto de perfil actualizada')
      }
    } catch {
      toast.error('Error al subir la imagen')
      setAvatarPreview(user?.avatar || null)
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      const response = await authService.updateProfile(data)
      const updatedUser = response.data
      if (updatedUser) updateUser(updatedUser)
      toast.success('Perfil actualizado correctamente')
      setShowEditProfile(false)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        || 'Error al actualizar el perfil'
      toast.error(msg)
    }
  }

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Contraseña actualizada correctamente')
      setShowChangePassword(false)
      passwordForm.reset()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        || 'Error al cambiar la contraseña'
      passwordForm.setError('currentPassword', { message: msg })
    }
  }

  const initials = getInitials(user?.name, user?.email)
  const roleLabel =
    user?.role === 'admin' ? 'Administrador' : 'Cliente VIP'

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">

      {/* Modal Editar Perfil */}
      {showEditProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setShowEditProfile(false)}
        >
          <div className="w-full max-w-md rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Mi cuenta</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                  Editar perfil
                </h2>
              </div>
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-gold hover:text-gold"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Nombre completo
                </label>
                <input
                  {...profileForm.register('name')}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-gold"
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Teléfono
                  <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">(opcional)</span>
                </label>
                <input
                  {...profileForm.register('phone')}
                  type="tel"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-gold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-gold hover:text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                  className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-surface-dark transition hover:brightness-110 disabled:opacity-60"
                >
                  {profileForm.formState.isSubmitting
                    ? 'Guardando...'
                    : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {showChangePassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setShowChangePassword(false)}
        >
          <div className="w-full max-w-md rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Seguridad</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                  Cambiar contraseña
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowChangePassword(false)
                  passwordForm.reset()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition hover:border-gold hover:text-gold"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register('currentPassword')}
                    type={showCurrentPw ? 'text' : 'password'}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] outline-none transition focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-gold"
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register('newPassword')}
                    type={showNewPw ? 'text' : 'password'}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] outline-none transition focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-gold"
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type={showConfirmPw ? 'text' : 'password'}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] outline-none transition focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-gold"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false)
                    passwordForm.reset()
                  }}
                  className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-gold hover:text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-surface-dark transition hover:brightness-110 disabled:opacity-60"
                >
                  {passwordForm.formState.isSubmitting
                    ? 'Cambiando...'
                    : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-10">

        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Ajustes de cuenta</p>
          <h1 className="mt-3 text-3xl font-semibold">
            Configuración BERSULM
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            Gestiona tu perfil, notificaciones y reservas desde un solo lugar.
          </p>
        </header>

        {/* Card de perfil con foto */}
        <Card className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">

              {/* Avatar con botón de cambio */}
              <div className="relative shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gold/30 shadow-[0_10px_30px_rgba(245,166,35,0.25)]">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user?.name || 'Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gold text-3xl font-bold text-surface-dark">
                      {initials}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--bg-primary)] bg-gold text-surface-dark transition hover:brightness-110 disabled:opacity-60"
                  title="Cambiar foto de perfil"
                >
                  {isUploadingAvatar ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-surface-dark border-surface-dark/30" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-gold">Perfil del usuario</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {user?.name || 'Miembro BERSULM'}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {user.phone}
                  </p>
                )}
                <span className="mt-3 inline-flex rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => setShowEditProfile(true)}
              >
                Editar Perfil
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setShowChangePassword(true)}
              >
                Cambiar Contraseña
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Apariencia</p>
            <h2 className="mt-3 text-2xl font-semibold">Tema de la aplicación</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Cambia entre modo oscuro y modo claro.
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                <div>
                  <h3 className="text-lg font-semibold">Modo Claro</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Activa el modo claro para tonos más suaves.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-11 w-20 shrink-0 items-center rounded-full transition ${
                    themeMode === 'light'
                      ? 'bg-gold'
                      : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <span className={`inline-block h-9 w-9 rounded-full bg-white shadow transition-transform ${
                    themeMode === 'light'
                      ? 'translate-x-9'
                      : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Notificaciones</p>
            <h2 className="mt-3 text-2xl font-semibold">Alertas y novedades</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Controla tus recordatorios y promociones.
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  key: 'appointmentReminder' as const,
                  title: 'Recordatorio de cita',
                  desc: 'Recibe alertas antes de tu reserva.',
                },
                {
                  key: 'promotions' as const,
                  title: 'Novedades y promociones',
                  desc: 'Recibe ofertas exclusivas.',
                },
              ].map(({ key, title, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle(key)}
                    className={`relative inline-flex h-11 w-20 shrink-0 items-center rounded-full transition ${
                      notifications[key] ? 'bg-gold' : 'bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <span className={`inline-block h-9 w-9 rounded-full bg-white shadow transition-transform ${
                      notifications[key] ? 'translate-x-9' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Mis reservas</p>
              <h2 className="mt-3 text-2xl font-semibold">Últimas reservas</h2>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/reservas')}
            >
              Ver todas
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {isLoadingAppointments ? (
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center text-sm text-[var(--text-secondary)]">
                Cargando tus reservas...
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center text-sm text-[var(--text-secondary)]">
                No se encontraron reservas recientes.
              </div>
            ) : (
              appointments.map((appointment, index) => {
                const status = String(
                  appointment.status || 'pending'
                ).toLowerCase()
                const badgeClass =
                  statusBadgeClasses[status] ||
                  'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                const key =
                  appointment.id ||
                  appointment._id ||
                  index
                return (
                  <div key={key} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-gold">
                          Servicio
                        </p>
                        <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                          {appointment.serviceName ||
                            appointment.service ||
                            'Servicio pendiente'}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}>
                        {status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-3xl bg-[var(--bg-card)] p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-gold">
                          Fecha
                        </p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {formatDate(appointment.date)}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-[var(--bg-card)] p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-gold">
                          Hora
                        </p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        <Card className="p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Cuenta</p>
          <h2 className="mt-3 text-2xl font-semibold">Acciones de la cuenta</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Cierra sesión o prepara tu acceso seguro.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => setShowChangePassword(true)}
            >
              Cambiar Contraseña
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
