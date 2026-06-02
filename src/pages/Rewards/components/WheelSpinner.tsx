import { ChevronDown, Sparkles, Gift } from 'lucide-react'
import { Card } from '@/components/ui'

interface RewardSegment {
  id: string
  name: string
  votes: number
  pct: number
}

interface WheelSpinnerProps {
  participants: string[]
  wheelColors: string[]
  isSpinning: boolean
  winner: string | null
  raffleWinner: string | undefined
  raffleStatus: string | undefined
  isAdmin: boolean
  isLastDay: boolean
  isSpinLoading: boolean
  onStartDraw: () => void
  wheelMode: 'rewards' | 'participants'
  rewardsData: RewardSegment[]
  currentPrize: string
}

export function WheelSpinner({
  participants,
  wheelColors,
  isSpinning,
  winner,
  raffleWinner,
  raffleStatus,
  isAdmin,
  isLastDay,
  isSpinLoading,
  onStartDraw,
  wheelMode,
  rewardsData,
  currentPrize,
}: WheelSpinnerProps) {
  const isRewardsMode = wheelMode === 'rewards'
  const segments = isRewardsMode ? rewardsData : participants
  const segmentCount = segments.length
  const angle = segmentCount > 0 ? 360 / segmentCount : 45

  const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const describeArc = (index: number) => {
    const cx = 200, cy = 200, r = 176
    const startAngle = index * angle
    const endAngle = (index + 1) * angle
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArc = angle > 180 ? 1 : 0
    return `M${cx},${cy} L${start.x},${start.y} A${r},${r} 0 ${largeArc} 1 ${end.x},${end.y} Z`
  }

  return (
    <Card className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold">
            {isRewardsMode ? 'Votación de Premios' : 'Sorteo Mensual de Clientes'}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
            {isRewardsMode
              ? 'Así van las votaciones este mes'
              : 'La ruleta gira con los nombres de nuestros clientes'}
          </h2>
        </div>
      </div>

      <div className="relative mt-8 flex items-center justify-center">
        <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-[var(--bg-card)] text-gold shadow-lg shadow-gold/15">
            <ChevronDown className="rotate-180" size={24} />
          </div>
        </div>

        <div className="relative w-full max-w-[380px] aspect-square rounded-full border border-gold/20 bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/40">
          {segmentCount > 0 ? (
            <svg
              viewBox="0 0 400 400"
              className={`h-full w-full rounded-full ${isSpinning ? 'animate-spin' : ''}`}
              style={{
                transformOrigin: '200px 200px',
                animation: isSpinning ? 'wheel-spin 5s cubic-bezier(.17,.67,.83,.67) forwards' : 'none',
              }}
            >
              {segments.map((seg, index) => {
                const label = isRewardsMode
                  ? (seg as RewardSegment).name
                  : (seg as string)
                const pct = isRewardsMode ? (seg as RewardSegment).pct : undefined

                return (
                  <g key={isRewardsMode ? (seg as RewardSegment).id : (seg as string)}>
                    <path
                      d={describeArc(index)}
                      fill={wheelColors[index % wheelColors.length]}
                      stroke="#1a1208"
                      strokeWidth="2"
                    />
                    {isRewardsMode && pct !== undefined ? (
                      <>
                        <text
                          x={(() => {
                            const midAngle = (index + 0.5) * angle
                            const mid = polarToCartesian(200, 200, 110, midAngle)
                            return mid.x
                          })()}
                          y={(() => {
                            const midAngle = (index + 0.5) * angle
                            const mid = polarToCartesian(200, 200, 110, midAngle)
                            return mid.y
                          })()}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#1a1208"
                          fontSize="12"
                          fontWeight="700"
                        >
                          {label.length > 12 ? label.slice(0, 10) + '…' : label}
                        </text>
                        <text
                          x={(() => {
                            const midAngle = (index + 0.5) * angle
                            const mid = polarToCartesian(200, 200, 150, midAngle)
                            return mid.x
                          })()}
                          y={(() => {
                            const midAngle = (index + 0.5) * angle
                            const mid = polarToCartesian(200, 200, 150, midAngle)
                            return mid.y
                          })()}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#1a1208"
                          fontSize="16"
                          fontWeight="900"
                        >
                          {pct}%
                        </text>
                      </>
                    ) : (
                      <text
                        x={200}
                        y={62 + (index * 45 > 180 ? 0 : 0)}
                        textAnchor="middle"
                        fill="#1a1208"
                        fontSize={segmentCount <= 6 ? 18 : 14}
                        fontWeight="700"
                        transform={`rotate(${(index + 0.5) * angle} 200 200)`}
                      >
                        {(seg as string).length > 8
                          ? (seg as string).slice(0, 7) + '…'
                          : seg as string}
                      </text>
                    )}
                  </g>
                )
              })}
              <circle cx="200" cy="200" r="52" fill="var(--bg-primary)" />
              <circle cx="200" cy="200" r="42" fill="var(--gold)" />
            </svg>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-secondary)]">
              Sin datos
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        {currentPrize && isRewardsMode && (
          <div className="mb-2 flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-sm text-gold">
            <Gift size={16} />
            <span>Premio del mes: <strong>{currentPrize}</strong></span>
          </div>
        )}

        {(raffleStatus === 'active' || raffleStatus === 'completed') && raffleWinner && (
          <div className="mb-6 flex justify-center">
            <div className="winner-fade rounded-[28px] border border-gold/30 bg-[var(--bg-card)] px-6 py-5 shadow-[0_0_40px_rgba(245,166,35,0.18)]">
              <p className="text-center text-sm uppercase tracking-[0.35em] text-gold">
                Ganador del Mes
              </p>
              <p className="mt-2 text-center text-2xl font-bold text-[var(--text-primary)]">
                {raffleWinner}
              </p>
              {currentPrize && (
                <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">
                  Premio: {currentPrize}
                </p>
              )}
            </div>
          </div>
        )}

        {isRewardsMode && raffleStatus === 'voting' && (
          <div className="w-full rounded-full bg-gray-700/40 px-6 py-3 text-sm text-[var(--text-secondary)]">
            Votación en curso — los resultados se actualizan en vivo
          </div>
        )}

        {!isRewardsMode && isAdmin && isLastDay && raffleStatus !== 'completed' ? (
          <button
            onClick={onStartDraw}
            className="w-full rounded-full bg-[#f5a623] px-6 py-3 text-base font-bold text-black transition-all duration-300 hover:bg-[#e4991a] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSpinning || isSpinLoading}
          >
            {isSpinning ? 'Girando Ruleta...' : 'Iniciar Sorteo'}
          </button>
        ) : !isRewardsMode && raffleStatus === 'completed' ? (
          <button
            type="button"
            className="w-full cursor-default rounded-full bg-[#f5a623] px-6 py-3 text-base font-bold text-black"
            disabled
          >
            Ver Ganador
          </button>
        ) : !isRewardsMode ? (
          <button
            type="button"
            className="w-full cursor-default rounded-full bg-gray-700 px-6 py-3 text-base font-bold text-[var(--text-secondary)]"
            disabled
          >
            Ruleta cerrada
          </button>
        ) : null}

        {!isRewardsMode && (
          <p className="max-w-sm text-sm text-[var(--text-secondary)]">
            Presiona el botón y mira cómo la ruleta decide al ganador del mes.
          </p>
        )}

        {winner && (
          <div className="winner-fade rounded-[28px] border border-gold/30 bg-[var(--bg-card)] px-5 py-4 text-[var(--text-primary)] shadow-[0_0_40px_rgba(245,166,35,0.18)]">
            <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gold">
              <Sparkles size={20} />
              ¡Felicidades {winner}!
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {currentPrize
                ? `Ha ganado ${currentPrize} en el sorteo mensual.`
                : 'Ha sido seleccionado como el ganador del sorteo mensual.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
