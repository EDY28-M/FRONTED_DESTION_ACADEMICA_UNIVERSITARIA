import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { id: 'length', label: 'Mínimo 10 caracteres', validator: (p) => p.length >= 10 },
  { id: 'uppercase', label: 'Una mayúscula', validator: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Una minúscula', validator: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Un número', validator: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial (!@#$%^&*)', validator: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const ResetPasswordAdminPage = () => {
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

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsValidatingToken(false);
        setError('No se proporcionó un token de recuperación válido.');
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/validate-reset-token`, { Token: token });
        if (response.data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(response.data.message || 'Token inválido o expirado.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setError(err.response?.data?.message || 'Error al validar el token.');
      } finally {
        setIsValidatingToken(false);
      }
    };
    validateToken();
  }, [token]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); navigate('/admin/login?passwordReset=success'); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSuccess, navigate]);

  const requirementStatus = useMemo(() => passwordRequirements.map((req) => ({ ...req, met: req.validator(newPassword) })), [newPassword]);
  const allRequirementsMet = useMemo(() => requirementStatus.every((req) => req.met), [requirementStatus]);
  const passwordsMatch = useMemo(() => newPassword === confirmPassword && confirmPassword.length > 0, [newPassword, confirmPassword]);
  const isFormValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isFormValid) { setError('Cumple con todos los requisitos de contraseña.'); return; }
    if (!token) { setError('Token de recuperación inválido'); return; }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { Token: token, NewPassword: newPassword, ConfirmPassword: confirmPassword });
      if (response.data.success) { setIsSuccess(true); } else { setError(response.data.message || 'Error al restablecer la contraseña'); }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor.');
    } finally { setIsLoading(false); }
  };

  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80')`,
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
  };

  // Loading
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={backgroundStyle}>
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(8, 8, 8, 0.3)' }} />
        <div className="relative max-w-sm w-full bg-white px-8 py-10 shadow-2xl border border-zinc-200/50 text-center" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-700 mx-auto mb-4"></div>
          <p className="text-zinc-600 text-sm">Validando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // Token inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={backgroundStyle}>
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(8, 8, 8, 0.3)' }} />
        <div className="relative max-w-sm w-full bg-white px-8 py-10 sm:px-10 sm:py-12 shadow-2xl border border-zinc-200/50 text-center" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div className="mx-auto w-16 h-20 relative mb-4">
            <img src="/images/fondouni.svg" alt="Escudo Universitario" className="w-full h-full object-contain" />
          </div>
          <div className="mx-auto w-14 h-14 rounded-none bg-red-100 flex items-center justify-center mb-4">
            <XCircleIcon className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 mb-2">Enlace Inválido o Expirado</h2>
          <p className="text-zinc-500 text-sm mb-6">{error || 'El enlace no es válido o ha expirado. Solicita uno nuevo.'}</p>
          <Link to="/admin/forgot-password" className="inline-flex items-center justify-center w-full py-3.5 px-4 rounded-none text-white font-medium transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 hover:shadow-lg">
            Solicitar Nuevo Enlace
          </Link>
          <div className="mt-5 text-center">
            <Link to="/admin/login" className="inline-flex items-center text-sm font-medium hover:underline text-zinc-600 hover:text-zinc-900 transition-all">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Volver al inicio de sesión
            </Link>
          </div>
          <div className="mt-6 pt-5 border-t border-zinc-200 text-center">
            <p className="text-xs text-zinc-500">Tu futuro comienza aquí.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 relative" style={backgroundStyle}>
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(8, 8, 8, 0.3)' }} />

      <div className="relative max-w-sm w-full bg-white px-8 py-7 sm:px-9 sm:py-8 shadow-2xl border border-zinc-200/50" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="mx-auto w-20 h-24 relative mb-2">
            <img src="/images/fondouni.svg" alt="Escudo Universitario" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800">Restablecer Contraseña</h2>
          <p className="text-zinc-500 text-sm mt-1">Ingresa y confirma tu nueva contraseña.</p>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-none bg-green-100 flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-800 mb-2">¡Contraseña Actualizada!</h2>
            <p className="text-zinc-500 text-sm mb-5">Tu contraseña ha sido restablecida correctamente.</p>
            <button
              onClick={() => navigate('/admin/login?passwordReset=success')}
              autoFocus
              className="w-full flex justify-center items-center py-3.5 px-4 text-white font-medium rounded-none transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 hover:shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" /> Ir al Portal de Acceso
            </button>
            <p className="mt-5 text-sm text-zinc-500">
              Redirigido en <span className="font-semibold text-zinc-800">{countdown}</span> segundos
            </p>
            <div className="mt-2 w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-linear bg-zinc-700" style={{ width: `${((15 - countdown) / 15) * 100}%` }} />
            </div>
            <div className="mt-6 pt-5 border-t border-zinc-200">
              <p className="text-xs text-zinc-500">Tu futuro comienza aquí.</p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-none flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Nueva Contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-1.5 text-zinc-700">Nueva Contraseña</label>
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
                    className="block w-full pl-10 pr-10 py-2.5 border border-zinc-200 rounded-none focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 transition-all text-zinc-900 bg-white/80"
                    placeholder="••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-zinc-700">Confirmar Contraseña</label>
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
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-none focus:outline-none focus:ring-2 focus:border-transparent transition-all text-zinc-900 bg-white/80 ${confirmPassword.length > 0
                      ? passwordsMatch ? 'border-green-400 focus:ring-green-500/20' : 'border-red-400 focus:ring-red-500/20'
                      : 'border-zinc-200 focus:ring-zinc-500/20 focus:border-zinc-400'
                      }`}
                    placeholder="••••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Las contraseñas coinciden</> : <><XCircleIcon className="w-3.5 h-3.5" /> Las contraseñas no coinciden</>}
                  </p>
                )}
              </div>

              {/* Requisitos en grid 2 columnas */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-none p-3">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-zinc-700">
                  <ShieldCheckIcon className="w-4 h-4" /> Requisitos de Contraseña
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {requirementStatus.map((req) => (
                    <div key={req.id} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-600' : 'text-red-500'}`}>
                      {req.met ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> : <XCircleIcon className="w-4 h-4 flex-shrink-0" />}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-medium rounded-none transition-all duration-200 ${isFormValid && !isLoading
                  ? 'bg-zinc-700 hover:bg-zinc-600 hover:shadow-lg cursor-pointer'
                  : 'bg-zinc-400 cursor-not-allowed opacity-50'
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Restableciendo...
                  </>
                ) : 'Restablecer Contraseña'}
              </button>

              <div className="text-center">
                <Link to="/admin/login" className="inline-flex items-center text-sm font-medium hover:underline text-zinc-600 hover:text-zinc-900 transition-all">
                  <ArrowLeftIcon className="w-4 h-4 mr-1" /> Volver al inicio de sesión
                </Link>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-200 text-center">
              <p className="text-xs text-zinc-500">Tu futuro comienza aquí.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordAdminPage;
