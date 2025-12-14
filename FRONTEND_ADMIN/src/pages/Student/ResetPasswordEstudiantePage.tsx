import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpenIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5251/api';

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

  // Fondo con imagen del campus
  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  // Vista de carga mientras se valida el token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={backgroundStyle}>
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(0, 51, 102, 0.3)',
          }}
        />
        <div className="relative max-w-md w-full bg-white rounded-lg p-8 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // Vista de token inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={backgroundStyle}>
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(0, 51, 102, 0.3)',
          }}
        />
        <div className="relative max-w-md w-full bg-white rounded-lg p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: '#003366', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
          >
            Enlace Inválido o Expirado
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.'}
          </p>
          <Link
            to="/estudiante/forgot-password"
            className="inline-block px-6 py-3 text-white font-bold rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#003366' }}
          >
            Solicitar Nuevo Enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={backgroundStyle}>
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0, 51, 102, 0.3)',
        }}
      />

      {/* Tarjeta Principal */}
      <div
        className="relative max-w-md w-full bg-white p-8 sm:p-10"
        style={{
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Logo y Marca */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 relative mb-4">
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                boxShadow: '0 4px 14px rgba(0, 51, 102, 0.4)',
              }}
            >
              <div className="relative">
                <BookOpenIcon className="w-8 h-8" style={{ color: '#C7A740' }} />
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: '#C7A740' }}
                />
              </div>
            </div>
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid #C7A740', opacity: 0.6 }}
            />
          </div>
          <h1
            className="text-lg font-bold tracking-wider"
            style={{
              color: '#003366',
              fontFamily: "'Montserrat', 'Roboto', sans-serif",
              letterSpacing: '0.15em',
            }}
          >
            ACADEMIA GLOBAL
          </h1>
        </div>

        {isSuccess ? (
          /* Vista de Confirmación */
          <div className="text-center py-8">
            <div
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
            >
              <CheckCircleIcon className="w-14 h-14 text-green-500" />
            </div>

            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: '#003366', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
            >
              ¡Contraseña Actualizada Exitosamente!
            </h2>

            <p
              className="text-base mb-8 leading-relaxed"
              style={{ color: '#4D4D4D', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
            >
              Tu contraseña ha sido restablecida correctamente.<br />
              Ya puedes acceder a tu cuenta con tu nueva contraseña.
            </p>

            <button
              onClick={() => navigate('/estudiante/login?passwordReset=success')}
              autoFocus
              className="w-full py-4 px-6 text-white font-bold rounded-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-300"
              style={{
                backgroundColor: '#003366',
                fontFamily: "'Montserrat', 'Roboto', sans-serif",
                letterSpacing: '0.05em',
              }}
            >
              Ir al Portal de Acceso
            </button>

            <p
              className="mt-6 text-sm"
              style={{ color: '#808080', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
            >
              Serás redirigido automáticamente en{' '}
              <span className="font-semibold" style={{ color: '#003366' }}>
                {countdown}
              </span>{' '}
              segundos
            </p>

            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  backgroundColor: '#003366',
                  width: `${((15 - countdown) / 15) * 100}%`,
                }}
              />
            </div>

            <p
              className="mt-8 text-sm italic"
              style={{ color: '#808080', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
            >
              Tu futuro comienza aquí.
            </p>
          </div>
        ) : (
          /* Formulario de Reseteo */
          <>
            <h2
              className="text-center text-xl sm:text-2xl font-bold mb-3"
              style={{ color: '#003366', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
            >
              Establece tu Nueva Contraseña
            </h2>

            <p
              className="text-center text-sm mb-6 leading-relaxed"
              style={{ color: '#4D4D4D', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
            >
              Ingresa y confirma tu nueva contraseña. Debe ser fuerte y única.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Campo Nueva Contraseña */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#003366', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
                >
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                    placeholder="Nueva Contraseña"
                    style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
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
              </div>

              {/* Campo Confirmar Contraseña */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#003366', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-green-400 focus:ring-green-500'
                          : 'border-red-400 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-600'
                    }`}
                    placeholder="Confirmar Contraseña"
                    style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
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
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
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
              <div className="bg-gray-50 rounded-lg p-4">
                <h4
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: '#003366' }}
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                  Requisitos de Contraseña
                </h4>
                <ul className="space-y-2">
                  {requirementStatus.map((req) => (
                    <li
                      key={req.id}
                      className={`flex items-center gap-2 text-sm transition-all ${
                        req.met ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {req.met ? (
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span style={{ fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-bold rounded-lg transition-all duration-300 ${
                  isFormValid && !isLoading
                    ? 'hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                }`}
                style={{
                  backgroundColor: isFormValid ? '#003366' : '#9CA3AF',
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
                    Restableciendo...
                  </>
                ) : (
                  'RESTABLECER Y ACCEDER'
                )}
              </button>

              {/* Enlace Volver */}
              <div className="text-center">
                <Link
                  to="/estudiante/login"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline transition-all"
                  style={{ color: '#C7A740', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
                >
                  ← Volver al Inicio de Sesión
                </Link>
              </div>
            </form>
          </>
        )}

        {/* Pie de Página */}
        <div className="mt-8 text-center">
          <p
            className="text-sm italic"
            style={{ color: '#808080', fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
          >
            Tu futuro comienza aquí.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEstudiantePage;

