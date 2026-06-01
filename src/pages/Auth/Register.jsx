import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import logoBersulm from '../../assets/logo-bersulm.svg'

export default function Register() {
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(name, email, phone, password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-app px-6 py-10 text-app flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--border)] bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={logoBersulm} alt="BERSULM" className="h-20 w-20 object-contain" />
          <div>
            <h1 className="text-3xl font-semibold">Crea tu cuenta</h1>
            <p className="mt-2 text-sm text-app-secondary">Regístrate para comenzar a reservar tus servicios.</p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && <div className="rounded-3xl bg-[#7f1d1d] px-4 py-3 text-sm text-[#ffb3b3]">{error}</div>}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-secondary">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Tu nombre"
              className="w-full rounded-[28px] border border-[var(--border)] bg-app px-5 py-3 text-app outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="correo@ejemplo.com"
              className="w-full rounded-[28px] border border-[var(--border)] bg-app px-5 py-3 text-app outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-secondary">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="+34 600 000 000"
              className="w-full rounded-[28px] border border-[var(--border)] bg-app px-5 py-3 text-app outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-secondary">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="********"
              className="w-full rounded-[28px] border border-[var(--border)] bg-app px-5 py-3 text-app outline-none transition focus:border-[var(--gold)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--gold)] px-6 py-3 text-base font-semibold text-[var(--bg-primary)] transition hover:bg-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-app-secondary">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-[var(--gold)] hover:text-app">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
