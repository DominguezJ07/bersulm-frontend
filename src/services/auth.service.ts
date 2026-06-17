import api from '@/lib/api'
import type { LoginPayload, RegisterPayload, AuthResponse, ApiResponse, User } from '@/types'

export const authService = {
  login: async (credentials: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', payload)
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error del servidor al crear la cuenta')
    }
    return response.data
  },
  sendFcmToken: async (fcmToken: string): Promise<void> => {
    await api.post('/auth/fcm-token', { fcmToken })
  },
  updateProfile: async (data: {
    name: string
    phone?: string
  }): Promise<ApiResponse<User>> => {
    const response = await api.put('/auth/profile', data)
    return response.data
  },
  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.put('/auth/password', data)
    return response.data
  },
  updateAvatar: async (file: File): Promise<ApiResponse<User>> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
