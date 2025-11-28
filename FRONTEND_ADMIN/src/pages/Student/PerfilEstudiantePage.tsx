import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, Award, TrendingUp, BookOpen, GraduationCap, 
  Lock, Eye, EyeOff, X, KeyRound, Edit2, Save, Phone, MapPin, 
  CreditCard, Shield, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const PerfilEstudiantePage: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<'info' | 'contacto' | 'academico'>('info');
  const queryClient = useQueryClient();

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  const { data: misCursos } = useQuery({
    queryKey: ['mis-cursos-total'],
    queryFn: () => estudiantesApi.getMisCursos(),
  });

  const cursosAprobados = misCursos?.filter(c => c.estado === 'Aprobado').length || 0;
  const cursosActivos = misCursos?.filter(c => c.estado === 'Matriculado').length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  const getInitials = (nombre?: string) => {
    return nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ES';
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
              {getInitials(perfil?.nombreCompleto)}
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
              {perfil?.nombreCompleto}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium">
                {perfil?.codigo}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                Ciclo {perfil?.cicloActual}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                {perfil?.estado}
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
              <GraduationCap className="w-4 h-4 text-primary-700" />
              <span className="text-sm">{perfil?.carrera}</span>
            </div>
          </div>

          {/* Botón */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors shadow-sm"
          >
            <Shield className="w-4 h-4" />
            Cambiar Contraseña
          </motion.button>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Award, label: 'Créditos Acumulados', value: perfil?.creditosAcumulados || 0, color: 'emerald' },
          { icon: BookOpen, label: 'Cursos Activos', value: cursosActivos, color: 'primary' },
          { icon: Award, label: 'Cursos Aprobados', value: cursosAprobados, color: 'amber' },
          { icon: TrendingUp, label: 'Total Cursos', value: misCursos?.length || 0, color: 'indigo' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow`}
          >
            <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs de navegación */}
      <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'info', label: 'Información Personal', icon: User },
              { id: 'contacto', label: 'Contacto', icon: Mail },
              { id: 'academico', label: 'Estado Académico', icon: GraduationCap },
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
                    layoutId="activeTabIndicator"
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
              {seccionActiva === 'info' && <SeccionInformacion perfil={perfil} />}
              {seccionActiva === 'contacto' && (
                <SeccionContacto perfil={perfil} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['estudiante-perfil'] })} />
              )}
              {seccionActiva === 'academico' && <SeccionAcademico perfil={perfil} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal Cambiar Contraseña */}
      <AnimatePresence>
        {modalAbierto && <ModalCambiarContrasena onClose={() => setModalAbierto(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

// Sección Información Personal
const SeccionInformacion: React.FC<{ perfil: any }> = ({ perfil }) => {
  const campos = [
    { icon: User, label: 'Nombre Completo', value: perfil?.nombreCompleto },
    { icon: CreditCard, label: 'DNI', value: perfil?.dni },
    { icon: Calendar, label: 'Fecha de Nacimiento', value: perfil?.fechaNacimiento?.split('T')[0] },
    { icon: Mail, label: 'Correo Institucional', value: perfil?.email },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campos.map((campo, index) => (
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
            <p className="text-sm font-medium text-gray-900 truncate">{campo.value || '—'}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Sección Contacto Editable
const SeccionContacto: React.FC<{ perfil: any; onUpdate: () => void }> = ({ perfil, onUpdate }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    apellidos: perfil?.apellidos || '',
    nombres: perfil?.nombres || '',
    dni: perfil?.dni || '',
    fechaNacimiento: perfil?.fechaNacimiento?.split('T')[0] || '',
    correo: perfil?.correo || '',
    telefono: perfil?.telefono || '',
    direccion: perfil?.direccion || '',
  });

  const actualizarMutation = useMutation({
    mutationFn: estudiantesApi.actualizarPerfil,
    onSuccess: () => {
      toast.success('Información actualizada');
      setModoEdicion(false);
      onUpdate();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar');
    },
  });

  const handleSubmit = () => actualizarMutation.mutate(formData);
  const handleCancel = () => {
    setFormData({
      apellidos: perfil?.apellidos || '',
      nombres: perfil?.nombres || '',
      dni: perfil?.dni || '',
      fechaNacimiento: perfil?.fechaNacimiento?.split('T')[0] || '',
      correo: perfil?.correo || '',
      telefono: perfil?.telefono || '',
      direccion: perfil?.direccion || '',
    });
    setModoEdicion(false);
  };

  const campos = [
    { icon: User, label: 'Apellidos', field: 'apellidos', type: 'text' },
    { icon: User, label: 'Nombres', field: 'nombres', type: 'text' },
    { icon: Mail, label: 'Correo Personal', field: 'correo', type: 'email' },
    { icon: Phone, label: 'Teléfono', field: 'telefono', type: 'tel' },
    { icon: MapPin, label: 'Dirección', field: 'direccion', type: 'text', fullWidth: true },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!modoEdicion ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModoEdicion(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={actualizarMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {actualizarMutation.isPending ? 'Guardando...' : 'Guardar'}
            </motion.button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campos.map((campo, index) => (
          <motion.div
            key={campo.field}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary-200 transition-all ${campo.fullWidth ? 'md:col-span-2' : ''}`}
          >
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <campo.icon className="w-5 h-5 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{campo.label}</p>
              {modoEdicion ? (
                <input
                  type={campo.type}
                  value={formData[campo.field as keyof typeof formData]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [campo.field]: e.target.value }))}
                  className="w-full text-sm font-medium text-gray-900 border-b border-gray-300 focus:border-primary-600 focus:outline-none py-1 bg-transparent"
                  placeholder={`Ingresa tu ${campo.label.toLowerCase()}`}
                />
              ) : (
                <p className={`text-sm font-medium truncate ${formData[campo.field as keyof typeof formData] ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                  {formData[campo.field as keyof typeof formData] || 'No registrado'}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Sección Académico
const SeccionAcademico: React.FC<{ perfil: any }> = ({ perfil }) => {
  return (
    <div className="space-y-4">
      {/* Estado principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-200 rounded-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Estado del Estudiante</p>
            <p className="text-sm text-gray-600">Tu estado académico actual</p>
          </div>
        </div>
        <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-lg">
          {perfil?.estado}
        </span>
      </motion.div>

      {/* Info adicional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Ciclo Actual', value: perfil?.cicloActual, icon: Calendar, color: 'primary' },
          { label: 'Créditos Acumulados', value: perfil?.creditosAcumulados, icon: Award, color: 'amber' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200"
          >
            <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 text-${item.color}-600`} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.label}</p>
              <p className={`text-xl font-bold text-${item.color}-700`}>{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Modal Cambiar Contraseña
const ModalCambiarContrasena: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const cambiarContrasenaMutation = useMutation({
    mutationFn: estudiantesApi.cambiarContrasena,
    onSuccess: (data) => {
      toast.success(data.mensaje);
      setTimeout(() => onClose(), 1000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al cambiar contraseña');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (contrasenaNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    cambiarContrasenaMutation.mutate({ contrasenaActual, contrasenaNueva });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
              <KeyRound className="w-5 h-5 text-primary-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarActual ? 'text' : 'password'}
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Ingresa tu contraseña actual"
              />
              <button type="button" onClick={() => setMostrarActual(!mostrarActual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarActual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarNueva ? 'text' : 'password'}
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Ingresa tu nueva contraseña"
              />
              <button type="button" onClick={() => setMostrarNueva(!mostrarNueva)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarNueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
                placeholder="Confirma tu nueva contraseña"
              />
              <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarConfirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {contrasenaNueva && (
            <p className={`text-sm flex items-center gap-1 ${contrasenaNueva.length >= 6 ? 'text-emerald-600' : 'text-red-500'}`}>
              {contrasenaNueva.length >= 6 ? '✓' : '✗'} Mínimo 6 caracteres
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={cambiarContrasenaMutation.isPending}
              className="flex-1 py-2.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors"
            >
              {cambiarContrasenaMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
            </motion.button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PerfilEstudiantePage;

