import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EnvelopeIcon, AcademicCapIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = 'http://localhost:5251/api';

export const ForgotPasswordDocentePage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo) {
      setError('El correo es requerido');
      return;
    }

    if (!validateEmail(correo)) {
      setError('El formato del correo no es válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: correo });
      
      // La API devuelve success: false cuando el correo no existe
      if (response.data?.success === false) {
        setError(response.data?.message || 'No existe una cuenta con este correo');
      } else {
        setEmailSent(true);
        toast.success('Se ha enviado un correo con las instrucciones');
      }
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error);
      
      if (error.response?.status === 404) {
        setError('No existe una cuenta de docente con este correo');
      } else if (error.response?.data?.success === false) {
        setError(error.response?.data?.message || 'No existe una cuenta con este correo');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Datos inválidos');
      } else {
        setError('Error al procesar la solicitud. Intente nuevamente.');
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
            Recuperar Contraseña
          </h1>
          
          <p className="text-gray-500 text-sm">
            Portal Docente - SIAGE
          </p>
        </div>

        {emailSent ? (
          /* Mensaje de éxito */
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Correo enviado!
            </h2>
            <p className="text-gray-600 mb-6">
              Si existe una cuenta asociada a <strong>{correo}</strong>, recibirás un correo con las instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              El enlace expirará en 1 hora.
            </p>
            <Link
              to="/docente/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200"
              style={{ backgroundColor: '#003366' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#002244'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#003366'}
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          /* Formulario */
          <>
            <p className="text-gray-600 text-sm text-center mb-6">
              Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>

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
                      setError('');
                    }}
                    className={`
                      block w-full pl-10 pr-3 py-3 border rounded-lg
                      focus:outline-none focus:ring-2 transition-all duration-200
                      ${error 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primary-600 focus:border-primary-600'
                      }
                    `}
                    placeholder="docente@unas.edu.pe"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Botón Enviar */}
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
                    Enviando...
                  </>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>
            </form>

            {/* Link para volver */}
            <div className="mt-6 text-center">
              <Link 
                to="/docente/login"
                className="inline-flex items-center text-sm font-medium hover:underline"
                style={{ color: '#003366' }}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}

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

export default ForgotPasswordDocentePage;

