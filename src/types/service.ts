export interface Service {
  _id: string
  id?: string
  name: string
  title?: string
  description?: string
  desc?: string
  price: number | string
  cost?: string
  durationMin?: number
  duration?: number
  length?: number
  duration_minutes?: number
  category?: 'corte' | 'barba' | 'color' | 'extra' | string
  image?: string
  icon?: string
  isActive?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}
