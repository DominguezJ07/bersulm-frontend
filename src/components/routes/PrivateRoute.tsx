import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

export function PrivateRoute({ children, adminOnly }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" state={{ error: 'forbidden' }} replace />
  }

  return <>{children}</>
}
