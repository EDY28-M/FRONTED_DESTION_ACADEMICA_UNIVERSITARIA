import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { facultadesApi } from '../../services/facultadesApi';
import { escuelasApi } from '../../services/escuelasApi';
import {
  Mail, Calendar, Eye, EyeOff, X, Edit2, Save, Phone, MapPin, CreditCard, Fingerprint, ShieldCheck,
  Building2, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWebAuthnRegister } from '../../hooks/useWebAuthnRegister';

const PerfilEstudiantePage: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoContacto, setEditandoContacto] = useState(false);
  const queryClient = useQueryClient();
  const { register: registerPasskey, loading: isRegisterLoading } = useWebAuthnRegister();

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['estudiante-perfil'],
    queryFn: estudiantesApi.getPerfil,
  });

  // Obtener catálogos
  const { data: facultades } = useQuery({
    queryKey: ['facultades'],
    queryFn: facultadesApi.getAll,
  });

  const { data: escuelas } = useQuery({
    queryKey: ['escuelas'],
    queryFn: escuelasApi.getAll,
  });

  const facultadNombre = facultades?.find(f => f.id === perfil?.idFacultad)?.nombre || '—';
  const escuelaNombre = escuelas?.find(e => e.id === perfil?.idEscuela)?.nombre || '—';

  const handleRegisterPasskey = async () => {
    if (!perfil?.email) {
      toast.error('No se pudo obtener el correo del usuario');
      return;
    }
    const result = await registerPasskey(perfil.email);
    if (result.success) {
      toast.success('Huella registrada exitosamente');
    } else if (result.errorMessage) {
      toast.error(result.errorMessage);
    }
  };

  const { data: periodoActivo } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: estudiantesApi.getPeriodoActivo,
  });

  // Cursos del período actual
  const { data: misCursosCicloActual } = useQuery({
    queryKey: ['mis-cursos-ciclo', periodoActivo?.id],
    queryFn: () => estudiantesApi.getMisCursos(periodoActivo?.id),
    enabled: !!periodoActivo?.id,
  });

  // Calcular créditos matriculados este ciclo
  const creditosMatriculadosCiclo = misCursosCicloActual
    ?.filter(c => c.estado === 'Matriculado')
    ?.reduce((sum, c) => sum + (c.creditos || 0), 0) || 0;

  // Calcular cursos aprobados este ciclo (promedioFinal >= 11)
  const cursosAprobadosCiclo = misCursosCicloActual
    ?.filter(c => c.promedioFinal !== undefined && c.promedioFinal !== null && c.promedioFinal >= 11)
    ?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Mi Perfil</h1>
          <p className="text-zinc-500 text-sm mt-1">Información personal y académica</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Cambiar contraseña
        </button>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda - Card principal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tarjeta de identidad */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-full flex items-center justify-center text-white text-2xl font-semibold mb-4">
                {perfil?.nombreCompleto?.split(' ').slice(0, 2).map((n: string) => n[0]).join('') || 'ES'}
              </div>
              <h2 className="text-lg font-semibold text-zinc-900">{perfil?.nombreCompleto}</h2>
              <p className="text-sm text-zinc-500 mt-1">{perfil?.carrera}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Código</span>
                <span className="text-sm font-mono text-zinc-900">{perfil?.codigo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Ciclo</span>
                <span className="text-sm font-medium text-zinc-900">{perfil?.cicloActual}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Estado</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {perfil?.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Stats compactos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{perfil?.creditosAcumulados || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Créditos totales</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{creditosMatriculadosCiclo}</p>
              <p className="text-xs text-zinc-500 mt-1">Créditos este ciclo</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{cursosAprobadosCiclo}</p>
              <p className="text-xs text-zinc-500 mt-1">Aprobados este ciclo</p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{misCursosCicloActual?.filter(c => c.estado === 'Matriculado')?.length || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Cursos matriculados</p>
            </div>
          </div>
        </div>

        {/* Columna derecha - Detalles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información personal */}
          <div className="bg-white border border-zinc-200 rounded-xl">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Información Personal</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Campo icon={CreditCard} label="DNI" value={perfil?.dni} />
                <Campo icon={Calendar} label="Fecha de Nacimiento" value={perfil?.fechaNacimiento?.split('T')[0]} />
                <Campo icon={Building2} label="Facultad" value={facultadNombre} />
                <Campo icon={GraduationCap} label="Escuela Profesional" value={escuelaNombre} />
                <Campo icon={Mail} label="Correo Institucional" value={perfil?.email} className="sm:col-span-2" />
              </div>
            </div>
          </div>

          {/* Información de contacto editable */}
          <SeccionContacto
            perfil={perfil}
            editando={editandoContacto}
            setEditando={setEditandoContacto}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['estudiante-perfil'] })}
          />

          {/* Seguridad Card */}
          <div className="bg-white border border-zinc-200 rounded-xl">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Seguridad</h3>
            </div>
            <div className="p-6">
              <div className="bg-zinc-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-zinc-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900">Autenticación Biométrica</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      Vincula tu huella para iniciar sesión de forma rápida y segura.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRegisterPasskey}
                disabled={isRegisterLoading}
                className="w-full h-10 bg-white border border-zinc-300 text-zinc-700 rounded-md text-sm font-medium
                           hover:bg-zinc-50 hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
              >
                {isRegisterLoading ? (
                  'Registrando...'
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4" />
                    Registrar Huella
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalAbierto && <ModalCambiarContrasena onClose={() => setModalAbierto(false)} />}
    </div>
  );
};

// Campo de solo lectura
const Campo: React.FC<{ icon: any; label: string; value?: string; className?: string }> = ({ icon: Icon, label, value, className }) => (
  <div className={className}>
    <label className="text-xs text-zinc-400 uppercase tracking-wide block mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-zinc-400" />
      <span className="text-sm text-zinc-900">{value || '—'}</span>
    </div>
  </div>
);

// Sección Contacto Editable
const SeccionContacto: React.FC<{ perfil: any; editando: boolean; setEditando: (v: boolean) => void; onUpdate: () => void }> = ({ perfil, editando, setEditando, onUpdate }) => {
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
      setEditando(false);
      onUpdate();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar');
    },
  });

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
    setEditando(false);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Información de Contacto</h3>
        {!editando ? (
          <button onClick={() => setEditando(true)} className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => actualizarMutation.mutate(formData)} disabled={actualizarMutation.isPending} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {actualizarMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={handleCancel} className="text-sm text-zinc-500 hover:text-zinc-700">Cancelar</button>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <CampoEditable icon={Mail} label="Correo Personal" field="correo" type="email" formData={formData} setFormData={setFormData} editando={editando} />
          <CampoEditable icon={Phone} label="Teléfono" field="telefono" type="tel" formData={formData} setFormData={setFormData} editando={editando} />
          <CampoEditable icon={MapPin} label="Dirección" field="direccion" type="text" formData={formData} setFormData={setFormData} editando={editando} className="sm:col-span-2" />
        </div>
      </div>
    </div>
  );
};

// Campo editable
const CampoEditable: React.FC<{
  icon: any;
  label: string;
  field: string;
  type: string;
  formData: any;
  setFormData: (v: any) => void;
  editando: boolean;
  className?: string;
}> = ({ icon: Icon, label, field, type, formData, setFormData, editando, className }) => (
  <div className={className}>
    <label className="text-xs text-zinc-400 uppercase tracking-wide block mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
      {editando ? (
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, [field]: e.target.value }))}
          className="flex-1 text-sm text-zinc-900 border-b border-zinc-300 focus:border-zinc-900 outline-none py-1 bg-transparent"
          placeholder={`Ingresa tu ${label.toLowerCase()}`}
        />
      ) : (
        <span className={`text-sm ${formData[field] ? 'text-zinc-900' : 'text-zinc-400'}`}>
          {formData[field] || 'No registrado'}
        </span>
      )}
    </div>
  </div>
);

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
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    cambiarContrasenaMutation.mutate({ contrasenaActual, contrasenaNueva });
  };

  const validaciones = [
    { ok: contrasenaNueva.length >= 6, texto: 'Mínimo 6 caracteres' },
    { ok: contrasenaNueva === confirmarContrasena && confirmarContrasena.length > 0, texto: 'Las contraseñas coinciden' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header con gradiente sutil */}
        <div className="px-6 py-5 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Cambiar contraseña</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Actualiza tu contraseña de acceso</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contraseña actual */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">Contraseña actual</label>
            <div className="relative">
              <input
                type={mostrarActual ? 'text' : 'password'}
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all"
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                {mostrarActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-zinc-400">Nueva contraseña</span>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">Nueva contraseña</label>
            <div className="relative">
              <input
                type={mostrarNueva ? 'text' : 'password'}
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                {mostrarNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all"
                placeholder="Repite la nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validaciones visuales */}
          {(contrasenaNueva || confirmarContrasena) && (
            <div className="flex flex-wrap gap-2">
              {validaciones.map((v, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${v.ok
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${v.ok ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                  {v.texto}
                </span>
              ))}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cambiarContrasenaMutation.isPending || !contrasenaActual || contrasenaNueva.length < 6 || contrasenaNueva !== confirmarContrasena}
              className="flex-1 h-11 text-sm font-medium text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {cambiarContrasenaMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cambiando...
                </span>
              ) : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilEstudiantePage;
