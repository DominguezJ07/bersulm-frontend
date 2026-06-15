export interface Appointment {
  _id: string
  userId: string
  serviceId: string
  date: string
  time: string
  totalPrice?: number | string
  notes?: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  service?: import('./service').Service
}

export interface TimeSlot {
  time: string
  slot?: string
  available: boolean
}

export interface CreateAppointmentPayload {
  userId: string
  serviceId: string
  date: string
  time: string
  totalPrice?: number | string
  notes?: string
}
