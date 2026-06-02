import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { useAuth } from '@/hooks/useAuth'
import { appointmentsService } from '@/services/appointments.service'
import { formatISODate } from '@/lib/format'
import type { Service, TimeSlot } from '@/types'

export function useAppointmentFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<unknown>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')

  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices()

  useEffect(() => {
    if (location.state?.selectedService) {
      setSelectedService(location.state.selectedService as Service)
    }
  }, [location.state])

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }

    let mounted = true
    async function loadSlots() {
      setSlotsLoading(true)
      try {
        const date = formatISODate(selectedDate)
        if (!date) return
        const res = await appointmentsService.getAvailableSlots(date)
        const raw = res.data
        if (!mounted) return
        const normalized = Array.isArray(raw)
          ? raw.map((s) => {
              if (typeof s === 'string') return { time: s, available: true }
              return {
                time: s.time || s.slot || '',
                available: s.available !== false,
              }
            })
          : []
        setSlots(normalized)
      } catch {
        if (mounted) setRequestError('Error cargando horarios')
      } finally {
        if (mounted) setSlotsLoading(false)
      }
    }

    loadSlots()
    return () => {
      mounted = false
    }
  }, [selectedDate])

  const handleNext = useCallback(() => {
    if (step === 0 && selectedService) {
      setStep(1)
    } else if (step === 1 && selectedDate && selectedTime) {
      setStep(2)
    }
  }, [step, selectedService, selectedDate, selectedTime])

  const handleBack = useCallback(() => {
    if (confirmed) {
      setConfirmed(false)
      setStep(0)
      return
    }
    if (step > 0) {
      setStep(step - 1)
    }
  }, [confirmed, step])

  const resetFlow = useCallback(() => {
    setConfirmed(false)
    setStep(0)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime('')
    setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    setSlots([])
    setRequestError('')
  }, [])

  const handleConfirm = useCallback(async () => {
    setRequestError('')
    const token = localStorage.getItem('bersulm_token')
    const savedUser = localStorage.getItem('bersulm_user')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!token || !user) {
      navigate('/login', { state: { from: location } })
      return
    }

    try {
      setSubmitting(true)
      const result = await appointmentsService.createAppointment({
        userId: user._id || user.id,
        serviceId: selectedService?._id || selectedService?.id || '',
        date: formatISODate(selectedDate) || '',
        time: selectedTime,
        totalPrice: selectedService?.price,
        notes: '',
      })
      setConfirmed(true)
      setConfirmedBooking(result.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      const msg = error?.response?.data?.message || error?.message || 'Error al crear la reserva'
      if (error?.response?.status === 409 || /taken|ocupad|no disponible|409/i.test(msg)) {
        setRequestError('Este horario ya no está disponible')
      } else {
        setRequestError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }, [navigate, location, selectedService, selectedDate, selectedTime])

  const canContinueStep1 = Boolean(selectedService)
  const canContinueStep2 = Boolean(selectedDate && selectedTime)

  return {
    step,
    setStep,
    selectedService,
    setSelectedService,
    calendarMonth,
    setCalendarMonth,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    confirmed,
    confirmedBooking,
    slots,
    slotsLoading,
    services: (services ?? []) as Service[],
    servicesLoading,
    servicesError,
    submitting,
    requestError,
    canContinueStep1,
    canContinueStep2,
    isAuthenticated,
    handleNext,
    handleBack,
    resetFlow,
    handleConfirm,
    navigate,
    location,
  }
}
