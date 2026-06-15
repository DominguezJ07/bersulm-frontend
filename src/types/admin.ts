export interface AppointmentStats {
  total: number
  thisMonth: number
  byStatus: {
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

export interface AdminAppointment {
  _id: string
  userId: {
    _id?: string
    name: string
    email: string
  } | string
  serviceId: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalPrice?: number
  createdAt?: string
}

export interface AdminDashboardData {
  stats: AppointmentStats | null
  recentAppointments: AdminAppointment[]
  totalAppointments: number
  raffle: import('./reward').SorteoCurrentData | null
}
