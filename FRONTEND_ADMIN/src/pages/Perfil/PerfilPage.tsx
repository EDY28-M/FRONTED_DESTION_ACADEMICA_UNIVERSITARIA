import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { 
  User, Lock, Mail, Calendar, Shield, CheckCircle2, 
  AlertCircle, Eye, EyeOff, X, Activity, Fingerprint, 
  Smartphone, Globe, Clock
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerfilPage() {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openChangePassword) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mínimo 6 caracteres' });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      await createNotification({
        type: 'docente',
        action: 'editar',
        nombre: 'Contraseña actualizada'
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsModalOpen(false);
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cambiar contraseña' 
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setMessage(null);
  };

  if (!user) return null;

  const getInitials = () => `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Configuración de Cuenta
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona tu información personal y seguridad
          </p>
        </div>
        {message && !isModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Tarjeta de Identidad */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-900 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg ring-4 ring-zinc-50">
              {getInitials()}
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{user.nombreCompleto}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium mt-2 border border-zinc-200">
              <Shield className="w-3 h-3" />
              {user.rol}
            </span>
            
            <div className="w-full mt-6 pt-6 border-t border-zinc-100 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Estado</div>
                <div className="text-green-600 font-medium text-sm flex items-center justify-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Activo
                </div>
              </div>
              <div className="text-center border-l border-zinc-100">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Miembro</div>
                <div className="text-zinc-900 font-medium text-sm mt-1">
                  {new Date(user.fechaCreacion).getFullYear()}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Seguridad Rápida */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Seguridad
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:text-zinc-900 transition-colors">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-zinc-900">Contraseña</div>
                  <div className="text-xs text-zinc-500">Actualizar clave de acceso</div>
                </div>
              </div>
              <div className="text-zinc-400 group-hover:translate-x-1 transition-transform">→</div>
            </button>
          </div>
        </div>

        {/* Columna Derecha: Detalles y Actividad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                Información Personal
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Nombre Completo</label>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-900 text-sm font-medium">
                  {user.nombreCompleto}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Correo Electrónico</label>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-900 text-sm font-medium flex items-center justify-between">
                  {user.email}
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Rol Asignado</label>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-900 text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  {user.rol}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Fecha de Registro</label>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-zinc-900 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  {new Date(user.fechaCreacion).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-500" />
                Actividad de la Cuenta
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Item 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                    <div className="w-0.5 h-full bg-zinc-100 my-1"></div>
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-zinc-900">Sesión Activa</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Actualmente conectado desde este dispositivo</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium border border-zinc-200">
                        <Globe className="w-3 h-3" /> Web
                      </span>
                      <span className="text-[10px] text-zinc-400">Hace un momento</span>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                {user.ultimoAcceso && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                      <div className="w-0.5 h-full bg-zinc-100 my-1"></div>
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-zinc-900">Último Acceso</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Inicio de sesión registrado</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(user.ultimoAcceso).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Item 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Cuenta Creada</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Registro inicial en el sistema</p>
                    <div className="mt-1 text-[10px] text-zinc-400">
                      {new Date(user.fechaCreacion).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h3 className="font-semibold text-zinc-900">Cambiar Contraseña</h3>
                <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                {message && (
                  <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-0 transition-colors text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-0 transition-colors text-sm"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Confirmar Contraseña</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-0 transition-colors text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Guardando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
