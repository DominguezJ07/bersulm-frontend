import { createContext, useMemo, useState, useCallback } from 'react'
import { authService } from '@/services/auth.service'
import { setAuthToken } from '@/lib/api'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = Boolean(token)

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

      setToken(tokenValue)
      setUser(userData)
      setAuthToken(tokenValue)

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
        response?: { data?: { message?: string; error?: string; errors?: string[] } }
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

  const logout = useCallback(() => {
    localStorage.removeItem('bersulm_voted_reward')
    setToken(null)
    setUser(null)
    setAuthToken(null)
    import('@/lib/socket').then(({ disconnectSocket }) => disconnectSocket())
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
