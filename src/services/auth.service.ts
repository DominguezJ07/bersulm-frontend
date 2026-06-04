import api from '@/lib/api'
import type { LoginPayload, RegisterPayload, AuthResponse, ApiResponse } from '@/types'

export const authService = {
  login: async (credentials: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', payload)
    return response.data
  },
  sendFcmToken: async (fcmToken: string): Promise<void> => {
    await api.post('/auth/fcm-token', { fcmToken })
  },
}
