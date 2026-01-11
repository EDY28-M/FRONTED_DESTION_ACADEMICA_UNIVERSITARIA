import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  // Inicializar con datos guardados para carga instantánea
  const [docente, setDocente] = useState<AuthDocenteResponse | null>(() => {
    const savedDocente = docenteAuthApi.getCurrentDocente();
    if (savedDocente) {
      const expiracion = new Date(savedDocente.expiracion);
      if (expiracion > new Date()) {
        return savedDocente;
      }
      // Token expirado, limpiar
      docenteAuthApi.logout();
    }
    return null;
  });
  const isLoading = false; // Carga instantánea - sin estado de loading

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
