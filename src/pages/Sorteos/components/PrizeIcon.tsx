import { Scissors, Percent, Package, Gift, Star } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  corte: Scissors,
  descuento: Percent,
  producto: Package,
  producto_gratis: Gift,
  premio: Star,
}

const FALLBACK = Gift

interface PrizeIconProps {
  type: string
  className?: string
}

export function PrizeIcon({ type, className = 'h-8 w-8' }: PrizeIconProps) {
  const Icon = iconMap[type] || FALLBACK
  return <Icon className={className} />
}
