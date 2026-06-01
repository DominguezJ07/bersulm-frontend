import { createContext, useMemo, useState } from 'react'

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bersulm_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('bersulm_token') || null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('bersulm_token'))
  })

  const [isLoading] = useState(false)

  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión')
    }

    const tokenValue = data?.data?.token || data.token
    const userData = data?.data?.user || data.user || { email }

    localStorage.setItem('bersulm_token', tokenValue)
    localStorage.setItem('bersulm_user', JSON.stringify(userData))

    setToken(tokenValue)
    setUser(userData)
    setIsAuthenticated(true)

    return data
  }

  const register = async (name, email, phone, password) => {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo crear la cuenta')
    }

    const tokenValue = data?.data?.token || data.token
    const userData = data?.data?.user || data.user || { name, email }

    localStorage.setItem('bersulm_token', tokenValue)
    localStorage.setItem('bersulm_user', JSON.stringify(userData))

    setToken(tokenValue)
    setUser(userData)
    setIsAuthenticated(true)

    return data
  }

  const logout = () => {
    localStorage.removeItem('bersulm_token')
    localStorage.removeItem('bersulm_user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isAuthenticated, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
