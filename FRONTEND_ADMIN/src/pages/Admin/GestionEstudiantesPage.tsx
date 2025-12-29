import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CrearEstudianteForm {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  ciclo: number;
}

export default function GestionEstudiantesPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CrearEstudianteForm>({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    numeroDocumento: '',
    ciclo: 1
  });

  const crearEstudianteMutation = useMutation({
    mutationFn: (datos: CrearEstudianteForm) => estudiantesApi.crearEstudiante(datos),
    onSuccess: (data: any) => {
      toast.success('Estudiante creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        nombres: '',
        apellidos: '',
        numeroDocumento: '',
        ciclo: 1
      });

      // Mostrar credenciales
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  Estudiante Creado
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Credenciales generadas:
                </p>
                <div className="mt-2 bg-zinc-50 p-2 rounded border border-zinc-100 text-xs font-mono text-zinc-600">
                  <p>Email: {data.estudiante.email}</p>
                  <p>Código: {data.estudiante.codigo}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-zinc-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-zinc-600 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.mensaje || 'Error al crear estudiante';
      toast.error(mensaje);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.email.includes('@')) {
      toast.error('Email inválido');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    crearEstudianteMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ciclo' ? parseInt(value) : value
    }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-zinc-900">Gestión de Estudiantes</h1>
          </div>
          <p className="text-zinc-500">
            Crea nuevos estudiantes y genera sus credenciales de acceso al sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Creación */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="font-semibold text-zinc-900">Crear Nuevo Estudiante</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Ej: Juan Carlos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Ej: Pérez García"
                  />
                </div>
              </div>
            </div>

            {/* Documento y Ciclo */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Información Académica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Número de Documento (DNI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    required
                    maxLength={8}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Ciclo Académico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="ciclo"
                      value={formData.ciclo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ciclo => (
                        <option key={ciclo} value={ciclo}>
                          Ciclo {ciclo}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credenciales de Acceso */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Credenciales de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Email (Usuario) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="estudiante@email.com"
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Este email será usado para iniciar sesión
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Mínimo 6 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Botón Crear */}
            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={crearEstudianteMutation.isPending}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                {crearEstudianteMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Estudiante'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Información Adicional */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
            <h4 className="font-semibold text-zinc-900 mb-4">
              # Información Importante
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                El código de estudiante se generará automáticamente por el sistema.
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                Las credenciales completas serán mostradas en una notificación después de la creación.
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                El estudiante podrá iniciar sesión inmediatamente con su correo y contraseña.
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                Se recomienda usar contraseñas seguras que incluyan números y letras.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Nota de Seguridad
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Asegúrate de verificar la identidad del estudiante antes de crear su cuenta. 
              Las credenciales son personales e intransferibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

