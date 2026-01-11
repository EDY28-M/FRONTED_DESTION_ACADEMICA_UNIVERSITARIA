import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactElement
  requiredRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, user } = useAuth()

  // Ya no hay loading bloqueante - la autenticación es instantánea desde localStorage

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    // Redirigir según el rol requerido, o por defecto a admin
    if (requiredRoles && requiredRoles.length > 0) {
      if (requiredRoles.includes('Estudiante')) {
        return <Navigate to="/estudiante/login" replace />
      } else if (requiredRoles.includes('Administrador')) {
        return <Navigate to="/admin/login" replace />
      }
    }
    return <Navigate to="/admin/login" replace />
  }

  // Si se especifican roles requeridos, verificar que el usuario tenga uno de ellos
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.rol)
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-600 text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500">
              Rol requerido: {requiredRoles.join(' o ')}
            </p>
            <p className="text-sm text-gray-500">
              Tu rol: {user.rol}
            </p>
          </div>
        </div>
      )
    }
  }

  // Si está autenticado y tiene los permisos necesarios, mostrar el contenido
  return children
}

export default ProtectedRoute

