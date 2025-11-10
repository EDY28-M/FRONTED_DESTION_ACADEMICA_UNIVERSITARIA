import { Navigate } from 'react-router-dom';
import { useDocenteAuth } from '../contexts/DocenteAuthContext';

interface ProtectedDocenteRouteProps {
  children: React.ReactNode;
}

export const ProtectedDocenteRoute: React.FC<ProtectedDocenteRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useDocenteAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/docente/login" replace />;
  }

  return <>{children}</>;
};
