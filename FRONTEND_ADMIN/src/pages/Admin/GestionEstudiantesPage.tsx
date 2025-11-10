import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import toast from 'react-hot-toast';
import { UserPlus, Users, Mail, Lock, Hash, GraduationCap, CreditCard } from 'lucide-react';

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
      toast.success('✅ Estudiante creado exitosamente');
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
      toast.success(
        `Credenciales:\nEmail: ${data.estudiante.email}\nCódigo: ${data.estudiante.codigo}`,
        { duration: 8000 }
      );
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Estudiantes</h1>
        </div>
        <p className="text-gray-600">Crea nuevos estudiantes y genera sus credenciales de acceso</p>
      </div>

      {/* Formulario de Creación */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Crear Nuevo Estudiante</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Nombres *
                </span>
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Carlos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Apellidos *
                </span>
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Pérez García"
              />
            </div>
          </div>

          {/* Documento y Ciclo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Número de Documento (DNI) *
                </span>
              </label>
              <input
                type="text"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                required
                maxLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Ciclo Académico *
                </span>
              </label>
              <select
                name="ciclo"
                value={formData.ciclo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ciclo => (
                  <option key={ciclo} value={ciclo}>
                    Ciclo {ciclo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Credenciales de Acceso */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Credenciales de Acceso
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email (Usuario) *
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="estudiante@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este email será usado para iniciar sesión
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña *
                  </span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Botón Crear */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={crearEstudianteMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              {crearEstudianteMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Crear Estudiante
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Información Adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Información Importante
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-6">
          <li className="list-disc">El código de estudiante se generará automáticamente</li>
          <li className="list-disc">Las credenciales serán mostradas después de la creación</li>
          <li className="list-disc">El estudiante podrá iniciar sesión inmediatamente</li>
          <li className="list-disc">Recomendación: Usa contraseñas seguras</li>
        </ul>
      </div>
    </div>
  );
}
