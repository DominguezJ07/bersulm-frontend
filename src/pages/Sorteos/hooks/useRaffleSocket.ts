import { useEffect } from 'react'
import { onSocketEvent } from '@/lib/socket'

interface UseRaffleSocketParams {
  onVotingEnded: () => void
  onWinner: () => void
  onUpdated: () => void
}

export function useRaffleSocket({ onVotingEnded, onWinner, onUpdated }: UseRaffleSocketParams) {
  useEffect(() => {
    const unsubs: (() => void)[] = []

    unsubs.push(
      onSocketEvent('raffle:voting-ended', () => {
        onVotingEnded()
      }),
    )

    unsubs.push(
      onSocketEvent('raffle:winner', () => {
        onWinner()
      }),
    )

    unsubs.push(
      onSocketEvent('raffle:updated', () => {
        onUpdated()
      }),
    )

    return () => unsubs.forEach((fn) => fn())
  }, [onVotingEnded, onWinner, onUpdated])
}
