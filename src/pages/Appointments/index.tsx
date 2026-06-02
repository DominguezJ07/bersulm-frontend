import { Helmet } from 'react-helmet-async'
import { useAppointmentFlow } from './hooks/useAppointmentFlow'
import {
  StepIndicator,
  ServiceSelector,
  CalendarPicker,
  TimeSlotPicker,
  BookingSummary,
  BookingConfirmation,
} from './components'

export default function Appointments() {
  const flow = useAppointmentFlow()

  if (flow.confirmed) {
    return (
      <BookingConfirmation
        selectedService={flow.selectedService}
        selectedDate={flow.selectedDate}
        selectedTime={flow.selectedTime}
        onReset={flow.resetFlow}
      />
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)] sm:px-8">
      <Helmet>
        <title>Reservas | BERSULM</title>
        <meta name="description" content="Reserva tu cita en BERSULM en 3 pasos. Elige servicio, fecha y hora para tu experiencia premium." />
      </Helmet>
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">Reservas</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Reserva tu experiencia en BERSULM
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gold">
            Sigue el flujo de 3 pasos para elegir tu servicio, seleccionar fecha y hora, y confirmar tu cita.
          </p>
        </header>

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

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={flow.handleBack}
                className="rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-8 py-4 text-sm font-semibold text-[var(--text-primary)] transition hover:brightness-110 sm:w-auto w-full"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={flow.handleNext}
                disabled={!flow.canContinueStep2}
                className={`w-full rounded-full bg-gold px-8 py-4 text-sm font-semibold text-surface-dark transition hover:brightness-110 sm:w-auto ${
                  !flow.canContinueStep2 ? 'cursor-not-allowed opacity-50' : ''
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
      </div>
    </main>
  )
}
