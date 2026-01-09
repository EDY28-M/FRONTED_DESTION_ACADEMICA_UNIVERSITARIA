import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const ForgotPasswordPage: React.FC = () => {
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
        TipoUsuario: "Usuario"
      });

      if (response.data?.success === false) {
        setError(response.data?.message || 'No existe una cuenta con este correo');
      } else {
        setEmailSent(true);
        toast.success('Se ha enviado un correo con las instrucciones');
      }
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error);

      if (error.response?.status === 404) {
        setError('No existe una cuenta con este correo');
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel Izquierdo - Formulario (Fondo Oscuro) */}
      <div className="w-full lg:w-1/2 bg-[#1a1a2e] flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Botón volver */}
          <Link
            to="/login"
            className="inline-flex items-center text-gray-400 hover:text-purple-400 transition-colors mb-8"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver al inicio de sesión
          </Link>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-400 text-base">
              Ingresa tu correo y te enviaremos las instrucciones
            </p>
          </div>

          {emailSent ? (
            /* Mensaje de éxito */
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                ¡Correo enviado!
              </h2>
              <p className="text-gray-400 mb-6">
                Si existe una cuenta asociada a <span className="text-purple-400 font-medium">{email}</span>, recibirás un correo con las instrucciones para restablecer tu contraseña.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                El enlace expirará en 1 hora.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-4 px-6 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Correo */}
              <div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`block w-full px-0 py-3 bg-transparent border-0 border-b-2 ${error ? 'border-red-500' : 'border-gray-600'
                    } text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-base`}
                  placeholder="Correo electrónico"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Botón Enviar */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-full font-semibold text-white transition-all duration-300 ${isLoading
                    ? 'bg-purple-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Panel Derecho - Ilustración (Fondo Púrpura) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-800/30 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center max-w-lg">
          {/* Título Welcome */}
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Welcome to
          </h2>
          <h3 className="text-4xl sm:text-5xl font-bold text-white/90 mb-6">
            student portal
          </h3>
          <p className="text-purple-100 text-lg mb-12">
            Recupera el acceso a tu cuenta
          </p>

          {/* Ilustración SVG */}
          <div className="relative mx-auto w-full max-w-md">
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              {/* Documento/Formulario central */}
              <rect x="120" y="80" width="160" height="200" rx="8" fill="white" opacity="0.95" />
              <rect x="140" y="110" width="120" height="8" rx="4" fill="#a855f7" />
              <rect x="140" y="130" width="100" height="6" rx="3" fill="#e9d5ff" />
              <rect x="140" y="150" width="120" height="8" rx="4" fill="#a855f7" />
              <rect x="140" y="170" width="80" height="6" rx="3" fill="#e9d5ff" />
              <rect x="140" y="190" width="120" height="8" rx="4" fill="#a855f7" />
              <rect x="140" y="210" width="60" height="6" rx="3" fill="#e9d5ff" />

              {/* Círculo de email/sobre */}
              <circle cx="120" cy="220" r="35" fill="#7c3aed" opacity="0.9" />
              <circle cx="120" cy="220" r="25" fill="white" opacity="0.3" />
              <rect x="105" y="212" width="30" height="20" rx="2" fill="white" />
              <path d="M105 214 L120 225 L135 214" stroke="#7c3aed" strokeWidth="2" fill="none" />

              {/* Persona 1 - sentada a la izquierda */}
              <ellipse cx="80" cy="250" rx="25" ry="10" fill="#1e1b4b" opacity="0.3" />
              <rect x="60" y="200" width="40" height="50" rx="4" fill="#f3f4f6" />
              <circle cx="80" cy="180" r="15" fill="#fef3c7" />
              <path d="M65 175 Q80 165 95 175" stroke="#1f2937" strokeWidth="2" fill="none" />
              <ellipse cx="80" cy="182" rx="10" ry="8" fill="#fef3c7" />

              {/* Persona 2 - arriba a la derecha con laptop */}
              <ellipse cx="320" cy="180" rx="30" ry="12" fill="#1e1b4b" opacity="0.3" />
              <rect x="290" y="130" width="50" height="8" rx="2" fill="#374151" />
              <rect x="295" y="110" width="40" height="25" rx="3" fill="#60a5fa" />
              <circle cx="320" cy="95" r="18" fill="#fef3c7" />
              <path d="M302 90 Q320 78 338 90" stroke="#1f2937" strokeWidth="2" fill="none" />
              <rect x="300" y="130" width="40" height="45" rx="4" fill="#f3f4f6" />
              <path d="M290 175 Q280 160 295 150" stroke="#fef3c7" strokeWidth="8" fill="none" />
              <path d="M350 175 Q360 160 345 150" stroke="#fef3c7" strokeWidth="8" fill="none" />

              {/* Hojas decorativas */}
              <ellipse cx="350" cy="260" rx="20" ry="40" fill="#22c55e" opacity="0.6" transform="rotate(-20 350 260)" />
              <ellipse cx="340" cy="250" rx="15" ry="35" fill="#16a34a" opacity="0.7" transform="rotate(-35 340 250)" />
              <ellipse cx="60" cy="120" rx="12" ry="25" fill="#22c55e" opacity="0.5" transform="rotate(15 60 120)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Versión móvil del panel púrpura (visible solo en móvil) */}
      <div className="lg:hidden w-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 py-8 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome to student portal
        </h2>
        <p className="text-purple-100 text-sm">
          Recupera el acceso a tu cuenta
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;



