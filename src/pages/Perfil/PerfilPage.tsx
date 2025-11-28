import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { User, Lock, Mail, Calendar, Shield, CheckCircle, AlertCircle, Eye, EyeOff, X, Clock, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerfilPage() {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<'personal' | 'actividad'>('personal');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

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
      setMessage({ type: 'success', text: 'Contraseña actualizada' });
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

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  const getInitials = () => {
    return `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Mensaje flotante de éxito */}
      {message && !isModalOpen && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Header del perfil */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #003366 0%, #004d99 100%)',
                border: '3px solid #C7A740'
              }}
            >
              {getInitials()}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md border-2 border-white"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {user.nombreCompleto}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {user.rol}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                Activo
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-primary-700" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>

          {/* Botón */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Cambiar Contraseña
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs de navegación */}
      <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'personal', label: 'Información Personal', icon: User },
              { id: 'actividad', label: 'Actividad', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium transition-colors ${
                  seccionActiva === tab.id 
                    ? 'text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {seccionActiva === tab.id && (
                  <motion.div
                    layoutId="activeTabAdmin"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de tabs */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={seccionActiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {seccionActiva === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: 'Nombres', value: user.nombres },
                    { icon: User, label: 'Apellidos', value: user.apellidos },
                    { icon: Mail, label: 'Correo Electrónico', value: user.email },
                    { icon: Shield, label: 'Rol en el Sistema', value: user.rol },
                  ].map((campo, index) => (
                    <motion.div
                      key={campo.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <campo.icon className="w-5 h-5 text-primary-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{campo.label}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{campo.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {seccionActiva === 'actividad' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      icon: Calendar, 
                      label: 'Cuenta Creada', 
                      value: new Date(user.fechaCreacion).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })
                    },
                    { 
                      icon: Clock, 
                      label: 'Último Acceso', 
                      value: user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'N/A'
                    },
                  ].map((campo, index) => (
                    <motion.div
                      key={campo.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <campo.icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{campo.label}</p>
                        <p className="text-sm font-medium text-gray-900">{campo.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal Cambiar Contraseña */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                {message && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                    message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Contraseña Actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                      placeholder="Ingresa tu contraseña actual"
                      required
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                      placeholder="Confirma tu nueva contraseña"
                      required
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordData.newPassword && (
                  <p className={`text-sm flex items-center gap-1 ${passwordData.newPassword.length >= 6 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {passwordData.newPassword.length >= 6 ? '✓' : '✗'} Mínimo 6 caracteres
                  </p>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Guardando...
                      </>
                    ) : 'Cambiar Contraseña'}
                  </motion.button>
                  <button type="button" onClick={closeModal} disabled={loading} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
