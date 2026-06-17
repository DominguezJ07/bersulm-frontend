import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

let socket: Socket | null = null
let isConnecting = false

const listeners: Record<string, Function[]> = {
  'raffle:voting-ended': [],
  'raffle:winner': [],
  'raffle:you-won': [],
  'raffle:updated': [],
  'appointment:created': [],
  'appointment:confirmed': [],
  'appointment:completed': [],
  'appointment:cancelled': [],
  'appointment:cancelled-by-admin': [],
}

function notify(event: string, data: unknown) {
  listeners[event]?.forEach((fn) => fn(data))
}

export function connectSocket(token: string, userId: string) {
  if (socket?.connected || isConnecting) return
  isConnecting = true

  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io('http://localhost:3000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    isConnecting = false
    socket?.emit('join-user', userId)
  })

  socket.on('connect_error', () => {
    isConnecting = false
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

  socket.on('appointment:created', (data) => {
    notify('appointment:created', data)
  })

  socket.on('appointment:confirmed', (data) => {
    notify('appointment:confirmed', data)
  })

  socket.on('appointment:completed', (data) => {
    notify('appointment:completed', data)
  })

  socket.on('appointment:cancelled', (data) => {
    notify('appointment:cancelled', data)
  })

  socket.on('appointment:cancelled-by-admin', (data) => {
    notify('appointment:cancelled-by-admin', data)
  })

  socket.on('disconnect', () => {
    isConnecting = false
  })
}

export function disconnectSocket() {
  isConnecting = false
  if (socket) {
    socket.disconnect()
    socket = null
  }
  Object.keys(listeners).forEach((key) => {
    listeners[key] = []
  })
}

export function onSocketEvent(
  event: string,
  handler: (data: unknown) => void
): () => void {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(handler)
  return () => {
    listeners[event] =
      listeners[event]?.filter((fn) => fn !== handler) ?? []
  }
}

export function getSocket(): Socket | null {
  return socket
}