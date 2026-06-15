import { useState, useEffect, useRef, useCallback } from 'react'

function formatTimeLeft(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function useCountdown(initialMs: number) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(initialMs))
  const serverCountdownRef = useRef<number>(initialMs)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetCountdown = useCallback((ms: number) => {
    serverCountdownRef.current = ms
    setTimeLeft(formatTimeLeft(ms))
  }, [])

  useEffect(() => {
    countdownIntervalRef.current = setInterval(() => {
      serverCountdownRef.current = Math.max(0, serverCountdownRef.current - 1000)
      setTimeLeft(formatTimeLeft(serverCountdownRef.current))
    }, 1000)

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [])

  return { timeLeft, resetCountdown }
}
