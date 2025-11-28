import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LockClosedIcon, AcademicCapIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = 'http://localhost:5251/api';

export const ResetPasswordDocentePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Verificar token al cargar
  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
      return;
    }
    // Asumimos que el token es válido si está presente
    setTokenValid(true);
  }, [token, email]);

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: password
      });
      
      setResetSuccess(true);
      toast.success('¡Contraseña actualizada exitosamente!');
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'El enlace ha expirado o es inválido';
        toast.error(message);
        setTokenValid(false);
      } else {
        toast.error('Error al restablecer la contraseña. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Requisitos de contraseña
  const passwordRequirements = [
    { met: password.length >= 6, text: 'Al menos 6 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Una letra mayúscula' },
    { met: /[a-z]/.test(password), text: 'Una letra minúscula' },
    { met: /[0-9]/.test(password), text: 'Un número' },
  ];

  // Vista de token inválido
  if (tokenValid === false) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0, 51, 102, 0.4)' }} />
        
        <div className="relative max-w-md w-full bg-white p-8 sm:p-10 shadow-2xl rounded-lg">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Enlace inválido o expirado
            </h2>
            <p className="text-gray-600 mb-6">
              El enlace para restablecer la contraseña ha expirado o no es válido. Por favor, solicita uno nuevo.
            </p>
            <Link
              to="/docente/forgot-password"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200"
              style={{ backgroundColor: '#003366' }}
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vista de éxito
  if (resetSuccess) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0, 51, 102, 0.4)' }} />
        
        <div className="relative max-w-md w-full bg-white p-8 sm:p-10 shadow-2xl rounded-lg">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link
              to="/docente/login?passwordReset=success"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200"
              style={{ backgroundColor: '#003366' }}
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Nueva Contraseña
          </h1>
          
          <p className="text-gray-500 text-sm">
            Portal Docente - SIAGE
          </p>
        </div>

        <p className="text-gray-600 text-sm text-center mb-6">
          Ingresa tu nueva contraseña para la cuenta: <strong>{email}</strong>
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nueva Contraseña */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#003366' }}
            >
              Nueva Contraseña
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

          {/* Requisitos de contraseña */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de la contraseña:</p>
            <ul className="space-y-1">
              {passwordRequirements.map((req, index) => (
                <li key={index} className="flex items-center text-xs">
                  {req.met ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 mr-2" />
                  )}
                  <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Campo Confirmar Contraseña */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#003366' }}
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                className={`
                  block w-full pl-10 pr-12 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 transition-all duration-200
                  ${errors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-600 focus:border-primary-600'
                  }
                `}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Botón Restablecer */}
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
                Restableciendo...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>

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

export default ResetPasswordDocentePage;

