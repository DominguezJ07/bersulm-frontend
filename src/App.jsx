import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import Appointments from './pages/Appointments'
import Rewards from './pages/Rewards'
import Loyalty from './pages/Loyalty'
import Settings from './pages/Settings'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import PrivateRoute from './components/routes/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

            <Route path="/ajustes" element={<Settings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
