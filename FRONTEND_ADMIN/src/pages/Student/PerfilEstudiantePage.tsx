import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { 
  User, Mail, Calendar, Award, TrendingUp, BookOpen, GraduationCap, 
  Lock, Eye, EyeOff, X, KeyRound, Edit2, Save, Phone, MapPin, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = 'zinc' }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  color?: string;
}) => (
  <div className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors">
    <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}>
      <Icon className={`w-4 h-4 text-${color}-600`} />
    </div>
    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className={`text-2xl font-bold tabular-nums text-${color}-700`}>{value}</p>
  </div>
);

// Info Field Component
const InfoField = ({ icon: Icon, label, value }: { 
  icon: React.ElementType; 
  label: string; 
  value?: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50/50 transition-colors">
    <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-zinc-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-[13px] font-medium text-zinc-900 truncate">{value || '—'}</p>
    </div>
  </div>
);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    );
  }

  const getInitials = (nombre?: string) => {
    return nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ES';
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="h-14 px-6 max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-zinc-900">Mi Perfil</h1>
              <p className="text-[11px] text-zinc-500">{perfil?.carrera}</p>
            </div>
          </div>

          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Cambiar Contraseña
          </button>
        </div>
      </header>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-zinc-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xl font-bold">
              {getInitials(perfil?.nombreCompleto)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium">{perfil?.nombreCompleto}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="px-2 py-0.5 bg-white/10 rounded text-[11px] font-medium">{perfil?.codigo}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[11px] font-medium">Ciclo {perfil?.cicloActual}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[11px] font-medium">{perfil?.estado}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Award} label="Créditos Acumulados" value={perfil?.creditosAcumulados || 0} color="emerald" />
          <StatCard icon={BookOpen} label="Cursos Activos" value={cursosActivos} color="blue" />
          <StatCard icon={Award} label="Cursos Aprobados" value={cursosAprobados} color="amber" />
          <StatCard icon={TrendingUp} label="Total Cursos" value={misCursos?.length || 0} color="violet" />
        </div>

        {/* Tabs Content */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-100">
            {[
              { id: 'info', label: 'Información Personal', icon: User },
              { id: 'contacto', label: 'Contacto', icon: Mail },
              { id: 'academico', label: 'Estado Académico', icon: GraduationCap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id as any)}
                className={`relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-colors ${
                  seccionActiva === tab.id 
                    ? 'text-zinc-900' 
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {seccionActiva === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {seccionActiva === 'info' && (
              <div className="grid grid-cols-2 gap-3">
                <InfoField icon={User} label="Nombre Completo" value={perfil?.nombreCompleto} />
                <InfoField icon={User} label="DNI" value={perfil?.dni} />
                <InfoField icon={Calendar} label="Fecha de Nacimiento" value={perfil?.fechaNacimiento?.split('T')[0]} />
                <InfoField icon={Mail} label="Correo Institucional" value={perfil?.email} />
              </div>
            )}

            {seccionActiva === 'contacto' && (
              <SeccionContacto perfil={perfil} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['estudiante-perfil'] })} />
            )}

            {seccionActiva === 'academico' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-zinc-900">Estado del Estudiante</p>
                      <p className="text-[11px] text-zinc-500">Tu estado académico actual</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-bold">
                    {perfil?.estado}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Ciclo Actual</p>
                      <p className="text-xl font-bold text-blue-700">{perfil?.cicloActual}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Créditos Acumulados</p>
                      <p className="text-xl font-bold text-amber-700">{perfil?.creditosAcumulados}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {modalAbierto && <ModalCambiarContrasena onClose={() => setModalAbierto(false)} />}
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
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!modoEdicion ? (
          <button
            onClick={() => setModoEdicion(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={actualizarMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-[13px] font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {actualizarMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {campos.map((campo) => (
          <div key={campo.field} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50/50 transition-colors">
            <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <campo.icon className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{campo.label}</p>
              {modoEdicion ? (
                <input
                  type={campo.type}
                  value={formData[campo.field as keyof typeof formData]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [campo.field]: e.target.value }))}
                  className="w-full text-[13px] font-medium text-zinc-900 border-b border-zinc-300 focus:border-zinc-900 focus:outline-none py-0.5 bg-transparent"
                  placeholder={`Ingresa tu ${campo.label.toLowerCase()}`}
                />
              ) : (
                <p className={`text-[13px] font-medium truncate ${formData[campo.field as keyof typeof formData] ? 'text-zinc-900' : 'text-zinc-400 italic'}`}>
                  {formData[campo.field as keyof typeof formData] || 'No registrado'}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* Dirección - Full width */}
        <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50/50 transition-colors">
          <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Dirección</p>
            {modoEdicion ? (
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                className="w-full text-[13px] font-medium text-zinc-900 border-b border-zinc-300 focus:border-zinc-900 focus:outline-none py-0.5 bg-transparent"
                placeholder="Ingresa tu dirección"
              />
            ) : (
              <p className={`text-[13px] font-medium truncate ${formData.direccion ? 'text-zinc-900' : 'text-zinc-400 italic'}`}>
                {formData.direccion || 'No registrado'}
              </p>
            )}
          </div>
        </div>
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

  const InputField = ({ 
    label, value, onChange, show, onToggle 
  }: { 
    label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
  }) => (
    <div>
      <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 text-[13px] rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
          placeholder={`Ingresa ${label.toLowerCase()}`}
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-zinc-600" />
            </div>
            <h2 className="text-sm font-medium text-zinc-900">Cambiar Contraseña</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <InputField 
            label="Contraseña Actual" 
            value={contrasenaActual} 
            onChange={setContrasenaActual}
            show={mostrarActual}
            onToggle={() => setMostrarActual(!mostrarActual)}
          />
          <InputField 
            label="Nueva Contraseña" 
            value={contrasenaNueva} 
            onChange={setContrasenaNueva}
            show={mostrarNueva}
            onToggle={() => setMostrarNueva(!mostrarNueva)}
          />
          <InputField 
            label="Confirmar Contraseña" 
            value={confirmarContrasena} 
            onChange={setConfirmarContrasena}
            show={mostrarConfirmar}
            onToggle={() => setMostrarConfirmar(!mostrarConfirmar)}
          />

          {contrasenaNueva && (
            <p className={`text-[11px] flex items-center gap-1 ${contrasenaNueva.length >= 6 ? 'text-emerald-600' : 'text-red-500'}`}>
              {contrasenaNueva.length >= 6 ? '✓' : '✗'} Mínimo 6 caracteres
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={cambiarContrasenaMutation.isPending}
              className="flex-1 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {cambiarContrasenaMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 bg-zinc-100 text-zinc-700 text-[13px] font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilEstudiantePage;

