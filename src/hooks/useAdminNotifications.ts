import { useState, useCallback, useEffect } from 'react'
import { onSocketEvent } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'

const STORAGE_KEY = 'bersulm_admin_notifications'
const MAX_NOTIFICATIONS = 50

export interface AdminNotification {
  id: string
  type: 'new_appointment' | 'cancelled_appointment' | 'completed_appointment'
  title: string
  message: string
  timestamp: string
  read: boolean
  appointmentId?: string
  data?: Record<string, unknown>
}

function loadFromStorage(): AdminNotification[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage(notifications: AdminNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch {
    // ignorar errores de storage
  }
}

export function useAdminNotifications() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [notifications, setNotifications] =
    useState<AdminNotification[]>(loadFromStorage)

  useEffect(() => {
    saveToStorage(notifications)
  }, [notifications])

  const addNotification = useCallback(
    (notification: Omit<AdminNotification,
      'id' | 'timestamp' | 'read'>) => {
      setNotifications((prev: AdminNotification[]) => {
        const newItem: AdminNotification = {
          ...notification,
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          read: false,
        }
        return [newItem, ...prev.slice(0, MAX_NOTIFICATIONS - 1)]
      })
    },
    []
  )

  const removeByAppointmentId = useCallback(
    (appointmentId: string) => {
      setNotifications((prev: AdminNotification[]) =>
        prev.filter(
          (n: AdminNotification) =>
            n.appointmentId !== appointmentId
        )
      )
    },
    []
  )

  const markAllRead = useCallback(() => {
    setNotifications((prev: AdminNotification[]) =>
      prev.map((n: AdminNotification) => ({ ...n, read: true }))
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (!token || !isAdmin) return

    const unsubCreated = onSocketEvent(
      'appointment:created',
      (data: unknown) => {
        const d = data as {
          _id?: string
          userId?: { name?: string }
          serviceId?: { name?: string }
          date?: string
          time?: string
        }
        const clientName =
          typeof d.userId === 'object' && d.userId?.name
            ? d.userId.name
            : 'Un cliente'
        const serviceName =
          typeof d.serviceId === 'object' && d.serviceId?.name
            ? d.serviceId.name
            : 'un servicio'

        addNotification({
          type: 'new_appointment',
          title: '📅 Nueva reserva',
          message: `${clientName} reservó ${serviceName} para el ${d.date} a las ${d.time}`,
          appointmentId: d._id,
          data: d as Record<string, unknown>,
        })
      }
    )

    const unsubCancelled = onSocketEvent(
      'appointment:cancelled',
      (data: unknown) => {
        const d = data as {
          _id?: string
          userId?: { name?: string }
          serviceId?: { name?: string }
          date?: string
          time?: string
        }
        const clientName =
          typeof d.userId === 'object' && d.userId?.name
            ? d.userId.name
            : 'Un cliente'
        const serviceName =
          typeof d.serviceId === 'object' && d.serviceId?.name
            ? d.serviceId.name
            : 'un servicio'

        addNotification({
          type: 'cancelled_appointment',
          title: '❌ Reserva cancelada',
          message: `${clientName} canceló ${serviceName} del ${d.date} a las ${d.time}`,
          appointmentId: d._id,
          data: d as Record<string, unknown>,
        })
      }
    )

    const unsubCompleted = onSocketEvent(
      'appointment:completed',
      (data: unknown) => {
        const d = data as { appointmentId?: string }
        if (d.appointmentId) {
          removeByAppointmentId(d.appointmentId)
        }
      }
    )

    return () => {
      unsubCreated()
      unsubCancelled()
      unsubCompleted()
    }
  }, [token, isAdmin, addNotification, removeByAppointmentId])

  const unreadCount = notifications.filter(
    (n: AdminNotification) => !n.read
  ).length

  return {
    notifications,
    unreadCount,
    markAllRead,
    clearAll,
  }
}