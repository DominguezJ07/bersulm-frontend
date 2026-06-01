import { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import logoBersulm from '../../assets/logo-bersulm.svg'
import { ROUTES } from '../../constants/routes'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      const from = location.state?.from?.pathname
      const validRedirects = [ROUTES.APPOINTMENTS, ROUTES.LOYALTY, ROUTES.SETTINGS]
      const redirectTo = validRedirects.includes(from) ? from : '/'
      navigate(redirectTo, { replace: true })
    } catch (_err) {
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1208] px-6 py-10 text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-[#3b2b1e] bg-[#2a1f0e] p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={logoBersulm} alt="BERSULM" className="h-20 w-20 object-contain" />
          <div>
            <h1 className="text-3xl font-semibold">Bienvenido de vuelta</h1>
            <p className="mt-2 text-sm text-[#bfbfbf]">Ingresa con tu cuenta para reservar tu servicio.</p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && <div className="rounded-3xl bg-[#7f1d1d] px-4 py-3 text-sm text-[#ffb3b3]">{error}</div>}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#cccccc]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="correo@ejemplo.com"
              className="w-full rounded-[28px] border border-[#3b2b1e] bg-[#1a1208] px-5 py-3 text-white outline-none transition focus:border-[#f5a623]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#cccccc]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="********"
              className="w-full rounded-[28px] border border-[#3b2b1e] bg-[#1a1208] px-5 py-3 text-white outline-none transition focus:border-[#f5a623]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#f5a623] px-6 py-3 text-base font-semibold text-[#1a1208] transition hover:bg-[#d18d14] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#cccccc]">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-[#f5a623] hover:text-white">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  )
}
