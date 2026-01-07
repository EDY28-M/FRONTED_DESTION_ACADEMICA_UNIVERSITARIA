import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5251/api';

const ForgotPasswordEstudiantePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (emailValue: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('El correo es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('El formato del correo no es válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { 
        Email: email,
        TipoUsuario: "Estudiante"
      });
      
      if (response.data?.success === false) {
        const message = response.data?.message || 'No existe una cuenta de estudiante con este correo';
        if (message.includes('no coincide') || message.includes('portal correcto')) {
          setError('Este correo pertenece a otra cuenta (Docente o Administrador). Por favor, usa el portal correspondiente.');
        } else {
          setError(message);
        }
      } else {
        setEmailSent(true);
        toast.success('Se ha enviado un correo con las instrucciones');
      }
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error);
      
      if (error.response?.status === 404) {
        setError('No existe una cuenta de estudiante con este correo');
      } else if (error.response?.data?.success === false) {
        const message = error.response?.data?.message || 'No existe una cuenta con este correo';
        if (message.includes('no coincide') || message.includes('portal correcto')) {
          setError('Este correo pertenece a otra cuenta (Docente o Administrador). Por favor, usa el portal correspondiente.');
        } else {
          setError(message);
        }
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
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(8, 8, 8, 0.3)',
        }}
      />

      <div 
        className="relative max-w-md w-full bg-white p-8 sm:p-10 shadow-2xl border border-zinc-200/50"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-24 relative mb-4">
            <img 
              src="/src/image/fondouni.svg" 
              alt="Escudo Universitario" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-xl font-bold tracking-wider text-zinc-800 mb-2">
            UNIVERSIDAD ACADEMICA
          </h1>
          
          <h2 className="text-2xl font-bold text-zinc-800">
            Recuperar Contraseña - Estudiante
          </h2>
        </div>

        {emailSent ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-none bg-green-100 flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Correo enviado!
            </h2>
            <p className="text-gray-600 mb-6">
              Si existe una cuenta de estudiante asociada a <strong>{email}</strong>, recibirás un correo con las instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              El enlace expirará en 24 horas.
            </p>
            <Link
              to="/estudiante/login"
              className="inline-flex items-center justify-center w-full py-3.5 px-4 rounded-none text-white font-medium transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 hover:shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm text-center mb-6">
              Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2 text-zinc-700"
                >
                  Correo institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-400' : 'border-zinc-200'
                      } rounded-none focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 transition-all duration-200 text-zinc-900 bg-white/80`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-medium rounded-none transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLoading ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg'
                }`}
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

            <div className="mt-6 text-center">
              <Link 
                to="/estudiante/login"
                className="inline-flex items-center text-sm font-medium hover:underline text-zinc-600 hover:text-zinc-900 transition-all"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
          <p className="text-xs text-zinc-500">
            Tu futuro comienza aquí.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordEstudiantePage;
