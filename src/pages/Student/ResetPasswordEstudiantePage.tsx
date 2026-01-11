import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Requisitos de contraseña
interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Mínimo 10 caracteres',
    validator: (p) => p.length >= 10,
  },
  {
    id: 'uppercase',
    label: 'Al menos una letra mayúscula',
    validator: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'Al menos una letra minúscula',
    validator: (p) => /[a-z]/.test(p),
  },
  {
    id: 'number',
    label: 'Al menos un número',
    validator: (p) => /[0-9]/.test(p),
  },
  {
    id: 'special',
    label: 'Al menos un carácter especial (!@#$%^&*)',
    validator: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

const ResetPasswordEstudiantePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [countdown, setCountdown] = useState(15);

  const token = searchParams.get('token');

  // Validar token al cargar la página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsValidatingToken(false);
        setError('No se proporcionó un token de recuperación válido.');
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/validate-reset-token`, {
          Token: token
        });

        if (response.data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(response.data.message || 'Token inválido o expirado.');
        }
      } catch (err: any) {
        console.error('Error validating token:', err);
        setTokenValid(false);
        setError(err.response?.data?.message || 'Error al validar el token.');
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  // Efecto para la redirección automática después del éxito
  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/estudiante/login?passwordReset=success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, navigate]);

  // Validación de requisitos en tiempo real
  const requirementStatus = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      met: req.validator(newPassword),
    }));
  }, [newPassword]);

  // Verificar si todos los requisitos están cumplidos
  const allRequirementsMet = useMemo(() => {
    return requirementStatus.every((req) => req.met);
  }, [requirementStatus]);

  // Verificar si las contraseñas coinciden
  const passwordsMatch = useMemo(() => {
    return newPassword === confirmPassword && confirmPassword.length > 0;
  }, [newPassword, confirmPassword]);

  // El botón está habilitado solo si todos los requisitos se cumplen y las contraseñas coinciden
  const isFormValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Por favor, cumple con todos los requisitos de contraseña.');
      return;
    }

    if (!token) {
      setError('Token de recuperación inválido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        Token: token,
        NewPassword: newPassword,
        ConfirmPassword: confirmPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
      } else {
        setError(response.data.message || 'Error al restablecer la contraseña');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al conectar con el servidor. Por favor, intente más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para el panel derecho (reutilizable)
  const RightPanel = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="hidden lg:flex w-1/2 bg-[#404040] items-center justify-center p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 text-center max-w-md w-full">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'inherit' }}>{title}</h2>
        <p className="text-[#d4d4d4] text-lg mb-10" style={{ fontFamily: 'inherit' }}>{subtitle}</p>
        {/* Ilustración SVG Profesional - Seguridad grande y detallada */}
        <div className="relative mx-auto w-full max-w-lg">
          <svg viewBox="0 0 600 500" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Candado principal - grande y bien formado */}
            <g id="lock-main">
              <rect x="220" y="160" width="160" height="200" rx="12" fill="#ffffff" stroke="#ffffff" strokeWidth="4" />
              {/* Arco del candado - más grande */}
              <path d="M 220 160 Q 220 120 300 120 Q 380 120 380 160" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
              {/* Cuerpo del candado */}
              <rect x="250" y="240" width="100" height="120" rx="8" fill="#404040" opacity="0.2" />
              {/* Agujero de la llave - más grande */}
              <circle cx="300" cy="300" r="18" fill="#404040" opacity="0.3" />
              {/* Detalles del candado */}
              <rect x="270" y="250" width="60" height="8" rx="2" fill="#404040" opacity="0.4" />
            </g>

            {/* Escudo de seguridad grande (arriba) */}
            <g id="shield">
              <path d="M 300 60 L 200 120 L 200 200 Q 200 240 240 260 Q 300 280 360 260 Q 400 240 400 200 L 400 120 Z" fill="#ffffff" opacity="0.95" stroke="#ffffff" strokeWidth="4" />
              <path d="M 270 160 L 300 190 L 330 160" stroke="#404040" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="300" y1="160" x2="300" y2="180" stroke="#404040" strokeWidth="3" />
            </g>

            {/* Llave grande (lado izquierdo) */}
            <g id="key">
              <circle cx="100" cy="250" r="30" fill="#ffffff" stroke="#ffffff" strokeWidth="3" />
              <rect x="100" y="250" width="70" height="15" rx="6" fill="#ffffff" stroke="#ffffff" strokeWidth="3" />
              <rect x="165" y="245" width="20" height="25" rx="4" fill="#ffffff" stroke="#ffffff" strokeWidth="3" />
              {/* Dientes de la llave */}
              <rect x="170" y="250" width="8" height="15" rx="2" fill="#404040" opacity="0.4" />
            </g>

            {/* Check mark de seguridad (lado derecho) */}
            <g id="check-mark">
              <circle cx="480" cy="250" r="40" fill="#ffffff" opacity="0.9" stroke="#ffffff" strokeWidth="3" />
              <path d="M 460 250 L 475 265 L 500 235" stroke="#404040" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );

  // Vista de carga mientras se valida el token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e5e5e5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Fondo con formas borrosas y gradientes */}
        <div className="absolute inset-0">
          {/* Gradiente base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e5e5e5]"></div>

          {/* Formas borrosas decorativas - más grandes y suaves */}
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-[#d8d8d8] to-[#c8c8c8] rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-gradient-to-tl from-[#d0d0d0] to-[#b8b8b8] rounded-full blur-[140px] opacity-35"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#d4d4d4] to-[#c4c4c4] rounded-full blur-[130px] opacity-30"></div>

          {/* Patrón de cuadrícula sutil */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          ></div>

          {/* Líneas diagonales decorativas */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)`
            }}
          ></div>
        </div>
        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#e5e5e5] p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#525252] mx-auto mb-4"></div>
            <p className="text-[#404040]">Validando enlace de recuperación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Vista de token inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e5e5e5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Fondo con formas borrosas y gradientes */}
        <div className="absolute inset-0">
          {/* Gradiente base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e5e5e5]"></div>

          {/* Formas borrosas decorativas - más grandes y suaves */}
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-[#d8d8d8] to-[#c8c8c8] rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-gradient-to-tl from-[#d0d0d0] to-[#b8b8b8] rounded-full blur-[140px] opacity-35"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#d4d4d4] to-[#c4c4c4] rounded-full blur-[130px] opacity-30"></div>

          {/* Patrón de cuadrícula sutil */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          ></div>

          {/* Líneas diagonales decorativas */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)`
            }}
          ></div>
        </div>
        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#e5e5e5]">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircleIcon className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
                  Enlace Inválido o Expirado
                </h2>
                <p className="text-[#525252] mb-8">
                  {error || 'El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.'}
                </p>
                <Link
                  to="/estudiante/forgot-password"
                  className="inline-flex items-center justify-center w-full py-3.5 px-4 rounded-lg font-semibold text-white bg-[#525252] hover:bg-[#404040] hover:shadow-md transition-all duration-200"
                >
                  Solicitar Nuevo Enlace
                </Link>
              </div>
              <RightPanel
                title="Restablece tu contraseña"
                subtitle="Solicita un nuevo enlace de recuperación"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e5e5e5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Fondo con formas borrosas y gradientes */}
      <div className="absolute inset-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e5e5e5]"></div>

        {/* Formas borrosas decorativas - más grandes y suaves */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-[#d8d8d8] to-[#c8c8c8] rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-gradient-to-tl from-[#d0d0d0] to-[#b8b8b8] rounded-full blur-[140px] opacity-35"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-[#d4d4d4] to-[#c4c4c4] rounded-full blur-[130px] opacity-30"></div>

        {/* Patrón de cuadrícula sutil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>

        {/* Líneas diagonales decorativas */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)`
          }}
        ></div>
      </div>
      {/* Patrón de fondo decorativo sutil */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4d4d4] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a8a8a8] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#e5e5e5]" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex flex-col lg:flex-row">
            {/* Panel Izquierdo - Formulario */}
            <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {/* Logo y Título */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="/images/fondouni.svg"
                      alt="Logo Universidad"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[#1a1a1a]">UNIVERSIDAD ACADÉMICA</h1>
                    <p className="text-sm text-[#525252]">Portal Estudiante</p>
                  </div>
                </div>
              </div>

              {isSuccess ? (
                /* Vista de Confirmación */
                <div className="text-center py-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-8">
                    <CheckCircleIcon className="w-14 h-14 text-emerald-600" />
                  </div>

                  <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
                    ¡Contraseña Actualizada!
                  </h2>

                  <p className="text-[#525252] mb-8">
                    Tu contraseña ha sido restablecida correctamente.<br />
                    Ya puedes acceder a tu cuenta con tu nueva contraseña.
                  </p>

                  <button
                    onClick={() => navigate('/estudiante/login?passwordReset=success')}
                    autoFocus
                    className="w-full py-3.5 px-4 rounded-lg font-semibold text-white bg-[#525252] hover:bg-[#404040] hover:shadow-md transition-all duration-200"
                  >
                    Ir al Portal de Acceso
                  </button>

                  <p className="mt-6 text-sm text-[#737373]">
                    Serás redirigido automáticamente en{' '}
                    <span className="font-semibold text-[#404040]">{countdown}</span> segundos
                  </p>

                  <div className="mt-3 w-full bg-[#e5e5e5] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-linear bg-[#525252]"
                      style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* Formulario de Reseteo */
                <>
                  {/* Botón volver */}
                  <Link
                    to="/estudiante/login"
                    className="inline-flex items-center text-[#525252] hover:text-[#1a1a1a] transition-colors mb-6"
                  >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Volver al inicio de sesión
                  </Link>

                  {/* Título */}
                  <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-2">
                      Nueva Contraseña
                    </h2>
                    <p className="text-[#525252]">
                      Ingresa y confirma tu nueva contraseña
                    </p>
                  </div>

                  {/* Mensaje de Error */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Campo Nueva Contraseña */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                          className="block w-full px-4 py-3 pr-12 border border-[#d4d4d4] rounded-lg text-[#1a1a1a] placeholder-[#737373] focus:outline-none focus:ring-1 focus:ring-[#a8a8a8] focus:border-[#a8a8a8] transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373] hover:text-[#404040] transition-colors"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Campo Confirmar Contraseña */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#404040] mb-2">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className={`block w-full px-4 py-3 pr-12 border rounded-lg transition-all ${confirmPassword.length > 0
                              ? passwordsMatch
                                ? 'border-emerald-500 focus:ring-emerald-300'
                                : 'border-red-400 focus:ring-red-300'
                              : 'border-[#d4d4d4] focus:ring-[#a8a8a8]'
                            } text-[#1a1a1a] placeholder-[#737373] focus:outline-none focus:ring-1`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373] hover:text-[#404040] transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && (
                        <p className={`mt-1.5 text-sm flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                          {passwordsMatch ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4" /> Las contraseñas coinciden
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-4 h-4" /> Las contraseñas no coinciden
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Requisitos de Fortaleza */}
                    <div className="bg-[#fafafa] rounded-xl p-4 border border-[#e5e5e5]">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#404040]">
                        <ShieldCheckIcon className="w-5 h-5 text-[#525252]" />
                        Requisitos de Contraseña
                      </h4>
                      <ul className="space-y-2">
                        {requirementStatus.map((req) => (
                          <li
                            key={req.id}
                            className={`flex items-center gap-2 text-sm transition-all ${req.met ? 'text-emerald-600' : 'text-[#737373]'
                              }`}
                          >
                            {req.met ? (
                              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span>{req.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botón Submit */}
                    <button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className={`w-full py-3.5 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isFormValid && !isLoading
                          ? 'bg-[#525252] hover:bg-[#404040] hover:shadow-md active:scale-[0.98]'
                          : 'bg-[#a8a8a8] cursor-not-allowed'
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
                          Restableciendo...
                        </span>
                      ) : (
                        'Restablecer Contraseña'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Panel Derecho */}
            <RightPanel
              title="Restablece tu contraseña"
              subtitle="Crea una contraseña segura para tu cuenta"
            />
          </div>
        </div>

        {/* Versión móvil del panel derecho */}
        <div className="lg:hidden w-full bg-[#404040] py-8 px-6 text-center rounded-b-xl relative overflow-hidden mt-4">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-2xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'inherit' }}>
              Restablece tu contraseña
            </h2>
            <p className="text-[#d4d4d4] text-sm" style={{ fontFamily: 'inherit' }}>
              Crea una contraseña segura para tu cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEstudiantePage;

