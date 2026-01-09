import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XMarkIcon, FingerPrintIcon } from '@heroicons/react/24/outline'
import { useWebAuthnLogin } from '../../hooks/useWebAuthnLogin'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { login } = useAuth()
  const { login: loginWithPasskey, loading: isPasskeyLoading } = useWebAuthnLogin()

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
      setSearchParams({})
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

  const handlePasskeyLogin = async () => {
    try {
      const response = await loginWithPasskey(email); // Pass email if typed, or undefined
      if (response && response.token) {
        // Manual session storage to match AuthService
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user_data', JSON.stringify(response.usuario));

        toast.success('¡Bienvenido! Inicio de sesión con Passkey exitoso')

        // Force reload to init AuthContext or redirect
        if (response.usuario.rol?.toLowerCase() === 'estudiante') {
          window.location.href = '/estudiante/inicio';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      console.error("Passkey error", error);
      toast.error("Error iniciando con huella/passkey");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const loggedUser = await login({ email, password })
      toast.success('¡Bienvenido! Inicio de sesión exitoso')

      if (loggedUser.rol?.toLowerCase() === 'estudiante') {
        navigate('/estudiante/inicio')
      } else {
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Error en login:', error)

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel Izquierdo - Formulario (Fondo Oscuro) */}
      <div className="w-full lg:w-1/2 bg-[#1a1a2e] flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Banner de Éxito - Reset de Contraseña */}
          {showSuccessBanner && (
            <div className="mb-6 animate-fade-in-down">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-300 text-sm font-medium flex-1">
                  Contraseña actualizada. Usa tu nueva contraseña para ingresar.
                </p>
                <button
                  onClick={() => setShowSuccessBanner(false)}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Título Login */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Login
            </h1>
            <p className="text-gray-400 text-base">
              Ingresa los datos de tu cuenta
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo de Username/Email */}
            <div>
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
                className={`block w-full px-0 py-3 bg-transparent border-0 border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-600'
                  } text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-base`}
                placeholder="Correo electrónico"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Campo de Contraseña */}
            <div>
              <div className="relative">
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
                  className={`block w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 ${errors.password ? 'border-red-500' : 'border-gray-600'
                    } text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-base`}
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Enlace Olvidé Contraseña */}
            <div className="text-left">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading || isPasskeyLoading}
              className={`w-full py-4 px-6 rounded-full font-semibold text-white transition-all duration-300 ${isLoading
                  ? 'bg-purple-600/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                </span>
              ) : (
                'Login'
              )}
            </button>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">O ingresa con</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Botón de Passkey */}
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={isLoading || isPasskeyLoading}
              className="w-full py-3 px-6 rounded-full font-semibold text-white border-2 border-purple-500 hover:bg-purple-500/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FingerPrintIcon className="h-6 w-6" />
              {isPasskeyLoading ? 'Verificando...' : 'Huella / FaceID'}
            </button>
          </form>

          {/* Enlace para registrarse */}
          <div className="mt-10 text-center">
            <p className="text-gray-500">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="inline-block px-4 py-2 ml-2 text-white border border-gray-600 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Registrarse
              </Link>
            </p>
          </div>
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
            Inicia sesión para acceder a tu cuenta
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

              {/* Círculo de seguridad/lock */}
              <circle cx="120" cy="220" r="35" fill="#7c3aed" opacity="0.9" />
              <circle cx="120" cy="220" r="25" fill="white" opacity="0.3" />
              <circle cx="120" cy="215" r="8" fill="white" />
              <rect x="112" y="218" width="16" height="12" rx="2" fill="white" />

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
          Inicia sesión para acceder a tu cuenta
        </p>
      </div>
    </div>
  )
}

export default LoginPage