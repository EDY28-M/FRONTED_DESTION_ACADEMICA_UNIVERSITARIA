import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocenteAuth } from '../../contexts/DocenteAuthContext';
import { docenteAuthApi } from '../../services/docenteApi';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export const LoginDocentePage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useDocenteAuth();
  
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { correo?: string; password?: string } = {};

    if (!correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await docenteAuthApi.login({ correo, password });
      login(response);
      toast.success(`¡Bienvenido ${response.nombreCompleto}!`);
      navigate('/docente/dashboard');
    } catch (error: any) {
      console.error('Error en login de docente:', error);
      
      if (error.response?.status === 401) {
        toast.error('Correo o contraseña incorrectos');
      } else if (error.response?.status === 400) {
        toast.error('Datos de entrada inválidos');
      } else {
        toast.error('Error al iniciar sesión. Por favor, intente nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0, 51, 102, 0.4)',
        }}
      />

      {/* Contenedor Principal */}
      <div 
        className="relative max-w-md w-full bg-white p-8 sm:p-10 shadow-2xl"
        style={{
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Logo y Marca */}
        <div className="text-center mb-8">
          <div 
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#003366' }}
          >
            <AcademicCapIcon className="w-12 h-12 text-white" />
          </div>
          
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ 
              color: '#003366',
              fontFamily: "'Montserrat', 'Roboto', sans-serif",
            }}
          >
            Portal Docente
          </h1>
          
          <p className="text-gray-500 text-sm">
            Sistema de Gestión Académica - SIAGE
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Correo */}
          <div>
            <label 
              htmlFor="correo" 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#003366' }}
            >
              Correo Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (errors.correo) setErrors({ ...errors, correo: undefined });
                }}
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 transition-all duration-200
                  ${errors.correo 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-600 focus:border-primary-600'
                  }
                `}
                placeholder="docente@unas.edu.pe"
              />
            </div>
            {errors.correo && (
              <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#003366' }}
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`
                  block w-full pl-10 pr-12 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 transition-all duration-200
                  ${errors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-600 focus:border-primary-600'
                  }
                `}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: isLoading ? '#6B7280' : '#003366',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#002244';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#003366';
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al Portal'
            )}
          </button>
        </form>

        {/* Link para recuperar contraseña */}
        <div className="mt-6 text-center">
          <Link 
            to="/docente/forgot-password"
            className="text-sm font-medium hover:underline"
            style={{ color: '#003366' }}
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Sistema de Gestión Académica
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginDocentePage;

