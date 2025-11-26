import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, BookOpenIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  // Verificar si viene de un reset de contraseña exitoso
  useEffect(() => {
    if (searchParams.get('passwordReset') === 'success') {
      setShowSuccessBanner(true)
      // Limpiar el parámetro de la URL
      setSearchParams({})
      // Ocultar el banner después de 8 segundos
      const timer = setTimeout(() => {
        setShowSuccessBanner(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, setSearchParams])

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El formato del email no es válido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login({ email, password })
      toast.success('¡Bienvenido! Inicio de sesión exitoso')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)

      if (error.response?.status === 401) {
        toast.error('Email o contraseña incorrectos')
      } else if (error.response?.status === 400) {
        toast.error('Datos de entrada inválidos')
      } else {
        toast.error('Error al iniciar sesión. Por favor, intente nuevamente')
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
        className="relative max-w-md w-full bg-white p-8 sm:p-10 shadow-2xl"
        style={{
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Banner de Éxito - Reset de Contraseña */}
        {showSuccessBanner && (
          <div
            className="absolute -top-16 left-0 right-0 mx-auto max-w-md animate-fade-in-down"
            style={{ animation: 'fadeInDown 0.5s ease-out' }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
              style={{ backgroundColor: '#10B981' }}
            >
              <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0" />
              <p
                className="text-white text-sm font-medium flex-1"
                style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
              >
                Sesión exitosa. Usa tu nueva contraseña para ingresar.
              </p>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Logo y Marca */}
        <div className="text-center mb-8">
          {/* Escudo minimalista con libro */}
          <div className="mx-auto w-20 h-20 relative mb-4">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                boxShadow: '0 4px 14px rgba(0, 51, 102, 0.4)',
              }}
            >
              <div className="relative">
                <BookOpenIcon 
                  className="w-10 h-10"
                  style={{ color: '#C7A740' }}
                />
                {/* Detalles dorados del escudo */}
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#C7A740' }}
                />
              </div>
            </div>
            {/* Borde decorativo dorado */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid #C7A740',
                opacity: 0.6,
              }}
            />
          </div>
          
          {/* Etiqueta de Marca */}
          <h1 
            className="text-xl font-bold tracking-wider"
            style={{ 
              color: '#003366',
              fontFamily: "'Montserrat', 'Roboto', sans-serif",
              letterSpacing: '0.15em',
            }}
          >
            UNIVERSIDAD ACADEMICA
          </h1>
        </div>

        {/* Título de la Pantalla */}
        <h2 
          className="text-center text-2xl sm:text-3xl font-bold mb-8"
          style={{ 
            color: '#003366',
            fontFamily: "'Montserrat', 'Roboto', sans-serif",
          }}
        >
          Acceso al Portal Académico
        </h2>

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
                  setErrors({ ...errors, email: undefined })
                }}
                className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-400' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                style={{
                  fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  fontSize: '0.95rem',
                }}
                placeholder="Correo Electrónico Universitario"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ 
                color: '#003366',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5" style={{ color: '#6B7280' }} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors({ ...errors, password: undefined })
                }}
                className={`block w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-400' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                style={{
                  fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  fontSize: '0.95rem',
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" style={{ color: '#6B7280' }} />
                ) : (
                  <EyeIcon className="h-5 w-5" style={{ color: '#6B7280' }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Enlace Olvidé Contraseña */}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium hover:underline transition-all"
              style={{ 
                color: '#C7A740',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

         

          {/* Botón de Iniciar Sesión */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-bold rounded-lg transition-all duration-300 ${
              isLoading ? 'cursor-not-allowed opacity-80' : 'hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5'
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
                Iniciando sesión...
              </>
            ) : (
              'INICIAR SESIÓN'
            )}
          </button>
        </form>

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

export default LoginPage
