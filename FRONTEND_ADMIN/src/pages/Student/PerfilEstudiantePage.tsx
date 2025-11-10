import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { estudiantesApi } from '../../services/estudiantesApi';
import { User, Mail, Calendar, Award, TrendingUp, BookOpen, GraduationCap } from 'lucide-react';

const PerfilEstudiantePage: React.FC = () => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 bg-purple-700 rounded-full flex items-center justify-center">
            <User className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{perfil?.nombreCompleto}</h1>
            <p className="text-purple-100 text-lg">Código: {perfil?.codigo}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="px-3 py-1 bg-purple-700 rounded-full text-sm font-semibold">
                Ciclo {perfil?.cicloActual}
              </span>
              <span className="px-3 py-1 bg-purple-700 rounded-full text-sm font-semibold">
                {perfil?.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Correo Electrónico</p>
                <p className="text-base font-medium text-gray-900">{perfil?.email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <GraduationCap className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Carrera</p>
                <p className="text-base font-medium text-gray-900">{perfil?.carrera}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                <p className="text-base font-medium text-gray-900">
                  {perfil?.fechaIngreso && new Date(perfil.fechaIngreso).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Ciclo Actual</p>
                <p className="text-base font-medium text-gray-900">Ciclo {perfil?.cicloActual}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Académicas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estadísticas Académicas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Créditos Acumulados</p>
              <p className="text-3xl font-bold text-purple-600">{perfil?.creditosAcumulados}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Cursos Activos</p>
              <p className="text-3xl font-bold text-blue-600">{cursosActivos}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Cursos Aprobados</p>
              <p className="text-3xl font-bold text-green-600">{cursosAprobados}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Cursos</p>
              <p className="text-3xl font-bold text-orange-600">{misCursos?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Estudiante */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estado Académico</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Estado del Estudiante</p>
                <p className="text-sm text-gray-600">Tu estado académico actual</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
              {perfil?.estado}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilEstudiantePage;
