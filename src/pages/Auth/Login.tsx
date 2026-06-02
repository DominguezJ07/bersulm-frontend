import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui'
import logoBersulm from '@/assets/logo-bersulm.svg'
import { ROUTES } from '@/constants/routes'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')
    try {
      await login(data)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname
      const validRedirects = [ROUTES.APPOINTMENTS, ROUTES.LOYALTY, ROUTES.SETTINGS]
      const redirectTo = from && validRedirects.includes(from as typeof validRedirects[number]) ? from : '/'
      navigate(redirectTo as string, { replace: true })
    } catch {
      setServerError('Credenciales incorrectas')
    }
  }

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión | BERSULM</title>
      </Helmet>
      <main className="flex min-h-screen items-center justify-center bg-surface-dark px-6 py-10 text-white">
        <div className="w-full max-w-md rounded-[32px] border border-[#3b2b1e] bg-[#2a1f0e] p-8 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <img src={logoBersulm} alt="BERSULM" className="h-20 w-20 object-contain" />
            <div>
              <h1 className="text-3xl font-semibold">Bienvenido de vuelta</h1>
              <p className="mt-2 text-sm text-[#bfbfbf]">
                Ingresa con tu cuenta para reservar tu servicio.
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
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
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
              {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#cccccc]">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-gold hover:text-white">
              Regístrate
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
