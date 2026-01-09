import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocenteAuth } from '../../contexts/DocenteAuthContext';
import { docenteAuthApi } from '../../services/docenteApi';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon, FingerPrintIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useWebAuthnLogin } from '../../hooks/useWebAuthnLogin';

export const LoginDocentePage: React.FC = () => {
    const navigate = useNavigate();
    const { login: authLogin } = useDocenteAuth();
    const { login: loginWithPasskey } = useWebAuthnLogin();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ correo?: string; password?: string; captcha?: string }>({});

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
        const lastEmail = localStorage.getItem('last_login_docente_email')
        if (lastEmail) {
            setCorreo(lastEmail)
        }
    }, [generateCaptcha])

    const validateForm = (): boolean => {
        const newErrors: { correo?: string; password?: string; captcha?: string } = {};
        if (!correo) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            newErrors.correo = 'El formato del correo no es válido';
        }
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Validate CAPTCHA
        if (!captchaAnswer) {
            newErrors.captcha = 'Ingresa el código de seguridad'
        } else if (captchaAnswer.toUpperCase() !== captchaCode) {
            newErrors.captcha = 'Código incorrecto'
            generateCaptcha() // Generate new captcha on wrong answer
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await docenteAuthApi.login({ correo, password });

            // Guardar email para futuros inicios de sesión
            localStorage.setItem('last_login_docente_email', correo)

            authLogin(response);
            toast.success(`¡Bienvenido ${response.nombreCompleto || 'Docente'}!`);
            navigate('/docente/dashboard');
        } catch (error: any) {
            console.error('Error en login de docente:', error);
            if (error.response?.status === 401) {
                toast.error('Correo o contraseña incorrectos');
            } else if (error.response?.status === 400) {
                toast.error('Datos de entrada inválidos');
            } else {
                toast.error('Error al iniciar sesión. Por favor, intente nuevamente');
            }
            generateCaptcha(); // Regenerate CAPTCHA
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        try {
            // Pasamos el email (que puede venir del autocompletado) para ir directo
            const response = await loginWithPasskey(correo);
            if (response && response.token) {
                // Mapear respuesta de WebAuthn a estructura de AuthDocenteResponse
                // Asumiendo que response.usuario tiene los campos necesarios
                const authData = {
                    id: response.usuario.id || 0, // Fallback si no viene id
                    nombreCompleto: response.usuario.nombreCompleto || response.usuario.nombre || 'Docente',
                    correo: response.usuario.email || response.usuario.correo,
                    token: response.token,
                    refreshToken: response.refreshToken,
                    expiracion: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString() // Fake expiration 24h if not provided
                };

                // Guardar email para futuros inicios de sesión
                if (authData.correo) {
                    localStorage.setItem('last_login_docente_email', authData.correo);
                }

                authLogin(authData);
                toast.success(`¡Bienvenido ${authData.nombreCompleto}!`);
                navigate('/docente/dashboard');
            }
        } catch (error: any) {
            console.error("Passkey error", error);
            toast.error("Error iniciando con huella/passkey");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} >
            {/* Overlay */}
            <div className="absolute inset-0" style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(8, 8, 8, 0.3)' }} />

            {/* Contenedor Principal */}
            <div className="relative max-w-sm w-full bg-white px-8 py-10 sm:px-10 sm:py-12 shadow-2xl border border-zinc-200/50" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} >

                {/* Logo y Marca */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-24 relative mb-4">
                        <img src="/src/image/fondouni.svg" alt="Escudo Universitario" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-bold tracking-wider text-zinc-800 mb-2">
                        UNIVERSIDAD ACADEMICA
                    </h1>
                    <h2 className="text-2xl font-bold text-zinc-800">
                        Portal Docente
                    </h2>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Campo Correo */}
                    <div>
                        <label htmlFor="correo" className="block text-sm font-medium mb-2 text-zinc-700" >
                            Correo Institucional
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="correo"
                                type="email"
                                value={correo}
                                onChange={(e) => {
                                    setCorreo(e.target.value);
                                    if (errors.correo) setErrors({ ...errors, correo: undefined });
                                }}
                                className={`block w-full pl-10 pr-3 py-3 border ${errors.correo ? 'border-red-400' : 'border-zinc-200'
                                    } focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 transition-all duration-200 text-zinc-900 bg-white/80`}
                                placeholder="docente@unas.edu.pe"
                            />
                        </div>
                        {errors.correo && (
                            <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2 text-zinc-700" >
                            Contraseña
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: undefined });
                                }}
                                className={`block w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-400' : 'border-zinc-200'
                                    } focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 transition-all duration-200 text-zinc-900 bg-white/80`}
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
                        className={`w-full flex justify-center items-center py-3.5 px-4 text-white font-medium transition-all duration-200 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg'
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
                        to="/docente/forgot-password"
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
    );
};

export default LoginDocentePage;