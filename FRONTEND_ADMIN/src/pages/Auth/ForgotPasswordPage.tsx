import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5204/api'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setErrorMessage('Por favor, ingresa tu correo electrónico.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setErrorMessage('El formato del correo electrónico no es válido.')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    setErrorMessage('')
    setRecoveryToken(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email
      })

      if (response.data.success) {
        setStatus('success')
        // Si el backend devuelve el token (para desarrollo), lo guardamos
        if (response.data.token) {
          setRecoveryToken(response.data.token)
        }
      } else {
        // Mostrar mensaje de error del backend (usuario no registrado)
        setStatus('error')
        setErrorMessage(response.data.message || 'Usuario no registrado en el sistema.')
      }
    } catch (error: any) {
      // Mostrar error si el servidor responde con error
      if (error.response?.data?.message) {
        setStatus('error')
        setErrorMessage(error.response.data.message)
      } else {
        setStatus('error')
        setErrorMessage('Error al conectar con el servidor. Por favor, intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
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
      {/* Overlay con efecto bokeh/desenfocado */}
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0, 51, 102, 0.3)',
        }}
      />

      {/* Contenedor Principal - Tarjeta flotante */}
      <div 
        className="relative max-w-md w-full bg-white p-8 sm:p-10"
        style={{
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Logo y Marca */}
        <div className="text-center mb-6">
          {/* Escudo minimalista con libro */}
          <div className="mx-auto w-16 h-16 relative mb-4">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                boxShadow: '0 4px 14px rgba(0, 51, 102, 0.4)',
              }}
            >
              <div className="relative">
                <BookOpenIcon 
                  className="w-8 h-8"
                  style={{ color: '#C7A740' }}
                />
                <div 
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: '#C7A740' }}
                />
              </div>
            </div>
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px solid #C7A740',
                opacity: 0.6,
              }}
            />
          </div>
          
          {/* Etiqueta de Marca */}
          <h1 
            className="text-lg font-bold tracking-wider"
            style={{ 
              color: '#003366',
              fontFamily: "'Montserrat', 'Roboto', sans-serif",
              letterSpacing: '0.15em',
            }}
          >
            UNIVERSIDAD ACADEMICA
          </h1>
        </div>

        {/* Contenido según estado */}
        {status === 'success' ? (
          /* Vista de Éxito */
          <div className="text-center py-6">
            <div 
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
            >
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            
            <h2 
              className="text-xl sm:text-2xl font-bold mb-4"
              style={{ 
                color: '#003366',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              ¡Instrucciones enviadas!
            </h2>
            
            <p 
              className="text-sm mb-8 leading-relaxed"
              style={{ 
                color: '#4D4D4D',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
            </p>

            {/* Mostrar enlace de recuperación en modo desarrollo */}
            {recoveryToken && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-2">
                  🔧 Modo Desarrollo - Enlace de recuperación:
                </p>
                <Link
                  to={`/reset-password?token=${encodeURIComponent(recoveryToken)}`}
                  className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  Ir a restablecer contraseña →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-white font-bold rounded-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{
                backgroundColor: '#003366',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver al Inicio de Sesión
            </Link>
          </div>
        ) : (
          /* Vista de Formulario */
          <>
            {/* Título */}
            <h2 
              className="text-center text-xl sm:text-2xl font-bold mb-4"
              style={{ 
                color: '#003366',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              ¿Olvidaste tu Contraseña?
            </h2>

            {/* Instrucciones */}
            <p 
              className="text-center text-sm mb-6 leading-relaxed"
              style={{ 
                color: '#4D4D4D',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              Ingresa tu Correo Electrónico Universitario para recibir instrucciones de reseteo.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Campo de Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-2"
                  style={{ 
                    color: '#003366',
                    fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  }}
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5" style={{ color: '#6B7280' }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') {
                        setStatus('idle')
                        setErrorMessage('')
                      }
                    }}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      status === 'error' ? 'border-red-400' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed`}
                    style={{
                      fontFamily: "'Montserrat', 'Roboto', sans-serif",
                      fontSize: '0.95rem',
                    }}
                    placeholder="Correo Electrónico Universitario"
                  />
                </div>
              </div>

              {/* Mensaje de Error */}
              {status === 'error' && errorMessage && (
                <div 
                  className="flex items-start gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(192, 57, 43, 0.08)' }}
                >
                  <ExclamationCircleIcon 
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: '#C0392B' }}
                  />
                  <p 
                    className="text-sm"
                    style={{ 
                      color: '#C0392B',
                      fontFamily: "'Montserrat', 'Roboto', sans-serif",
                    }}
                  >
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Botón Enviar */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-bold rounded-lg transition-all duration-300 ${
                  isLoading ? 'cursor-not-allowed' : 'hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                style={{
                  backgroundColor: '#003366',
                  fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  letterSpacing: '0.05em',
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'ENVIAR INSTRUCCIONES'
                )}
              </button>

              {/* Enlace Volver */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline transition-all"
                  style={{ 
                    color: '#C7A740',
                    fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  }}
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Volver al Inicio de Sesión
                </Link>
              </div>
            </form>
          </>
        )}

        {/* Pie de Página */}
        <div className="mt-8 text-center">
          <p 
            className="text-sm italic"
            style={{ 
              color: '#808080',
              fontFamily: "'Montserrat', 'Roboto', sans-serif",
            }}
          >
            Tu futuro comienza aquí.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
