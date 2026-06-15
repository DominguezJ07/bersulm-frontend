import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useUserAppointments } from '@/hooks/useUserAppointments'
import { authService } from '@/services/auth.service'
import { ROUTES } from '@/constants/routes'
import { Button, Card } from '@/components/ui'

const THEME_KEY = 'bersulm_theme'
const NOTIFICATIONS_KEY = 'bersulm_notifications'

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
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(date)
}

function formatTime(value: string | undefined): string {
  if (!value) return 'Hora pendiente'
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date)
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
  state?: string
  service?: string
  serviceName?: string
  title?: string
  date?: string
  schedule?: string
  datetime?: string
  time?: string
  hour?: string
}

const editProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  phone: z.string().optional(),
})

type EditProfileForm = z.infer<typeof editProfileSchema>

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const [notifications, setNotifications] = useState<NotificationSettings>({
    appointmentReminder: true,
    promotions: true,
  })
  const { appointments, isLoading: isLoadingAppointments } = useUserAppointments({ limit: 3 })

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const editProfileForm = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  })

  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const editProfileRef = useRef<HTMLDivElement>(null)
  const changePasswordRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setThemeMode(localStorage.getItem(THEME_KEY) || 'dark')

    const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY)
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    if (showEditProfile) {
      editProfileForm.reset({ name: user?.name || '', phone: user?.phone || '' })
    }
  }, [showEditProfile, user, editProfileForm])

  const handleEditProfileSubmit = async (data: EditProfileForm) => {
    try {
      await authService.updateProfile(data)
      updateUser(data)
      setShowEditProfile(false)
      toast.success('Perfil actualizado')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al actualizar el perfil'
      toast.error(msg)
    }
  }

  const handleChangePasswordSubmit = async (data: ChangePasswordForm) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setShowChangePassword(false)
      changePasswordForm.reset()
      toast.success('Contraseña actualizada')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al cambiar la contraseña'
      changePasswordForm.setError('currentPassword', { message: msg })
    }
  }

  const handleThemeToggle = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(nextTheme)
    localStorage.setItem(THEME_KEY, nextTheme)
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications((current) => {
      const updated = { ...current, [key]: !current[key] }
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = getInitials(user?.name, user?.email)
  const roleLabel = user?.role === 'admin' ? 'Administrador' : 'Cliente VIP'
  const userEmail = user?.email || 'usuario@bersulm.com'
  const userName = user?.name || 'Miembro BERSULM'

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 pb-24 pt-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Ajustes de cuenta</p>
          <h1 className="mt-3 text-3xl font-semibold">Configuración BERSULM</h1>
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            Gestiona tu perfil, notificaciones y reservas desde un solo lugar.
          </p>
        </header>

        <Card className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-3xl font-bold text-surface-dark shadow-[0_10px_30px_rgba(245,166,35,0.25)]">
                {initials}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-gold">Perfil del usuario</p>
                <h2 className="mt-2 text-2xl font-semibold">{userName}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{userEmail}</p>
                <span className="mt-3 inline-flex rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                  {roleLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Button variant="primary" className="w-full sm:w-auto" onClick={() => setShowEditProfile(true)}>
                Editar Perfil
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setShowChangePassword(true)}>
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
              Cambia entre modo oscuro y modo claro para toda la app.
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
                    themeMode === 'light' ? 'bg-gold' : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <span
                    className={`inline-block h-9 w-9 rounded-full bg-white shadow transition-transform ${
                      themeMode === 'light' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
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
              <div className="flex items-center justify-between rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                <div>
                  <h3 className="text-lg font-semibold">Recordatorio de cita</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Recibe alertas antes de tu reserva.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('appointmentReminder')}
                  className={`relative inline-flex h-11 w-20 shrink-0 items-center rounded-full transition ${
                    notifications.appointmentReminder ? 'bg-gold' : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <span
                    className={`inline-block h-9 w-9 rounded-full bg-white shadow transition-transform ${
                      notifications.appointmentReminder ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                <div>
                  <h3 className="text-lg font-semibold">Novedades y promociones</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Recibe ofertas exclusivas y estrenos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('promotions')}
                  className={`relative inline-flex h-11 w-20 shrink-0 items-center rounded-full transition ${
                    notifications.promotions ? 'bg-gold' : 'bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <span
                    className={`inline-block h-9 w-9 rounded-full bg-white shadow transition-transform ${
                      notifications.promotions ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">Mis reservas</p>
              <h2 className="mt-3 text-2xl font-semibold">Últimas 3 reservas</h2>
            </div>
            <Button variant="secondary" onClick={() => navigate(ROUTES.RESERVAS)}>Ver todas</Button>
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
                  appointment.status || appointment.state || 'pending',
                ).toLowerCase()
                const badgeClass =
                  statusBadgeClasses[status] || 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                const key = appointment.id || appointment._id || index
                return (
                  <div
                    key={key}
                    className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-gold">Servicio</p>
                        <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                          {appointment.service ||
                            appointment.serviceName ||
                            appointment.title ||
                            'Servicio pendiente'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-[var(--bg-card)] p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-gold">Fecha</p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {formatDate(
                            appointment.date ||
                              appointment.schedule ||
                              appointment.datetime,
                          )}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-[var(--bg-card)] p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-gold">Hora</p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {formatTime(
                            appointment.time ||
                              appointment.hour ||
                              appointment.datetime,
                          )}
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
            <Button variant="secondary" className="w-full sm:w-auto" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
            <Button variant="primary" className="w-full sm:w-auto" onClick={() => setShowChangePassword(true)}>
              Cambiar Contraseña
            </Button>
          </div>
        </Card>
      </div>

      {showEditProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditProfile(false)
          }}
        >
          <div
            ref={editProfileRef}
            className="mx-4 w-full max-w-md rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Editar Perfil</h2>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editProfileForm.handleSubmit(handleEditProfileSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">Nombre</label>
                <input
                  {...editProfileForm.register('name')}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-gold"
                />
                {editProfileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-400">{editProfileForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">Teléfono</label>
                <input
                  {...editProfileForm.register('phone')}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-gold"
                />
              </div>

              <button
                type="submit"
                disabled={editProfileForm.formState.isSubmitting}
                className="w-full rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-surface-dark transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {editProfileForm.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowChangePassword(false)
          }}
        >
          <div
            ref={changePasswordRef}
            className="mx-4 w-full max-w-md rounded-[24px] border border-gold/20 bg-[var(--bg-secondary)] p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={changePasswordForm.handleSubmit(handleChangePasswordSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">Contraseña actual</label>
                <input
                  type="password"
                  {...changePasswordForm.register('currentPassword')}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-gold"
                />
                {changePasswordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-xs text-red-400">{changePasswordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">Nueva contraseña</label>
                <input
                  type="password"
                  {...changePasswordForm.register('newPassword')}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-gold"
                />
                {changePasswordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-red-400">{changePasswordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  {...changePasswordForm.register('confirmPassword')}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-gold"
                />
                {changePasswordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{changePasswordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={changePasswordForm.formState.isSubmitting}
                className="w-full rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-surface-dark transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {changePasswordForm.formState.isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
