import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { docenteAuthApi, AuthDocenteResponse } from '../services/docenteApi';

interface DocenteAuthContextType {
  docente: AuthDocenteResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthDocenteResponse) => void;
  logout: () => void;
}

const DocenteAuthContext = createContext<DocenteAuthContextType | undefined>(undefined);

export const useDocenteAuth = () => {
  const context = useContext(DocenteAuthContext);
  if (!context) {
    throw new Error('useDocenteAuth must be used within a DocenteAuthProvider');
  }
  return context;
};

interface DocenteAuthProviderProps {
  children: ReactNode;
}

export const DocenteAuthProvider: React.FC<DocenteAuthProviderProps> = ({ children }) => {
  const [docente, setDocente] = useState<AuthDocenteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un docente autenticado al cargar
    const savedDocente = docenteAuthApi.getCurrentDocente();
    if (savedDocente) {
      // Verificar si el token no ha expirado
      const expiracion = new Date(savedDocente.expiracion);
      if (expiracion > new Date()) {
        setDocente(savedDocente);
      } else {
        // Token expirado, limpiar
        docenteAuthApi.logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthDocenteResponse) => {
    docenteAuthApi.saveAuthData(authData);
    setDocente(authData);
  };

  const logout = () => {
    docenteAuthApi.logout();
    setDocente(null);
  };

  const value: DocenteAuthContextType = {
    docente,
    isAuthenticated: !!docente,
    isLoading,
    login,
    logout,
  };

  return (
    <DocenteAuthContext.Provider value={value}>
      {children}
    </DocenteAuthContext.Provider>
  );
};
