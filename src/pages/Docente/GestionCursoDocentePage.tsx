import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { docenteCursosApi, docenteAsistenciaApi, docenteTiposEvaluacionApi, EstudianteCurso, EstudiantesResponse } from '../../services/docenteApi';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UsersIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

type TabType = 'estudiantes' | 'notas' | 'asistencia';

interface AsistenciaItem {
  idEstudiante: number;
  nombreCompleto: string;
  presente: boolean | null; // null = sin marcar, true = presente, false = ausente
  observaciones: string;
}

export const GestionCursoDocentePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cursoId = parseInt(id || '0');

  const [activeTab, setActiveTab] = useState<TabType>('estudiantes');
  const [estudiantes, setEstudiantes] = useState<EstudianteCurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para registro de notas (simplificado - edición en tabla)
  const [notasEditadas, setNotasEditadas] = useState<Map<number, any>>(new Map());
  const [isSubmittingNotas, setIsSubmittingNotas] = useState(false);

  // Estado para configuración de tipos de evaluación
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false);
  const [tiposEvaluacion, setTiposEvaluacion] = useState<any[]>([]);
  const [isLoadingTipos, setIsLoadingTipos] = useState(false);

  // Estado para asistencia
  const [fechaAsistencia, setFechaAsistencia] = useState(new Date().toISOString().split('T')[0]);
  const [tipoClaseAsistencia, setTipoClaseAsistencia] = useState<string>('Teoría'); // Nuevo: Tipo de clase
  const [asistencias, setAsistencias] = useState<AsistenciaItem[]>([]);
  const [isSubmittingAsistencia, setIsSubmittingAsistencia] = useState(false);
  const [asistenciasMarcadas, setAsistenciasMarcadas] = useState<Map<string, AsistenciaItem[]>>(new Map());
  const [asistenciasRegistradas, setAsistenciasRegistradas] = useState<any[]>([]);
  const [isLoadingAsistenciasRegistradas, setIsLoadingAsistenciasRegistradas] = useState(false);
  
  // Estado para editar asistencia
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [asistenciaEditando, setAsistenciaEditando] = useState<any>(null);
  const [fechaEditar, setFechaEditar] = useState('');
  const [tipoClaseEditar, setTipoClaseEditar] = useState('');
  const [estadoEditar, setEstadoEditar] = useState(true);
  const [observacionesEditar, setObservacionesEditar] = useState('');
  const [isSubmittingEdicion, setIsSubmittingEdicion] = useState(false);

  useEffect(() => {
    cargarEstudiantes();
    cargarTiposEvaluacion();
  }, [cursoId]);

  useEffect(() => {
    if (activeTab === 'asistencia' && estudiantes.length > 0) {
      cargarAsistenciaDelDia(fechaAsistencia);
      cargarAsistenciasRegistradas();
    }
  }, [activeTab, estudiantes, fechaAsistencia, tipoClaseAsistencia]);

  useEffect(() => {
    if (activeTab === 'notas') {
      cargarTiposEvaluacion();
    }
  }, [activeTab]);

  const cargarEstudiantes = async () => {
    try {
      setIsLoading(true);
      const response = await docenteCursosApi.getEstudiantesCurso(cursoId);
      
      // Verificar si la respuesta tiene el formato con mensaje informativo
      if (response && typeof response === 'object' && 'estudiantes' in response) {
        const respuestaConMensaje = response as EstudiantesResponse;
        setEstudiantes(respuestaConMensaje.estudiantes || []);
        if (respuestaConMensaje.mensaje) {
          toast.error(respuestaConMensaje.mensaje, { duration: 5000 });
        }
      } else if (Array.isArray(response)) {
        setEstudiantes(response);
      } else {
        setEstudiantes([]);
      }
    } catch (error: any) {
      console.error('Error al cargar estudiantes:', error);
      toast.error(error.response?.data?.mensaje || 'Error al cargar los estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarAsistenciasRegistradas = async () => {
    try {
      setIsLoadingAsistenciasRegistradas(true);
      const response = await docenteAsistenciaApi.getAsistenciasCurso(cursoId);
      setAsistenciasRegistradas(response);
    } catch (error: any) {
      console.error('Error al cargar asistencias registradas:', error);
    } finally {
      setIsLoadingAsistenciasRegistradas(false);
    }
  };

  const cargarAsistenciaDelDia = (fecha: string) => {
    // Verificar si ya hay asistencia marcada para este día
    const clave = `${cursoId}-${fecha}`;
    const asistenciaGuardada = asistenciasMarcadas.get(clave);

    if (asistenciaGuardada) {
      // Cargar asistencia previamente marcada
      setAsistencias(asistenciaGuardada);
    } else {
      // Crear nueva asistencia sin marcar (null por defecto)
      const items: AsistenciaItem[] = estudiantes.map(est => ({
        idEstudiante: est.idEstudiante,
        nombreCompleto: est.nombreCompleto,
        presente: null, // Sin marcar por defecto
        observaciones: '',
      }));
      setAsistencias(items);
    }
  };

  const handleCambiarFecha = (nuevaFecha: string) => {
    // Guardar asistencias actuales antes de cambiar
    const claveActual = `${cursoId}-${fechaAsistencia}`;
    setAsistenciasMarcadas(prev => {
      const newMap = new Map(prev);
      newMap.set(claveActual, [...asistencias]);
      return newMap;
    });

    // Cambiar a nueva fecha
    setFechaAsistencia(nuevaFecha);
  };

  // Handler para cambiar nota inline en la tabla
  const handleNotaChange = (idMatricula: number, campo: string, valor: string) => {
    // Validar que sea número entre 0 y 20
    if (valor !== '' && (!/^\d*\.?\d*$/.test(valor) || parseFloat(valor) > 20)) {
      return;
    }

    setNotasEditadas(prev => {
      const nuevas = new Map(prev);
      const notasEstudiante = nuevas.get(idMatricula) || {};
      nuevas.set(idMatricula, {
        ...notasEstudiante,
        [campo]: valor
      });
      return nuevas;
    });
  };

  // Guardar notas de un estudiante individual
  const handleGuardarNotasEstudiante = async (estudiante: EstudianteCurso) => {
    const notasEditadasEstudiante = notasEditadas.get(estudiante.idMatricula);
    
    // Si no hay cambios pendientes, usar las notas existentes
    const notasActuales = notasEditadasEstudiante || {};

    try {
      setIsSubmittingNotas(true);

      // Construir el request dinámicamente basado en los tipos de evaluación
      const request: any = {
        idMatricula: estudiante.idMatricula,
      };

      // Agregar cada tipo de evaluación al request usando el nombre EXACTO de la configuración
      tiposEvaluacion
        .filter(tipo => tipo.activo)
        .forEach(tipo => {
          // Usar el nombre real del tipo de evaluación como clave
          const nombreTipo = tipo.nombre;
          const campoNotaMapeado = mapearNombreACampo(tipo.nombre);
          
          const valorEditado = notasActuales[campoNotaMapeado];
          // Buscar el valor existente usando el nombre EXACTO (como viene del backend)
          const valorExistente = (estudiante.notas as any)?.[nombreTipo];
          
          // Usar valor editado si existe, sino usar el existente
          if (valorEditado !== undefined && valorEditado !== '') {
            request[nombreTipo] = parseFloat(valorEditado);
          } else if (valorExistente !== undefined) {
            request[nombreTipo] = valorExistente;
          }
        });

      await docenteCursosApi.registrarNotas(cursoId, request);
      toast.success(`Notas de ${estudiante.nombreCompleto} guardadas`);

      // Recargar estudiantes para reflejar las notas guardadas
      await cargarEstudiantes();

      // NO limpiar las ediciones - mantener los valores en los inputs
    } catch (error: any) {
      console.error('Error al guardar notas:', error);
      toast.error(error.response?.data?.message || 'Error al guardar notas');
    } finally {
      setIsSubmittingNotas(false);
    }
  };

  // Guardar todas las notas modificadas
  const handleGuardarTodasLasNotas = async () => {
    if (notasEditadas.size === 0) {
      toast.error('No hay cambios para guardar');
      return;
    }

    try {
      setIsSubmittingNotas(true);
      let exitosos = 0;
      let errores = 0;

      for (const [idMatricula, notasEditadasEstudiante] of notasEditadas.entries()) {
        const estudiante = estudiantes.find(e => e.idMatricula === idMatricula);
        if (!estudiante) continue;

        try {
          // Construir el request dinámicamente basado en los tipos de evaluación
          const request: any = {
            idMatricula,
          };

          // Agregar cada tipo de evaluación al request usando el nombre EXACTO
          tiposEvaluacion
            .filter(tipo => tipo.activo)
            .forEach(tipo => {
              const nombreTipo = tipo.nombre; // Nombre exacto de la base de datos
              const campoNotaMapeado = mapearNombreACampo(tipo.nombre); // Para buscar en notasEditadas
              
              const valorEditado = notasEditadasEstudiante[campoNotaMapeado];
              // Buscar el valor existente usando el nombre EXACTO (como viene del backend)
              const valorExistente = (estudiante.notas as any)?.[nombreTipo];
              
              // Usar valor editado si existe, sino usar el existente
              if (valorEditado !== undefined && valorEditado !== '') {
                request[nombreTipo] = parseFloat(valorEditado);
              } else if (valorExistente !== undefined) {
                request[nombreTipo] = valorExistente;
              }
            });

          await docenteCursosApi.registrarNotas(cursoId, request);
          exitosos++;
        } catch (error) {
          errores++;
          console.error(`Error al guardar notas de matrícula ${idMatricula}:`, error);
        }
      }

      if (exitosos > 0) {
        toast.success(`${exitosos} estudiante(s) guardado(s) exitosamente`);
      }
      if (errores > 0) {
        toast.error(`${errores} estudiante(s) con error`);
      }

      // Recargar estudiantes para reflejar los cambios
      await cargarEstudiantes();

      // NO limpiar las ediciones - mantener los valores en los inputs
    } catch (error: any) {
      console.error('Error al guardar todas las notas:', error);
      toast.error('Error al guardar las notas');
    } finally {
      setIsSubmittingNotas(false);
    }
  };

  // Cargar tipos de evaluación configurados
  const cargarTiposEvaluacion = async () => {
    try {
      setIsLoadingTipos(true);
      const tipos = await docenteCursosApi.getTiposEvaluacion(cursoId);
      setTiposEvaluacion(tipos);
    } catch (error) {
      console.error('Error al cargar tipos de evaluación:', error);
      toast.error('Error al cargar configuración de evaluaciones');
    } finally {
      setIsLoadingTipos(false);
    }
  };

  // Guardar configuración de tipos de evaluación
  const handleGuardarConfiguracion = async () => {
    try {
      // Validar que los pesos sumen 100
      const pesoTotal = tiposEvaluacion
        .filter(t => t.activo)
        .reduce((sum, t) => sum + parseFloat(t.peso.toString()), 0);
      
      if (Math.abs(pesoTotal - 100) > 0.01) {
        toast.error(`Los pesos deben sumar 100%. Suma actual: ${pesoTotal}%`);
        return;
      }

      setIsSubmittingNotas(true);
      await docenteTiposEvaluacionApi.configurarTiposEvaluacion(cursoId, {
        tiposEvaluacion: tiposEvaluacion.map((t, index) => ({
          id: t.id,
          nombre: t.nombre,
          peso: parseFloat(t.peso.toString()),
          orden: index + 1,
          activo: t.activo
        }))
      });

      toast.success('Configuración guardada correctamente');
      setMostrarModalConfig(false);
      
      // Recargar tipos de evaluación para actualizar el estado local con los nombres nuevos
      await cargarTiposEvaluacion();
      
      // Recargar estudiantes para actualizar las notas
      await cargarEstudiantes();
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setIsSubmittingNotas(false);
    }
  };

  // Agregar nuevo tipo de evaluación
  const handleAgregarTipo = () => {
    setTiposEvaluacion([
      ...tiposEvaluacion,
      {
        id: 0,
        nombre: '',
        peso: 0,
        orden: tiposEvaluacion.length + 1,
        activo: true
      }
    ]);
  };

  // Eliminar tipo de evaluación
  const handleEliminarTipo = (index: number) => {
    setTiposEvaluacion(tiposEvaluacion.filter((_, i) => i !== index));
  };

  // Actualizar tipo de evaluación
  const handleActualizarTipo = (index: number, campo: string, valor: any) => {
    setTiposEvaluacion(
      tiposEvaluacion.map((t, i) => 
        i === index ? { ...t, [campo]: valor } : t
      )
    );
  };

  // Mapear nombre de tipo de evaluación a propiedad del objeto notas
  const mapearNombreACampo = (nombreTipo: string): string => {
    const nombreLower = nombreTipo.toLowerCase().trim();
    
    // Mapeo de nombres comunes a campos del backend
    const mapeos: { [key: string]: string } = {
      'parcial 1': 'parcial1',
      'parcial 2': 'parcial2',
      'parcial1': 'parcial1',
      'parcial2': 'parcial2',
      'prácticas': 'practicas',
      'practicas': 'practicas',
      'practica': 'practicas',
      'medio curso': 'medioCurso',
      'mediocurso': 'medioCurso',
      'examen final': 'examenFinal',
      'examenfinal': 'examenFinal',
      'final': 'examenFinal',
      'actitud': 'actitud',
      'trabajos': 'trabajos',
      'trabajo': 'trabajos',
      'trabajo encargado': 'trabajoEncargado',
      'trabajoencargado': 'trabajoEncargado'
    };

    // Buscar coincidencia exacta
    if (mapeos[nombreLower]) {
      return mapeos[nombreLower];
    }

    // Si no hay coincidencia, generar un campo camelCase del nombre
    return nombreTipo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // CamelCase
      .replace(/\s/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
  };

  const handleToggleAsistencia = (idEstudiante: number) => {
    setAsistencias(prev =>
      prev.map(a => {
        if (a.idEstudiante === idEstudiante) {
          // Ciclo: null → true → false → null
          let nuevoEstado: boolean | null;
          if (a.presente === null) {
            nuevoEstado = true; // Sin marcar → Presente
          } else if (a.presente === true) {
            nuevoEstado = false; // Presente → Ausente
          } else {
            nuevoEstado = null; // Ausente → Sin marcar
          }
          return { ...a, presente: nuevoEstado };
        }
        return a;
      })
    );
  };

  const handleObservacionChange = (idEstudiante: number, observaciones: string) => {
    setAsistencias(prev =>
      prev.map(a =>
        a.idEstudiante === idEstudiante ? { ...a, observaciones } : a
      )
    );
  };

  const handleMarcarTodosPresentes = () => {
    setAsistencias(prev => prev.map(a => ({ ...a, presente: true })));
  };

  const handleMarcarTodosAusentes = () => {
    setAsistencias(prev => prev.map(a => ({ ...a, presente: false })));
  };

  const handleSubmitAsistencia = async () => {
    try {
      // Verificar que al menos un estudiante tenga asistencia marcada
      const asistenciasMarcadasValidas = asistencias.filter(a => a.presente !== null);
      
      if (asistenciasMarcadasValidas.length === 0) {
        toast.error('Debe marcar al menos un estudiante como presente o ausente');
        return;
      }

      setIsSubmittingAsistencia(true);

      const request = {
        idCurso: cursoId,
        fecha: fechaAsistencia,
        tipoClase: tipoClaseAsistencia, // Agregar tipo de clase
        asistencias: asistenciasMarcadasValidas.map(a => ({
          idEstudiante: a.idEstudiante,
          presente: a.presente as boolean, // Ya filtramos los null
          observaciones: a.observaciones || undefined,
        })),
      };

      await docenteAsistenciaApi.registrarAsistencias(request);
      toast.success(`Asistencia registrada para ${asistenciasMarcadasValidas.length} estudiante(s)`);

      // Guardar en el mapa de asistencias marcadas
      const clave = `${cursoId}-${fechaAsistencia}`;
      setAsistenciasMarcadas(prev => {
        const newMap = new Map(prev);
        newMap.set(clave, [...asistencias]);
        return newMap;
      });

      // Recargar asistencias registradas y estudiantes
      await cargarAsistenciasRegistradas();
      await cargarEstudiantes();
    } catch (error: any) {
      console.error('Error al registrar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al registrar asistencia');
    } finally {
      setIsSubmittingAsistencia(false);
    }
  };

  const handleAbrirModalEditar = (asistencia: any) => {
    setAsistenciaEditando(asistencia);
    setFechaEditar(new Date(asistencia.fecha).toISOString().split('T')[0]);
    setTipoClaseEditar(asistencia.tipoClase);
    setEstadoEditar(asistencia.presente);
    setObservacionesEditar(asistencia.observaciones || '');
    setMostrarModalEditar(true);
  };

  const handleCerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setAsistenciaEditando(null);
    setFechaEditar('');
    setTipoClaseEditar('');
    setEstadoEditar(true);
    setObservacionesEditar('');
  };

  const handleGuardarEdicion = async () => {
    if (!asistenciaEditando) return;

    try {
      setIsSubmittingEdicion(true);
      
      await docenteAsistenciaApi.actualizarAsistencia(asistenciaEditando.id, {
        fecha: fechaEditar,
        tipoClase: tipoClaseEditar,
        presente: estadoEditar,
        observaciones: observacionesEditar || undefined,
      });

      toast.success('Asistencia actualizada correctamente');
      handleCerrarModalEditar();

      // Recargar asistencias registradas y estudiantes
      await cargarAsistenciasRegistradas();
      await cargarEstudiantes();
      cargarAsistenciaDelDia(fechaAsistencia);
    } catch (error: any) {
      console.error('Error al actualizar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar asistencia');
    } finally {
      setIsSubmittingEdicion(false);
    }
  };

  const handleEliminarAsistenciaIndividual = async (idAsistencia: number, nombreEstudiante: string) => {
    if (!window.confirm(`¿Está seguro de eliminar la asistencia de ${nombreEstudiante}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await docenteAsistenciaApi.eliminarAsistencia(idAsistencia);
      toast.success('Asistencia eliminada correctamente');

      // Recargar asistencias registradas y estudiantes
      await cargarAsistenciasRegistradas();
      await cargarEstudiantes();
      
      // Resetear asistencias del día actual
      cargarAsistenciaDelDia(fechaAsistencia);
    } catch (error: any) {
      console.error('Error al eliminar asistencia:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar asistencia');
    }
  };

  const estudiantesFiltrados = estudiantes.filter(est =>
    est.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/docente/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Gestión del Curso</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('estudiantes')}
              className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === 'estudiantes'
                  ? 'bg-white text-primary-700 border-t-2 border-l border-r border-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              Estudiantes
            </button>
            <button
              onClick={() => setActiveTab('notas')}
              className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === 'notas'
                  ? 'bg-white text-primary-700 border-t-2 border-l border-r border-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <PencilSquareIcon className="w-5 h-5" />
              Registro de Notas
            </button>
            <button
              onClick={() => setActiveTab('asistencia')}
              className={`flex items-center gap-2 px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === 'asistencia'
                  ? 'bg-white text-primary-700 border-t-2 border-l border-r border-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CalendarDaysIcon className="w-5 h-5" />
              Asistencia
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab: Estudiantes */}
        {activeTab === 'estudiantes' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Lista de Estudiantes ({estudiantes.length})
                </h2>
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {estudiantesFiltrados.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {estudiantes.length === 0 
                      ? 'No hay estudiantes matriculados en este curso para el período activo.'
                      : 'No se encontraron estudiantes con ese criterio de búsqueda.'}
                  </p>
                  {estudiantes.length === 0 && (
                    <p className="mt-2 text-xs text-gray-400">
                      Verifique que haya un período activo configurado y estudiantes matriculados.
                    </p>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estudiantesFiltrados.map((estudiante) => (
                    <tr key={estudiante.idEstudiante} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {estudiante.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {estudiante.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {estudiante.correo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          (estudiante.promedioFinal || 0) >= 11
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(estudiante.promedioFinal || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {(estudiante.porcentajeAsistencia || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        )}

        {/* Tab: Registro de Notas */}
        {activeTab === 'notas' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Registro de Notas ({estudiantes.length} estudiantes)
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    cargarTiposEvaluacion();
                    setMostrarModalConfig(true);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  Configurar Evaluaciones
                </button>
                <button
                  onClick={handleGuardarTodasLasNotas}
                  disabled={isSubmittingNotas || notasEditadas.size === 0}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {isSubmittingNotas ? 'Guardando...' : `Guardar Todas las Notas ${notasEditadas.size > 0 ? `(${notasEditadas.size})` : ''}`}
                </button>
              </div>
            </div>

            {estudiantes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <PencilSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay estudiantes matriculados en este curso para el período activo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Estudiante
                      </th>
                      {/* Generar headers dinámicamente */}
                      {tiposEvaluacion
                        .filter(tipo => tipo.activo)
                        .sort((a, b) => a.orden - b.orden)
                        .map((tipo) => (
                          <th key={tipo.id || tipo.nombre} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {tipo.nombre}<br/>
                            <span className="text-gray-400 font-normal">({tipo.peso}%)</span>
                          </th>
                        ))}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-primary-50">
                        Promedio
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estudiantes.map((estudiante) => {
                      const notasEditadasEstudiante = notasEditadas.get(estudiante.idMatricula) || {};
                      const tieneEdiciones = notasEditadas.has(estudiante.idMatricula);
                      
                      return (
                        <tr key={estudiante.idMatricula} className={`hover:bg-gray-50 ${tieneEdiciones ? 'bg-yellow-50' : ''}`}>
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{estudiante.nombreCompleto}</span>
                              <span className="text-xs text-gray-500">{estudiante.codigo}</span>
                            </div>
                          </td>
                          
                          {/* Generar inputs dinámicamente para cada tipo de evaluación */}
                          {tiposEvaluacion
                            .filter(tipo => tipo.activo)
                            .sort((a, b) => a.orden - b.orden)
                            .map((tipo) => {
                              const campoNota = mapearNombreACampo(tipo.nombre); // Para guardar en notasEditadas
                              const nombreTipo = tipo.nombre; // Nombre exacto para leer del backend
                              
                              // Buscar valor editado en notasEditadas (camelCase) o valor existente del backend (nombre exacto)
                              const valorActual = notasEditadasEstudiante[campoNota] ?? 
                                                 (estudiante.notas as any)?.[nombreTipo] ?? '';
                              
                              return (
                                <td key={tipo.id || tipo.nombre} className="px-3 py-3">
                                  <input
                                    type="text"
                                    value={valorActual}
                                    onChange={(e) => handleNotaChange(estudiante.idMatricula, campoNota, e.target.value)}
                                    placeholder="0-20"
                                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                  />
                                </td>
                              );
                            })}
                          
                          {/* Promedio */}
                          <td className="px-4 py-3 text-center bg-primary-50">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              Math.round(estudiante.promedioFinal || 0) >= 11
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round(estudiante.promedioFinal || 0)}
                            </span>
                          </td>
                          
                          {/* Acciones */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleGuardarNotasEstudiante(estudiante)}
                              disabled={isSubmittingNotas}
                              className="px-3 py-1 bg-primary-700 text-white text-sm font-medium rounded hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                              Guardar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Asistencia */}
        {activeTab === 'asistencia' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Registro de Asistencia</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Fecha:</label>
                    <input
                      type="date"
                      value={fechaAsistencia}
                      onChange={(e) => handleCambiarFecha(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Tipo:</label>
                    <select
                      value={tipoClaseAsistencia}
                      onChange={(e) => setTipoClaseAsistencia(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
                    >
                      <option value="Teoría">Teoría</option>
                      <option value="Práctica">Práctica</option>
                    </select>
                  </div>
                  <button
                    onClick={handleMarcarTodosPresentes}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Todos Presentes
                  </button>
                  <button
                    onClick={handleMarcarTodosAusentes}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Todos Ausentes
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {asistencias.map((asistencia) => (
                    <tr key={asistencia.idEstudiante} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {asistencia.nombreCompleto}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleAsistencia(asistencia.idEstudiante)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                            asistencia.presente === null
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-300'
                              : asistencia.presente
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {asistencia.presente === null ? (
                            <>
                              <span className="w-5 h-5 flex items-center justify-center">○</span>
                              Sin marcar
                            </>
                          ) : asistencia.presente ? (
                            <>
                              <CheckCircleIcon className="w-5 h-5" />
                              Presente
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-5 h-5" />
                              Ausente
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={asistencia.observaciones}
                          onChange={(e) =>
                            handleObservacionChange(asistencia.idEstudiante, e.target.value)
                          }
                          placeholder="Observaciones (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  Marcados: <span className="font-semibold">{asistencias.filter(a => a.presente !== null).length}</span> de {asistencias.length}
                  {' | '}
                  <span className="text-green-600">Presentes: {asistencias.filter(a => a.presente === true).length}</span>
                  {' | '}
                  <span className="text-red-600">Ausentes: {asistencias.filter(a => a.presente === false).length}</span>
                </p>
              </div>
              <button
                onClick={handleSubmitAsistencia}
                disabled={isSubmittingAsistencia}
                className="w-full py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSubmittingAsistencia ? 'Guardando...' : 'Guardar Asistencia'}
              </button>
            </div>

            {/* Tabla de Asistencias Registradas */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Asistencias Registradas</h3>
                <p className="text-sm text-gray-600 mt-1">Historial de todas las asistencias registradas en este curso</p>
              </div>
              
              {isLoadingAsistenciasRegistradas ? (
                <div className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-600">Cargando asistencias...</p>
                </div>
              ) : asistenciasRegistradas.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin asistencias registradas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aún no hay asistencias registradas para este curso.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo Clase
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observaciones
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {asistenciasRegistradas.map((asist, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(asist.fecha).toLocaleDateString('es-PE', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              asist.tipoClase === 'Teoría'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-primary-100 text-primary-800'
                            }`}>
                              {asist.tipoClase}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {asist.nombreEstudiante}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {asist.presente ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="w-4 h-4" />
                                Presente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircleIcon className="w-4 h-4" />
                                Ausente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {asist.observaciones || '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleAbrirModalEditar(asist)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-700 text-white text-xs font-medium rounded-md hover:bg-primary-800 transition"
                                title="Editar asistencia"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleEliminarAsistenciaIndividual(asist.id, asist.nombreEstudiante)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition"
                                title="Eliminar asistencia"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Configuración de Tipos de Evaluación */}
      {mostrarModalConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Configurar Tipos de Evaluación</h3>
              <button
                onClick={() => setMostrarModalConfig(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingTipos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando configuración...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="text-sm text-primary-900">
                      <strong>Nota:</strong> Los pesos deben sumar exactamente 100%. Los cambios se aplicarán a todos los estudiantes del curso.
                    </p>
                  </div>

                  {/* Tabla de configuración */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                            Orden
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nombre de Evaluación
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                            Peso (%)
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">
                            Activo
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">
                            Acción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tiposEvaluacion.map((tipo, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-center text-sm text-gray-700">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={tipo.nombre}
                                onChange={(e) => handleActualizarTipo(index, 'nombre', e.target.value)}
                                placeholder="Ej: Parcial 1, Prácticas, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={tipo.peso}
                                onChange={(e) => handleActualizarTipo(index, 'peso', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-full px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={tipo.activo}
                                onChange={(e) => handleActualizarTipo(index, 'activo', e.target.checked)}
                                className="w-5 h-5 text-primary-700 border-gray-300 rounded focus:ring-2 focus:ring-primary-600"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleEliminarTipo(index)}
                                className="text-red-600 hover:text-red-800 transition"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="px-4 py-3 text-right font-semibold text-gray-900">
                            TOTAL (solo activos):
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            <span className={`text-lg ${
                              Math.abs(tiposEvaluacion.filter(t => t.activo).reduce((sum, t) => sum + parseFloat(t.peso.toString()), 0) - 100) < 0.01
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {tiposEvaluacion.filter(t => t.activo).reduce((sum, t) => sum + parseFloat(t.peso.toString()), 0).toFixed(2)}%
                            </span>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Botón para agregar nuevo tipo */}
                  <button
                    onClick={handleAgregarTipo}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-600 hover:text-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Agregar Nueva Evaluación
                  </button>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalConfig(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarConfiguracion}
                disabled={isSubmittingNotas || Math.abs(tiposEvaluacion.filter(t => t.activo).reduce((sum, t) => sum + parseFloat(t.peso.toString()), 0) - 100) > 0.01}
                className="px-6 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSubmittingNotas ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Asistencia */}
      {mostrarModalEditar && asistenciaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Editar Asistencia</h3>
              <p className="text-sm text-gray-600 mt-1">{asistenciaEditando.nombreEstudiante}</p>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-4 space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fechaEditar}
                  onChange={(e) => setFechaEditar(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              {/* Tipo de Clase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Clase
                </label>
                <select
                  value={tipoClaseEditar}
                  onChange={(e) => setTipoClaseEditar(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
                >
                  <option value="Teoría">Teoría</option>
                  <option value="Práctica">Práctica</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={estadoEditar ? 'presente' : 'ausente'}
                  onChange={(e) => setEstadoEditar(e.target.value === 'presente')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
                >
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observacionesEditar}
                  onChange={(e) => setObservacionesEditar(e.target.value)}
                  placeholder="Observaciones (opcional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCerrarModalEditar}
                disabled={isSubmittingEdicion}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEdicion}
                disabled={isSubmittingEdicion}
                className="px-6 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSubmittingEdicion ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

