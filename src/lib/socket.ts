import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

let socket: Socket | null = null

type RaffleEventHandler = (data: {
  raffleId: string
  month: string
  winnerReward?: string
  winnerRewardName?: string
  status?: string
  phase?: string
}) => void

const listeners: Record<string, RaffleEventHandler[]> = {
  'raffle:voting-ended': [],
  'raffle:winner': [],
  'raffle:you-won': [],
  'raffle:updated': [],
}

function notify(event: string, data: Parameters<RaffleEventHandler>[0]) {
  listeners[event]?.forEach((fn) => fn(data))
}

export function connectSocket(token: string, userId: string) {
  if (socket?.connected) return

  socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    socket?.emit('join-user', userId)
  })

  socket.on('raffle:voting-ended', (data) => {
    toast(
      `El premio ganador del sorteo mensual es: ${data.winnerRewardName || data.winnerReward || '—'}`,
      { icon: '🎉', duration: 8000 },
    )
    notify('raffle:voting-ended', data)
  })

  socket.on('raffle:winner', (data) => {
    notify('raffle:winner', data)
  })

  socket.on('raffle:you-won', (data) => {
    toast.success(`¡Felicidades! Has ganado el sorteo mensual`)
    notify('raffle:you-won', data)
  })

  socket.on('raffle:updated', (data) => {
    notify('raffle:updated', data)
  })

  socket.on('disconnect', () => {
    // auto-reconnect handled by socket.io
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  Object.keys(listeners).forEach((key) => {
    listeners[key] = []
  })
}

export function onSocketEvent(event: string, handler: RaffleEventHandler): () => void {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(handler)
  return () => {
    listeners[event] = listeners[event]?.filter((fn) => fn !== handler) ?? []
  }
}

export function getSocket(): Socket | null {
  return socket
}
