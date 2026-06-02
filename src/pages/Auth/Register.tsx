import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui'
import logoBersulm from '@/assets/logo-bersulm.svg'

const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError('')
    try {
      await registerUser(data)
      navigate('/login', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ocurrió un error al crear la cuenta')
    }
  }

  return (
    <>
      <Helmet>
        <title>Crear Cuenta | BERSULM</title>
      </Helmet>
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)]">
        <div className="w-full max-w-md rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <img src={logoBersulm} alt="BERSULM" className="h-20 w-20 object-contain" />
            <div>
              <h1 className="text-3xl font-semibold">Crea tu cuenta</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Regístrate para comenzar a reservar tus servicios.
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="rounded-3xl bg-[#7f1d1d] px-4 py-3 text-sm text-[#ffb3b3]">
                {serverError}
              </div>
            )}

            <Input
              label="Nombre"
              type="text"
              placeholder="Tu nombre"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Teléfono"
              type="tel"
              placeholder="+34 600 000 000"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="********"
              error={errors.password?.message}
              {...register('password')}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gold px-6 py-3 text-base font-semibold text-surface-dark transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-gold hover:text-[var(--text-primary)]">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
