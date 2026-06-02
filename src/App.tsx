import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout'
import { PrivateRoute } from './components/routes'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Loyalty = lazy(() => import('./pages/Loyalty'))
const LoyaltyMinigame = lazy(() => import('./pages/Loyalty/Minigame'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Register = lazy(() => import('./pages/Auth/Register'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-gold border-gray-700" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/servicios" element={<Services />} />
                  <Route path="/services" element={<Services />} />

                  <Route
                    path="/reservas"
                    element={
                      <PrivateRoute>
                        <Appointments />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <PrivateRoute>
                        <Appointments />
                      </PrivateRoute>
                    }
                  />

                  <Route path="/premios" element={<Rewards />} />
                  <Route path="/rewards" element={<Rewards />} />

                  <Route
                    path="/fidelidad"
                    element={
                      <PrivateRoute>
                        <Loyalty />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/loyalty"
                    element={
                      <PrivateRoute>
                        <Loyalty />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/fidelidad/minijuego"
                    element={
                      <PrivateRoute>
                        <LoyaltyMinigame />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/loyalty/minigame"
                    element={
                      <PrivateRoute>
                        <LoyaltyMinigame />
                      </PrivateRoute>
                    }
                  />

                  <Route path="/ajustes" element={<Settings />} />
                  <Route path="/settings" element={<Settings />} />
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
