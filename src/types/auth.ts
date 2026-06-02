export interface User {
  _id: string
  id?: string
  name: string
  email: string
  phone?: string
  role?: 'user' | 'admin'
  isAdmin?: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}
