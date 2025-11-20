import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { User, Mail, Calendar, Award, TrendingUp, BookOpen, GraduationCap, Lock, Eye, EyeOff, X, KeyRound, Edit2, Save, Phone, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const PerfilEstudiantePage: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
            <div className="h-24 w-24 sm:h-28 sm:w-28 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <User className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{perfil?.nombreCompleto}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">Código:</span>
                  <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs sm:text-sm font-semibold font-mono">
                    {perfil?.codigo}
                  </span>
                </div>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">Ciclo:</span>
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-semibold">
                    {perfil?.cicloActual}
                  </span>
                </div>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold">
                  {perfil?.estado}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <p className="text-sm sm:text-base text-gray-600">{perfil?.carrera}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm w-full lg:w-auto"
          >
            <KeyRound className="h-5 w-5" />
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Información de Contacto Editable */}
      <InformacionContacto perfil={perfil} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['estudiante-perfil'] })} />

      {/* Estadísticas Académicas */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Estadísticas Académicas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Créditos Acumulados</p>
              <p className="text-3xl font-bold text-emerald-600">{perfil?.creditosAcumulados}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cursos Activos</p>
              <p className="text-3xl font-bold text-blue-600">{cursosActivos}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cursos Aprobados</p>
              <p className="text-3xl font-bold text-indigo-600">{cursosAprobados}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Cursos</p>
              <p className="text-3xl font-bold text-amber-600">{misCursos?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Estudiante */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Estado Académico</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Estado del Estudiante</p>
                <p className="text-sm text-gray-600">Tu estado académico actual en el sistema</p>
              </div>
            </div>
            <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-lg shadow-sm">
              {perfil?.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {modalAbierto && (
        <ModalCambiarContrasena onClose={() => setModalAbierto(false)} />
      )}
    </div>
  );
};

// Componente para información de contacto editable
interface InformacionContactoProps {
  perfil: any;
  onUpdate: () => void;
}

const InformacionContacto: React.FC<InformacionContactoProps> = ({ perfil, onUpdate }) => {
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
      toast.success('Información actualizada exitosamente');
      setModoEdicion(false);
      onUpdate();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar información');
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    actualizarMutation.mutate(formData);
  };

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

  const renderField = (icon: React.ReactNode, label: string, value: string, field: string, type: string = 'text', placeholder: string = '') => {
    const isEmpty = !value || value === '';
    
    return (
      <div className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-all">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          {modoEdicion ? (
            <input
              type={type}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full text-sm font-medium text-gray-900 border-b border-gray-300 focus:border-indigo-500 focus:outline-none py-1"
              placeholder={placeholder || `Ingresa tu ${label.toLowerCase()}`}
            />
          ) : (
            <p className={`text-sm font-medium ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
              {isEmpty ? `No registrado` : value}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Correo Institucional</h2>
        {!modoEdicion ? (
          <button
            onClick={() => setModoEdicion(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={actualizarMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {actualizarMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 mb-4">
          {renderField(<Mail className="h-5 w-5 text-indigo-600" />, 'Correo Institucional', perfil?.email, 'email', 'email')}
        </div>
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 -mx-6 mb-4">
          <h3 className="text-base font-semibold text-gray-900">Información de Contacto</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(<User className="h-5 w-5 text-indigo-600" />, 'Apellidos', formData.apellidos, 'apellidos', 'text', 'Ej: García López')}
          {renderField(<User className="h-5 w-5 text-indigo-600" />, 'Nombres', formData.nombres, 'nombres', 'text', 'Ej: Juan Carlos')}
          {renderField(<CreditCard className="h-5 w-5 text-indigo-600" />, 'DNI', formData.dni, 'dni', 'text', 'Ej: 12345678')}
          {renderField(<Calendar className="h-5 w-5 text-indigo-600" />, 'Fecha de Nacimiento', formData.fechaNacimiento, 'fechaNacimiento', 'date')}
          {renderField(<Mail className="h-5 w-5 text-indigo-600" />, 'Correo Personal', formData.correo, 'correo', 'email', 'Ej: juan@gmail.com')}
          {renderField(<Phone className="h-5 w-5 text-indigo-600" />, 'Teléfono', formData.telefono, 'telefono', 'tel', 'Ej: 987654321')}
        </div>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {renderField(<MapPin className="h-5 w-5 text-indigo-600" />, 'Dirección', formData.direccion, 'direccion', 'text', 'Ej: Av. Principal 123, Lima')}
        </div>
      </div>
    </div>
  );
};

// Modal para cambiar contraseña
interface ModalCambiarContrasenaProps {
  onClose: () => void;
}

const ModalCambiarContrasena: React.FC<ModalCambiarContrasenaProps> = ({ onClose }) => {
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
      // Limpiar campos y cerrar modal
      setContrasenaActual('');
      setContrasenaNueva('');
      setConfirmarContrasena('');
      setTimeout(() => onClose(), 1000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al cambiar contraseña');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (contrasenaNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (contrasenaNueva !== confirmarContrasena) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    cambiarContrasenaMutation.mutate({
      contrasenaActual,
      contrasenaNueva,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña Actual */}
          <div>
            <label htmlFor="contrasenaActual" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={mostrarActual ? 'text' : 'password'}
                id="contrasenaActual"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {mostrarActual ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Contraseña Nueva */}
          <div>
            <label htmlFor="contrasenaNueva" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={mostrarNueva ? 'text' : 'password'}
                id="contrasenaNueva"
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ingresa tu nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {mostrarNueva ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                id="confirmarContrasena"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {mostrarConfirmar ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={cambiarContrasenaMutation.isPending}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cambiarContrasenaMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
            {contrasenaNueva && (
              <span className="text-xs text-gray-500">
                {contrasenaNueva.length >= 6 ? '✓' : '✗'} Mínimo 6 caracteres
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default PerfilEstudiantePage;
