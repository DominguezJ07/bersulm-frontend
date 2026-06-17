import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { onSocketEvent } from '@/lib/socket'
import toast from 'react-hot-toast'
import { PostCompletionReviewModal } from './PostCompletionReviewModal'

interface PendingReview {
  appointmentId: string
  serviceName: string
  date: string
  time: string
}

export function AppointmentNotifications() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const queryClient = useQueryClient()
  const [pendingReview, setPendingReview] =
    useState<PendingReview | null>(null)

  useEffect(() => {
    if (!token) return

    // Nueva reserva — solo admin
    const unsubCreated = onSocketEvent(
      'appointment:created',
      (data: unknown) => {
        if (!isAdmin) return

        const d = data as {
          userId?: { name?: string; email?: string }
          serviceId?: { name?: string; price?: number }
          date?: string
          time?: string
        }

        const clientName =
          typeof d.userId === 'object' && d.userId?.name
            ? d.userId.name : 'Un cliente'

        const serviceName =
          typeof d.serviceId === 'object' && d.serviceId?.name
            ? d.serviceId.name : 'un servicio'

        const price =
          typeof d.serviceId === 'object' && d.serviceId?.price
            ? `$${Number(d.serviceId.price).toLocaleString('es-CO')}`
            : ''

        toast(
          (t) => (
            <div
              onClick={() => toast.dismiss(t.id)}
              style={{ cursor: 'pointer' }}
            >
              <p style={{
                fontWeight: 'bold',
                marginBottom: '6px',
                color: '#f5a623',
                fontSize: '15px'
              }}>
                📅 Nueva reserva
              </p>
              <p style={{ margin: '3px 0', fontSize: '13px' }}>
                <strong>Cliente:</strong> {clientName}
              </p>
              <p style={{ margin: '3px 0', fontSize: '13px' }}>
                <strong>Servicio:</strong> {serviceName}
                {price && ` · ${price}`}
              </p>
              <p style={{ margin: '3px 0', fontSize: '13px' }}>
                <strong>Fecha:</strong> {d.date}
              </p>
              <p style={{ margin: '3px 0', fontSize: '13px' }}>
                <strong>Hora:</strong> {d.time}
              </p>
              <p style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#888'
              }}>
                Toca para cerrar
              </p>
            </div>
          ),
          {
            duration: 15000,
            style: {
              background: '#1a1209',
              color: '#fff',
              border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: '16px',
              padding: '16px',
              maxWidth: '320px',
            },
            icon: null,
          }
        )

        queryClient.invalidateQueries({
          queryKey: ['admin-appointments-recent']
        })
        queryClient.invalidateQueries({
          queryKey: ['admin-stats']
        })
      }
    )

    // Cita confirmada — solo cliente
    const unsubConfirmed = onSocketEvent(
      'appointment:confirmed',
      (data: unknown) => {
        if (isAdmin) return
        const d = data as { date?: string; time?: string }
        toast.success(
          `✅ Cita confirmada para el ${d.date} a las ${d.time}`,
          { duration: 6000 }
        )
        queryClient.invalidateQueries({
          queryKey: ['appointments']
        })
      }
    )

    // Cita completada — solo cliente
    const unsubCompleted = onSocketEvent(
      'appointment:completed',
      (data: unknown) => {
        if (isAdmin) return
        const d = data as {
          appointmentId?: string
          serviceName?: string
          date?: string
          time?: string
        }

        toast.success(
          '⭐ ¡Tu cita ha sido completada!',
          { duration: 3000 }
        )

        setTimeout(() => {
          setPendingReview({
            appointmentId: d.appointmentId || '',
            serviceName: d.serviceName || 'tu servicio',
            date: d.date || '',
            time: d.time || '',
          })
        }, 1000)

        queryClient.invalidateQueries({
          queryKey: ['appointments']
        })
      }
    )

    // Cita cancelada por admin — solo cliente
    const unsubCancelledByAdmin = onSocketEvent(
      'appointment:cancelled-by-admin',
      (data: unknown) => {
        if (isAdmin) return
        const d = data as { date?: string; time?: string }
        toast.error(
          `❌ Tu cita del ${d.date} a las ${d.time} fue cancelada`,
          { duration: 8000 }
        )
        queryClient.invalidateQueries({
          queryKey: ['appointments']
        })
      }
    )

    return () => {
      unsubCreated()
      unsubConfirmed()
      unsubCompleted()
      unsubCancelledByAdmin()
    }
  }, [token, isAdmin, queryClient])

  return (
    <>
      {pendingReview && (
        <PostCompletionReviewModal
          appointmentId={pendingReview.appointmentId}
          serviceName={pendingReview.serviceName}
          date={pendingReview.date}
          time={pendingReview.time}
          onClose={() => setPendingReview(null)}
        />
      )}
    </>
  )
}