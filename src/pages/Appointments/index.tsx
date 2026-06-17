import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useAppointmentFlow } from './hooks/useAppointmentFlow'
import {
  StepIndicator,
  ServiceSelector,
  CalendarPicker,
  TimeSlotPicker,
  BookingSummary,
  BookingConfirmation,
  AppointmentHistory,
  AdminAppointmentsPanel,
} from './components'

export default function Appointments() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const flow = useAppointmentFlow()
  const [activeTab, setActiveTab] =
    useState<'nueva' | 'historial'>('nueva')

  // VISTA ADMIN — panel de gestión de citas
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)]
        px-6 py-10 text-[var(--text-primary)] sm:px-8">
        <Helmet>
          <title>Gestión de Citas | BERSULM</title>
        </Helmet>
        <div className="mx-auto max-w-5xl">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-[0.35em]
              text-gold">
              Administración
            </p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Gestión de Citas
            </h1>
            <p className="mt-4 max-w-2xl text-lg
              text-[var(--text-secondary)]">
              Confirma, completa o cancela las citas de tus clientes.
            </p>
          </header>
          <AdminAppointmentsPanel />
        </div>
      </main>
    )
  }

  // VISTA CLIENTE — flujo de reserva + historial
  if (flow.confirmed) {
    return (
      <BookingConfirmation
        selectedService={flow.selectedService}
        selectedDate={flow.selectedDate}
        selectedTime={flow.selectedTime}
        onReset={() => {
          flow.resetFlow()
          setActiveTab('nueva')
        }}
        onViewHistory={() => {
          flow.resetFlow()
          setActiveTab('historial')
        }}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]
      px-6 py-10 text-[var(--text-primary)] sm:px-8">
      <Helmet>
        <title>Reservas | BERSULM</title>
        <meta name="description" content="Reserva tu cita en
          BERSULM en 3 pasos." />
      </Helmet>
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em]
            text-gold">
            Reservas
          </p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Reserva tu experiencia en BERSULM
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gold">
            Sigue el flujo de 3 pasos para elegir tu servicio,
            seleccionar fecha y hora, y confirmar tu cita.
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-full border
          border-[var(--border-color)] bg-[var(--bg-card)]
          p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('nueva')}
            className={`rounded-full px-6 py-2.5 text-sm
              font-semibold transition ${
                activeTab === 'nueva'
                  ? 'bg-gold text-surface-dark'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
          >
            Nueva Reserva
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`rounded-full px-6 py-2.5 text-sm
              font-semibold transition ${
                activeTab === 'historial'
                  ? 'bg-gold text-surface-dark'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
          >
            Mis Citas
          </button>
        </div>

        {/* Tab Nueva Reserva */}
        {activeTab === 'nueva' && (
          <>
            <StepIndicator currentStep={flow.step} />

            {flow.step === 0 && (
              <ServiceSelector
                services={flow.services}
                selectedService={flow.selectedService}
                loading={flow.servicesLoading}
                error={flow.servicesError as Error | null}
                onSelect={flow.setSelectedService}
                onContinue={flow.handleNext}
                canContinue={flow.canContinueStep1}
              />
            )}

            {flow.step === 1 && (
              <section className="space-y-8">
                <CalendarPicker
                  calendarMonth={flow.calendarMonth}
                  selectedDate={flow.selectedDate}
                  onMonthChange={flow.setCalendarMonth}
                  onDateSelect={flow.setSelectedDate}
                />
                <TimeSlotPicker
                  slots={flow.slots}
                  selectedTime={flow.selectedTime}
                  loading={flow.slotsLoading}
                  error={flow.requestError}
                  onSelect={flow.setSelectedTime}
                />
                <div className="flex flex-col gap-3
                  sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={flow.handleBack}
                    className="rounded-full border
                      border-[var(--border-color)]
                      bg-[var(--bg-secondary)] px-8 py-4
                      text-sm font-semibold
                      text-[var(--text-primary)]
                      transition hover:brightness-110
                      sm:w-auto w-full"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={flow.handleNext}
                    disabled={!flow.canContinueStep2}
                    className={`w-full rounded-full bg-gold
                      px-8 py-4 text-sm font-semibold
                      text-surface-dark transition
                      hover:brightness-110 sm:w-auto ${
                        !flow.canContinueStep2
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                  >
                    Continuar
                  </button>
                </div>
              </section>
            )}

            {flow.step === 2 && (
              <BookingSummary
                selectedService={flow.selectedService}
                selectedDate={flow.selectedDate}
                selectedTime={flow.selectedTime}
                submitting={flow.submitting}
                requestError={flow.requestError}
                onBack={flow.handleBack}
                onConfirm={flow.handleConfirm}
              />
            )}
          </>
        )}

        {/* Tab Mis Citas */}
        {activeTab === 'historial' && <AppointmentHistory />}
      </div>
    </main>
  )
}