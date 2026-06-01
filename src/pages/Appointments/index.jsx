import { useMemo, useState, useEffect, useContext } from 'react'
import { Check, ChevronLeft, ChevronRight, Clock, Scissors } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import { AuthContext } from '../../context/AuthContext'

const serviceOptions = [
  { title: 'Corte Clásico', price: '$25', duration: '30 min', category: 'corte' },
  { title: 'Corte + Barba', price: '$40', duration: '45 min', category: 'corte' },
  { title: 'Afeitado Clásico', price: '$20', duration: '25 min', category: 'barba' },
  { title: 'Coloración', price: '$50', duration: '60 min', category: 'color' },
  { title: 'Diseño Cejas', price: '$15', duration: '15 min', category: 'extra' },
  { title: 'Tratamiento Capilar', price: '$35', duration: '40 min', category: 'extra' },
]

const steps = ['Servicio', 'Fecha y Hora', 'Confirmar']
const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const today = new Date()

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
]
const occupiedSlots = ['10:00', '13:30', '15:00', '16:30']

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const days = Array(startDow).fill(null)
  const totalDays = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day))
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

function formatSpanishDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
}

export default function Appointments() {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState('')

  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    if (location.state?.selectedService) {
      setSelectedService(location.state.selectedService)
      setStep(1)
    }
  }, [location.state])

  const calendarDays = useMemo(
    () => getMonthDays(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth],
  )

  const isPastDay = (date) => date && new Date(date.getFullYear(), date.getMonth(), date.getDate()) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const canContinueStep1 = Boolean(selectedService)
  const canContinueStep2 = Boolean(selectedDate && selectedTime)

  const handleNext = () => {
    if (step === 0 && canContinueStep1) {
      setStep(1)
      return
    }
    if (step === 1 && canContinueStep2) {
      setStep(2)
      return
    }
    // do nothing on step 2 here; confirmation is handled by the Confirm button
  }

  const handleBack = () => {
    if (confirmed) {
      setConfirmed(false)
      setStep(0)
      return
    }
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const resetFlow = () => {
    setConfirmed(false)
    setStep(0)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime('')
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSlots([])
    setRequestError('')
  }

  function formatISODate(date) {
    if (!date) return null
    return date.toISOString().slice(0, 10)
  }

  useEffect(() => {
    let mounted = true
    async function loadServices() {
      setServicesLoading(true)
      setServicesError('')
      try {
        const res = await api.get('/services')
        // temporary: log full response to inspect structure
        // eslint-disable-next-line no-console
        console.log('services response', res.data)
        const result = res.data
        const servicesList = result?.data?.services || result?.data || result || []
        if (mounted) setServices(Array.isArray(servicesList) ? servicesList : [])
      } catch (err) {
        if (mounted) setServicesError('Error cargando servicios')
      } finally {
        if (mounted) setServicesLoading(false)
      }
    }

    loadServices()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }

    const token = localStorage.getItem('bersulm_token')
    if (!token) {
      navigate('/login', { state: { from: location } })
      return
    }

    let mounted = true
    async function loadSlots() {
      setSlotsLoading(true)
      setSlotsError('')
      try {
        const date = formatISODate(selectedDate)
        const res = await api.get('/appointments/slots', { params: { date } })
        const data = res.data?.data || res.data
        if (!mounted) return
        // normalize slots to objects { time, available }
        const normalized = Array.isArray(data)
          ? data.map((s) => (typeof s === 'string' ? { time: s, available: true } : { time: s.time || s.slot || '', available: s.available !== false }))
          : []
        setSlots(normalized)
      } catch (err) {
        if (mounted) setSlotsError('Error cargando horarios')
      } finally {
        if (mounted) setSlotsLoading(false)
      }
    }

    loadSlots()
    return () => { mounted = false }
  }, [selectedDate, navigate, location])

  const handleConfirm = async () => {
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
      const response = await fetch('http://localhost:3000/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          serviceId: selectedService._id || selectedService.id,
          date: formatISODate(selectedDate),
          time: selectedTime,
          totalPrice: selectedService?.price,
          notes: '',
        }),
      })

      const result = await response.json()
      // eslint-disable-next-line no-console
      console.log('Respuesta reserva:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear la reserva')
      }

      setConfirmed(true)
      setConfirmedBooking(result.data || result)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creando reserva:', err)
      const msg = err?.response?.data?.message || err?.message || 'Error al crear la reserva'
      if (err?.response?.status === 409 || /taken|ocupad|no disponible|409/i.test(String(msg))) {
        setRequestError('Este horario ya no está disponible')
      } else {
        setRequestError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-app px-6 py-10 text-app sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 text-center shadow-xl">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_20px_50px_rgba(245,166,35,0.2)]">
            <Check size={42} />
          </div>
          <h1 className="text-4xl font-semibold">¡Cita confirmada!</h1>
          <p className="mt-4 text-base text-[var(--text-secondary)]">Tu reserva fue registrada con éxito. Encuentra los detalles aquí abajo.</p>

          <div className="mt-10 space-y-4 rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-left">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">Servicio</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{selectedService?.name || selectedService?.title}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--accent)]">
                <Scissors size={20} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">Fecha</p>
                <p className="mt-2 text-[var(--text-primary)]">{formatSpanishDate(selectedDate)}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">Hora</p>
                <p className="mt-2 text-[var(--text-primary)]">{selectedTime}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">Total</p>
                <p className="mt-2 text-2xl font-bold text-[var(--accent)]">{typeof selectedService?.price === 'number' ? `$${selectedService.price}` : selectedService?.price || '-'}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button onClick={resetFlow} className="px-8 py-4">Hacer otra reserva</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-app px-6 py-10 text-app sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent)]">Reservas</p>
          <h1 className="mt-4 text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">Reserva tu experiencia en BERSULM</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--accent)]">Sigue el flujo de 3 pasos para elegir tu servicio, seleccionar fecha y hora, y confirmar tu cita.</p>
        </header>

        <section className="mb-10 rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-app">Paso {step + 1} de 3</h2>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {steps.map((label, index) => {
                  const completed = index < step
                  const active = index === step
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border ${
                        completed || active ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                      } ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                        {completed ? <Check size={18} /> : <span className="font-semibold">{index + 1}</span>}
                      </div>
                      <div className="hidden text-sm uppercase tracking-[0.35em] text-[var(--text-secondary)] sm:block">{label}</div>
                      {index < steps.length - 1 && (
                        <div className={`h-[2px] flex-1 ${completed ? 'bg-[var(--accent)]' : 'bg-[var(--border-color)]'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {step === 0 && (
          <section className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {servicesLoading && (
                <div className="col-span-3 flex items-center justify-center py-10">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-t-[#f5a623] border-gray-200" />
                    <span>Cargando servicios...</span>
                  </div>
                </div>
              )}

              {servicesError && (
                <div className="col-span-3 text-center text-red-400">{servicesError}</div>
              )}

              {!servicesLoading && !servicesError && services.length === 0 && (
                <div className="col-span-3 text-center text-[var(--text-secondary)]">No hay servicios disponibles.</div>
              )}

              {!servicesLoading && !servicesError && services.map((service) => {
                const selected = selectedService?._id === service._id || selectedService?.id === service.id || selectedService?.name === service.name
                const displayKey = service._id || service.id || service.name
                const displayName = service.name || service.title || 'Servicio'
                const displayDesc = service.description || service.desc || ''
                const duration = service.durationMin || service.duration || service.length || service.duration_minutes
                const displayDuration = duration ? `${duration} min` : '-'
                const displayPrice = typeof service.price === 'number' ? `$${service.price}` : service.price || service.cost || '-'
                return (
                  <button
                    key={displayKey}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`relative flex flex-col items-start rounded-[28px] border p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_20px_50px_rgba(245,166,35,0.18)] ${
                      selected ? 'border-[var(--accent)] bg-[var(--bg-secondary)]' : 'border-[var(--border-color)] bg-[var(--bg-tertiary)]'
                    }`}>
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedService?._id === service._id
                        ? 'bg-[var(--accent)] opacity-100'
                        : 'bg-transparent border border-[var(--border-color)] opacity-50'
                    }`}>
                      <Check size={14} className="text-black" strokeWidth={3} />
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-[var(--accent)]">
                      <Scissors size={28} />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">{displayName}</h3>
                    {displayDesc && <p className="mt-2 text-sm text-[var(--text-secondary)]">{displayDesc}</p>}
                    <div className="mt-3 flex items-center gap-2 text-sm leading-6 text-[#bfbfbf]">
                      <Clock size={16} />
                      <span>Duración {displayDuration}</span>
                    </div>
                    <div className="mt-6 flex items-center justify-between w-full gap-4">
                      <span className="text-2xl font-bold text-[var(--accent)]">{displayPrice}</span>
                      <span className="rounded-full bg-[var(--bg-tertiary)] px-3 py-2 text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">{displayDuration}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!canContinueStep1}
                className={`px-8 py-4 ${!canContinueStep1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continuar
              </Button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-8">
            <div className="rounded-[28px] border border-app bg-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Selecciona fecha</p>
                  <p className="mt-2 text-app">Elige tu día preferido en el calendario.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-app bg-app text-[var(--gold)]"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-lg font-semibold text-app">{calendarMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-app bg-app text-[var(--gold)]"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.35em] text-[#999999]">
                {weekdays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  const disabled = !date || isPastDay(date)
                  const selected = date && selectedDate && selectedDate.toDateString() === date.toDateString()
                  return (
                    <button
                      key={`${date?.toDateString() ?? index}`}
                      type="button"
                      onClick={() => !disabled && date && setSelectedDate(date)}
                      disabled={disabled}
                      className={`min-h-[52px] rounded-3xl border p-2 transition duration-300 ${
                        disabled
                          ? 'cursor-not-allowed border-transparent bg-[#1a1208] text-[#4a443b]'
                          : selected
                          ? 'border border-[#f5a623] bg-[#f5a623] text-[#1a1208]'
                          : 'border border-[#3b2b1e] bg-[#24180f] text-white hover:border-[#f5a623] hover:bg-[#2f2311]'
                      }`}
                    >
                      {date ? date.getDate() : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Selecciona hora</h3>
              <p className="mt-2 text-sm text-[#cccccc]">Los horarios ocupados aparecen en rojo.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {slotsLoading && (
                  <div className="col-span-2 flex items-center gap-3 py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-t-[#f5a623] border-gray-200" />
                    <span>Cargando horarios...</span>
                  </div>
                )}

                {slotsError && <div className="col-span-2 text-red-400">{slotsError}</div>}

                {!slotsLoading && !slotsError && slots.length === 0 && (
                  <div className="col-span-2 text-[#cccccc]">No hay horarios disponibles para esta fecha.</div>
                )}

                {!slotsLoading && !slotsError && slots.map((s) => {
                  const time = s.time || s.slot
                  const available = s.available !== false
                  const selected = selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setSelectedTime(time)}
                      className={`rounded-[24px] border px-4 py-4 text-left text-sm font-semibold transition duration-300 ${
                        !available
                          ? 'cursor-not-allowed border-red-600 bg-[#3a1f1a] text-red-400 line-through'
                          : selected
                          ? 'border border-[#f5a623] bg-[#f5a623] text-[#1a1208]'
                          : 'border border-[#3b2b1e] bg-[#24180f] text-white hover:border-[#f5a623] hover:bg-[#2f2311]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{time}</span>
                        {selected && <Check size={16} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="secondary" onClick={handleBack} className="w-full sm:w-auto px-8 py-4">
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canContinueStep2}
                className={`w-full sm:w-auto px-8 py-4 ${!canContinueStep2 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continuar
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-8">
            <div className="rounded-[32px] border border-[#3b2b1e] bg-[#2a1f0e] p-8 shadow-xl">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Resumen de la reserva</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Confirma tu cita</h2>
                </div>
                <div className="rounded-3xl bg-[#1f150c] px-4 py-3 text-sm uppercase tracking-[0.35em] text-[#f5a623]">
                  Total {selectedService?.price}
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-[28px] border border-[#33271e] bg-[#24180f] p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f150c] text-[#f5a623]">
                    <Scissors size={22} />
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-[0.35em] text-[#f5a623]">Servicio</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selectedService?.name || selectedService?.title}</p>
                </div>
                <div className="rounded-[28px] border border-[#33271e] bg-[#24180f] p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Fecha</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selectedDate ? formatSpanishDate(selectedDate) : '-'}</p>
                </div>
                <div className="rounded-[28px] border border-[#33271e] bg-[#24180f] p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Hora</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selectedTime || '-'}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#f5a623]">Total</p>
                  <p className="mt-2 text-4xl font-bold text-[#f5a623]">{typeof selectedService?.price === 'number' ? `$${selectedService.price}` : selectedService?.price || '-'}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" onClick={handleBack} className="w-full sm:w-auto px-8 py-4">
                    Atrás
                  </Button>
                  <Button onClick={handleConfirm} disabled={submitting} className="w-full sm:w-auto px-8 py-4">
                    {submitting ? 'Procesando...' : 'Confirmar Reserva'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
