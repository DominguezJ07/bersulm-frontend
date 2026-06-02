import { Check } from 'lucide-react'

const steps = ['Servicio', 'Fecha y Hora', 'Confirmar']

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <section className="mb-10 rounded-[32px] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Paso {currentStep + 1} de 3
        </h2>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {steps.map((label, index) => {
              const completed = index < currentStep
              const active = index === currentStep
              return (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full border ${
                      completed || active
                        ? 'border-gold bg-gold'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                    } ${active ? 'text-surface-dark' : 'text-[var(--text-primary)]'}`}
                  >
                    {completed ? (
                      <Check size={18} className="text-surface-dark" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="hidden text-sm uppercase tracking-[0.35em] text-[var(--text-secondary)] sm:block">
                    {label}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 ${
                        completed ? 'bg-gold' : 'bg-[var(--border-color)]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
