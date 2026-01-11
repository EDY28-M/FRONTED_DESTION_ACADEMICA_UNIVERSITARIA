import { Navigate } from 'react-router-dom';
import { useDocenteAuth } from '../contexts/DocenteAuthContext';

interface ProtectedDocenteRouteProps {
  children: React.ReactNode;
}

export const ProtectedDocenteRoute: React.FC<ProtectedDocenteRouteProps> = ({ children }) => {
  const { isAuthenticated } = useDocenteAuth();

  // Ya no hay loading bloqueante - autenticación instantánea desde localStorage

  if (!isAuthenticated) {
    return <Navigate to="/docente/login" replace />;
  }

  return <>{children}</>;
};

