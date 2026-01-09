import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, CheckCircleIcon, XMarkIcon, ShieldCheckIcon, FingerPrintIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useWebAuthnLogin } from '../../hooks/useWebAuthnLogin'

const LoginEstudiantePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { login: authLogin, refreshUser } = useAuth()
  const { login: loginWithPasskey } = useWebAuthnLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; captcha?: string }>({})
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  // CAPTCHA state
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  // Generate new alphanumeric CAPTCHA
  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded confusing: I, O, 0, 1
    let code = ''
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(code)
    setCaptchaAnswer('')
  }, [])

  // Initialize CAPTCHA and load saved email on mount
  useEffect(() => {
    generateCaptcha()

    // Cargar último email exitoso
    const lastEmail = localStorage.getItem('last_login_estudiante_email')
    if (lastEmail) {
      setEmail(lastEmail)
    }
  }, [generateCaptcha])

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
    const newErrors: { email?: string; password?: string; captcha?: string } = {}

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

    // Validate CAPTCHA
    if (!captchaAnswer) {
      newErrors.captcha = 'Ingresa el código de seguridad'
    } else if (captchaAnswer.toUpperCase() !== captchaCode) {
      newErrors.captcha = 'Código incorrecto'
      generateCaptcha() // Generate new captcha on wrong answer
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
      // Enviar tipo de usuario esperado al backend para validación
      const loggedUser = await authLogin({ email, password, tipoUsuario: 'Estudiante' })

      // Validación adicional en frontend: asegurar que el rol sea Estudiante
      if (loggedUser.rol?.toLowerCase() !== 'estudiante') {
        // Limpiar datos de autenticación si el rol no coincide
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        toast.error('Acceso denegado. Estas credenciales no corresponden a un estudiante.')
        setPassword('')
        return
      }

      // Guardar email para futuros inicios de sesión
      localStorage.setItem('last_login_estudiante_email', email)

      toast.success('¡Bienvenido! Inicio de sesión exitoso')
      navigate('/estudiante/inicio')
    } catch (error: any) {
      console.error('Error en login:', error)

      if (error.response?.status === 401) {
        toast.error('Correo o contraseña incorrectos')
      } else if (error.response?.status === 400) {
        toast.error('Datos de entrada inválidos')
      } else {
        toast.error('Error al iniciar sesión. Por favor, intente nuevamente')
      }

      setPassword('')
      generateCaptcha() // Regenerate CAPTCHA
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    try {
      // Pasamos el email para login directo si existe
      const response = await loginWithPasskey(email, 'estudiante');
      if (response && response.token) {
        // Guardar tokens y usuario en localStorage (claves de authService)
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user_data', JSON.stringify(response.usuario));

        // Actualizar estado de autenticación
        await refreshUser();

        // Validar rol
        const user = response.usuario;
        if (user.rol?.toLowerCase() !== 'estudiante') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          toast.error('Acceso denegado. Esta credencial no corresponde a un estudiante.');
          return;
        }

        // Guardar email para autocompletado
        if (user.email) {
          localStorage.setItem('last_login_estudiante_email', user.email);
        }

        toast.success(`¡Bienvenido ${user.nombre || 'Estudiante'}!`);
        navigate('/estudiante/inicio');
      }
    } catch (error: any) {
      console.error("Passkey error", error);
      // Mostrar mensaje específico si viene del backend (validación de rol)
      const errorMessage = error?.message || "Error iniciando con huella/passkey";
      toast.error(errorMessage);
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
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(8, 8, 8, 0.3)',
        }}
      />

      {/* Contenedor Principal */}
      <div
        className="relative max-w-sm w-full bg-white px-8 py-10 sm:px-10 sm:py-12 shadow-2xl border border-zinc-200/50"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {showSuccessBanner && (
          <div
            className="absolute -top-16 left-0 right-0 mx-auto max-w-md animate-fade-in-down"
            style={{ animation: 'fadeInDown 0.5s ease-out' }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-none shadow-lg"
              style={{ backgroundColor: '#10B981' }}
            >
              <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0" />
              <p className="text-white text-sm font-medium flex-1">
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
          <div className="mx-auto w-20 h-24 relative mb-4">
            <img
              src="/images/fondouni.svg"
              alt="Escudo Universitario"
              className="w-full h-full object-contain"
            />
          </div>



          <h2 className="text-2xl font-bold text-zinc-800">
            Portal Estudiante
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-zinc-700"
            >
              Correo Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-400' : 'border-zinc-200'
                  } rounded-none focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 transition-all duration-200 text-zinc-900 bg-white/80`}
                placeholder="estudiante@unas.edu.pe"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-zinc-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                className={`block w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-400' : 'border-zinc-200'
                  } rounded-none focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 transition-all duration-200 text-zinc-900 bg-white/80`}
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

          {/* CAPTCHA Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700">
              <ShieldCheckIcon className="inline h-4 w-4 mr-1" />
              Código de Seguridad
            </label>
            {/* Responsive row */}
            <div className="flex flex-row items-stretch gap-2">
              {/* CAPTCHA Code Display */}
              <div
                className="flex items-center justify-center px-3 py-2 rounded border border-zinc-300 bg-zinc-100 flex-1 min-w-0"
              >
                <span
                  className="text-base sm:text-lg font-bold select-none whitespace-nowrap"
                  style={{
                    fontFamily: 'Courier New, monospace',
                    color: '#374151',
                    letterSpacing: '2px',
                  }}
                >
                  {captchaCode}
                </span>
              </div>
              {/* Answer Input */}
              <input
                type="text"
                maxLength={5}
                value={captchaAnswer}
                onChange={(e) => {
                  setCaptchaAnswer(e.target.value.toUpperCase())
                  if (errors.captcha) setErrors({ ...errors, captcha: undefined })
                }}
                className={`flex-1 min-w-0 px-2 py-2 border ${errors.captcha ? 'border-red-400' : 'border-zinc-200'
                  } rounded focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 text-zinc-900 bg-white text-center text-sm sm:text-base font-semibold tracking-wider uppercase`}
                placeholder="Código"
              />
              {/* Refresh Button */}
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-3 py-2 border border-zinc-200 rounded hover:bg-zinc-50 transition-colors flex-shrink-0"
                title="Nuevo código"
              >
                <ArrowPathIcon className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            {errors.captcha && (
              <p className="mt-1 text-sm text-red-600">{errors.captcha}</p>
            )}
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-medium rounded-none transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg'
              }`}
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

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-zinc-500">O ingresa con</span>
          </div>
        </div>

        {/* Passkey Login Button */}
        <button
          type="button"
          onClick={handlePasskeyLogin}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-zinc-300 text-zinc-700 font-medium rounded hover:bg-zinc-50 transition-all duration-200 hover:shadow-sm"
        >
          <FingerPrintIcon className="h-5 w-5" />
          Huella / FaceID
        </button>

        {/* Link para recuperar contraseña */}
        <div className="mt-6 text-center">
          <Link
            to="/estudiante/forgot-password"
            className="text-sm font-medium hover:underline text-zinc-600 hover:text-zinc-900 transition-all"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
          <p className="text-xs text-zinc-500">
            Tu futuro comienza aquí.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginEstudiantePage
