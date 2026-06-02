export const ROUTES = {
  HOME: '/',
  SERVICES: '/servicios',
  APPOINTMENTS: '/appointments',
  RESERVAS: '/reservas',
  REWARDS: '/premios',
  LOYALTY: '/fidelidad',
  LOYALTY_MINIGAME: '/fidelidad/minijuego',
  SETTINGS: '/ajustes',
  LOGIN: '/login',
  REGISTER: '/register',
} as const

export type RouteKey = keyof typeof ROUTES
