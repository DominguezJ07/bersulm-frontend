import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout'
import { PrivateRoute } from './components/routes'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { AppointmentNotifications } from './components/AppointmentNotifications'
import { onForegroundMessage } from './lib/firebase'

const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Loyalty = lazy(() => import('./pages/Loyalty'))
const LoyaltyMinigame = lazy(() => import('./pages/Loyalty/Minigame'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))
const AdminDashboard = lazy(() => import('./pages/Admin'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
    </div>
  )
}

function App() {
  useEffect(() => {
    const unsubscribe = onForegroundMessage(({ title, body }) => {
      if (title || body) {
        toast(body || title || 'Nueva notificación', {
          icon: '🔔',
          duration: 5000,
        })
      }
    })
    return unsubscribe
  }, [])

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppointmentNotifications />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/servicios" element={<Services />} />
                  <Route path="/services" element={<Navigate to="/servicios" replace />} />

                  <Route
                    path="/reservas"
                    element={
                      <PrivateRoute>
                        <Appointments />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/appointments" element={<Navigate to="/reservas" replace />} />

                  <Route path="/premios" element={<Rewards />} />
                  <Route path="/rewards" element={<Navigate to="/premios" replace />} />

                  <Route
                    path="/fidelidad"
                    element={
                      <PrivateRoute>
                        <Loyalty />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/loyalty" element={<Navigate to="/fidelidad" replace />} />

                  <Route
                    path="/fidelidad/minijuego"
                    element={
                      <PrivateRoute>
                        <LoyaltyMinigame />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/loyalty/minigame" element={<Navigate to="/fidelidad/minijuego" replace />} />

                  <Route path="/ajustes" element={<Settings />} />
                  <Route path="/settings" element={<Navigate to="/ajustes" replace />} />

                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute adminOnly>
                        <AdminDashboard />
                      </PrivateRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
