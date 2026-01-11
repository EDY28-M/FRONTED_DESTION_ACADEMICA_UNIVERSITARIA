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

const ResetPasswordPage = () => {
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
            navigate('/login?passwordReset=success');
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

  // Vista de carga mientras se valida el token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 bg-[#1a1a2e] flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Validando enlace de recuperación...</p>
          </div>
        </div>
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-800/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    );
  }

  // Vista de token inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 bg-[#1a1a2e] flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Enlace Inválido o Expirado
            </h2>
            <p className="text-gray-400 mb-8">
              {error || 'El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.'}
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full py-4 px-6 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-800/30 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center max-w-lg">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Welcome to</h2>
            <h3 className="text-4xl sm:text-5xl font-bold text-white/90 mb-6">student portal</h3>
            <p className="text-purple-100 text-lg">Restablece tu contraseña de forma segura</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel Izquierdo - Formulario (Fondo Oscuro) */}
      <div className="w-full lg:w-1/2 bg-[#1a1a2e] flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {isSuccess ? (
            /* Vista de Confirmación */
            <div className="text-center py-8">
              <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8">
                <CheckCircleIcon className="w-14 h-14 text-emerald-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                ¡Contraseña Actualizada!
              </h2>

              <p className="text-gray-400 mb-8">
                Tu contraseña ha sido restablecida correctamente.<br />
                Ya puedes acceder a tu cuenta con tu nueva contraseña.
              </p>

              <button
                onClick={() => navigate('/login?passwordReset=success')}
                autoFocus
                className="w-full py-4 px-6 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Ir al Portal de Acceso
              </button>

              <p className="mt-6 text-sm text-gray-500">
                Serás redirigido automáticamente en{' '}
                <span className="font-semibold text-purple-400">{countdown}</span> segundos
              </p>

              <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-purple-600 to-purple-500"
                  style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Formulario de Reseteo */
            <>
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
                  Nueva Contraseña
                </h1>
                <p className="text-gray-400 text-base">
                  Ingresa y confirma tu nueva contraseña
                </p>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Campo Nueva Contraseña */}
                <div>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="block w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-base"
                      placeholder="Nueva Contraseña"
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
                </div>

                {/* Campo Confirmar Contraseña */}
                <div>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className={`block w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 ${confirmPassword.length > 0
                          ? passwordsMatch
                            ? 'border-emerald-500'
                            : 'border-red-500'
                          : 'border-gray-600'
                        } text-white placeholder-gray-500 focus:outline-none transition-colors text-base`}
                      placeholder="Confirmar Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`mt-2 text-xs flex items-center gap-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
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
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-300">
                    <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
                    Requisitos de Contraseña
                  </h4>
                  <ul className="space-y-2">
                    {requirementStatus.map((req) => (
                      <li
                        key={req.id}
                        className={`flex items-center gap-2 text-sm transition-all ${req.met ? 'text-emerald-400' : 'text-gray-500'
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
                  className={`w-full py-4 px-6 rounded-full font-semibold text-white transition-all duration-300 ${isFormValid && !isLoading
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
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
            Restablece tu contraseña de forma segura
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

              {/* Círculo de seguridad/shield */}
              <circle cx="120" cy="220" r="35" fill="#7c3aed" opacity="0.9" />
              <circle cx="120" cy="220" r="25" fill="white" opacity="0.3" />
              <path d="M120 200 L105 210 L105 225 Q105 235 120 240 Q135 235 135 225 L135 210 Z" fill="white" />
              <path d="M113 220 L118 225 L127 215" stroke="#7c3aed" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

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
          Restablece tu contraseña de forma segura
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;


