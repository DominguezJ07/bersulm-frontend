import { createContext, useEffect, useMemo, useState, useCallback } from 'react'
import { authService } from '@/services/auth.service'
import { setAuthToken } from '@/lib/api'
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
  updateUser: (userData: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  })
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  // Configurar axios con el token guardado al montar
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (savedToken) {
      setAuthToken(savedToken)
    }
  }, [])

  // Conectar socket al montar si ya hay sesión activa
  // Esto es CRÍTICO para que las notificaciones funcionen
  // después de recargar la página sin hacer login de nuevo
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        const userId = userData._id || userData.id || ''
        if (userId) {
          import('@/lib/socket').then(({ connectSocket }) => {
            connectSocket(savedToken, userId)
          })
        }
      } catch {
        // ignorar error de parse
      }
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    try {
      const response = await authService.login(payload)
      const data = response?.data
      const tokenValue =
        data?.token ||
        (data as unknown as { accessToken?: string })?.accessToken
      const userData = data?.user

      if (!tokenValue || !userData) {
        throw new Error('Respuesta de login inválida')
      }

      const refreshToken = (data as { refreshToken?: string }).refreshToken
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      }

      setToken(tokenValue)
      setUser(userData)
      setAuthToken(tokenValue)

      localStorage.setItem(STORAGE_KEYS.TOKEN, tokenValue)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))

      const userId = userData._id || userData.id || ''
      const { connectSocket } = await import('@/lib/socket')
      connectSocket(tokenValue, userId)

      try {
        const { requestFcmToken } = await import('@/lib/firebase')
        const fcmToken = await requestFcmToken()
        if (fcmToken) {
          await authService.sendFcmToken(fcmToken)
        }
      } catch { /* FCM not critical */ }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      await authService.register(payload)
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string
            error?: string
            errors?: string[]
          }
        }
        message?: string
      }
      const msg =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        apiError?.response?.data?.errors?.[0] ||
        apiError?.message ||
        'Error al conectar con el servidor'
      throw new Error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...userData }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem('bersulm_voted_reward')
    setToken(null)
    setUser(null)
    setAuthToken(null)
    import('@/lib/socket').then(({ disconnectSocket }) =>
      disconnectSocket()
    )
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
      updateUser,
    }),
    [user, token, isAuthenticated, isLoading,
     login, register, logout, updateUser],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
