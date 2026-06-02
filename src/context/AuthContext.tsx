import { createContext, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { STORAGE_KEYS } from '@/constants/storage'
import type { User, LoginPayload, RegisterPayload } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(STORAGE_KEYS.USER, null),
  )
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.TOKEN),
  )
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  const persistAuth = useCallback(
    (newToken: string, newUser: User) => {
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
    },
    [],
  )

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    try {
      const response = await authService.login(payload)
      const data = response?.data
      const tokenValue = data?.token || (data as unknown as { accessToken?: string })?.accessToken
      const userData = data?.user

      if (!tokenValue || !userData) {
        throw new Error('Respuesta de login inválida')
      }

      persistAuth(tokenValue, userData)
    } finally {
      setIsLoading(false)
    }
  }, [persistAuth])

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      await authService.register(payload)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } }
      throw new Error(apiError?.response?.data?.message || 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setToken(null)
    setUser(null)
  }, [])

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
    [user, token, isAuthenticated, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
