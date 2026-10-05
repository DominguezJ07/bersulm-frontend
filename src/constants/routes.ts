export const ROUTES = {
  HOME: '/',
  SERVICES: '/servicios',
  RESERVAS: '/reservas',
  REWARDS: '/premios',
  SORTEO: '/sorteo',
  LOYALTY: '/fidelidad',
  LOYALTY_MINIGAME: '/fidelidad/minijuego',
  SETTINGS: '/ajustes',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
} as const

export type RouteKey = keyof typeof ROUTES
