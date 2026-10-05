import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { rewardsService } from '@/services/rewards.service'
import type { Raffle } from '@/types'

const wheelColors = ['#f5a623', '#d4891a', '#b8740f']

export function useRewardsFlow() {
  const { user } = useAuth()

  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const raffleIdRef = useRef<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [displaySeconds, setDisplaySeconds] = useState(0)
  const remaining = useMemo(() => ({
    days: Math.floor(displaySeconds / 86400),
    hours: Math.floor((displaySeconds % 86400) / 3600),
    minutes: Math.floor((displaySeconds % 3600) / 60),
    seconds: Math.floor(displaySeconds % 60),
  }), [displaySeconds])

  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prize = useMemo(() => raffle?.prize ?? null, [raffle])

  const loadRaffle = useCallback(async () => {
    setIsLoading(true)
    try {
      const raffleRes = await rewardsService.getCurrentRaffle()
      const raffleData = (raffleRes.data as { raffle: Raffle; countdown?: number }).raffle
      if (raffleData) {
        setRaffle(raffleData)
        raffleIdRef.current = raffleData._id || raffleData.id || null
      }

      const backendCountdown = (raffleRes.data as { countdown?: number }).countdown
      if (backendCountdown !== undefined && backendCountdown !== null) {
        setDisplaySeconds(backendCountdown)
      }
    } catch {
      // No raffle active
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRaffle()
  }, [loadRaffle])

  useEffect(() => {
    if (displaySeconds <= 0) return
    const interval = setInterval(() => {
      setDisplaySeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [displaySeconds > 0])

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await rewardsService.getCurrentRaffle()
        const data = res.data as {
          countdown?: number
          raffle?: Raffle
        }

        if (data.countdown !== undefined && data.countdown !== null) {
          setDisplaySeconds(data.countdown)
        }

        if (data.raffle) {
          setRaffle(data.raffle)
          raffleIdRef.current = data.raffle._id || data.raffle.id || null
        }
      } catch {
        // silent poll fail
      }
    }, 10000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [])

  return {
    raffle,
    remaining,
    prize,
    isLoading,
    isAdmin,
    wheelColors,
    loadRaffle,
  }
}
