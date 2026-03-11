import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0()

  // Esperar a que Auth0 termine de verificar la sesión
  if (isLoading) {
    return (
      <div className="route-loading">
        <div className="route-loading__spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
