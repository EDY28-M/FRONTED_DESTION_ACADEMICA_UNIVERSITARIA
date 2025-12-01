import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Trash2, Clock, AlertTriangle, Calendar, MapPin, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { horariosApi } from '../../services/horariosApi';
import { Horario, CreateHorarioDto } from '../../types/horario';
import { Curso } from '../../types';

interface GestionHorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
}

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes', short: 'Lun' },
  { id: 2, nombre: 'Martes', short: 'Mar' },
  { id: 3, nombre: 'Miércoles', short: 'Mié' },
  { id: 4, nombre: 'Jueves', short: 'Jue' },
  { id: 5, nombre: 'Viernes', short: 'Vie' },
  { id: 6, nombre: 'Sábado', short: 'Sáb' },
  { id: 7, nombre: 'Domingo', short: 'Dom' },
];

export default function GestionHorarioModal({ isOpen, onClose, curso }: GestionHorarioModalProps) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictoError, setConflictoError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateHorarioDto>({
    defaultValues: {
      tipo: 'Teoría',
      diaSemana: 1
    }
  });

  // Cargar horarios al abrir el modal
  useEffect(() => {
    if (isOpen && curso) {
      cargarHorarios();
      reset({ tipo: 'Teoría', diaSemana: 1, aula: '', horaInicio: '', horaFin: '' });
      setConflictoError(null);
    }
  }, [isOpen, curso]);

  const cargarHorarios = async () => {
    if (!curso) return;
    try {
      setIsLoading(true);
      const data = await horariosApi.getHorariosByCurso(curso.id);
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      toast.error('No se pudieron cargar los horarios');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateHorarioDto) => {
    if (!curso) return;
    setConflictoError(null);

    // Validación básica de horas
    if (data.horaInicio >= data.horaFin) {
      toast.error('La hora de inicio debe ser menor a la hora de fin');
      return;
    }

    try {
      setIsSubmitting(true);
      await horariosApi.createHorario({
        ...data,
        idCurso: curso.id,
        diaSemana: Number(data.diaSemana)
      });
      
      toast.success('Horario agregado correctamente');
      reset({ tipo: 'Teoría', diaSemana: 1, aula: '', horaInicio: '', horaFin: '' });
      cargarHorarios();
    } catch (error: any) {
      console.error('Error al crear horario:', error);
      if (error.response?.status === 409) {
        // Conflicto de horario
        const mensaje = error.response.data.message || 'Conflicto de horario detectado';
        setConflictoError(mensaje);
      } else {
        toast.error('Error al guardar el horario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;
    
    try {
      await horariosApi.deleteHorario(id);
      toast.success('Horario eliminado');
      cargarHorarios();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('No se pudo eliminar el horario');
    }
  };

  // Input classes helper
  const inputClasses = `
    w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors 
    placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10
  `;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                      <Calendar className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-900">
                        Gestión de Horarios
                      </Dialog.Title>
                      <p className="text-sm text-zinc-500">
                        {curso?.codigo && <span className="font-medium">{curso.codigo}</span>}
                        {curso?.codigo && ' · '}
                        {curso?.nombreCurso}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                  {/* Sección Superior: Lista de Horarios */}
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      Horarios Asignados
                      {horarios.length > 0 && (
                        <span className="ml-auto text-xs text-zinc-400">{horarios.length} sesiones</span>
                      )}
                    </h4>
                    
                    <div className="overflow-hidden rounded-lg border border-zinc-200">
                      <table className="min-w-full divide-y divide-zinc-100">
                        <thead className="bg-zinc-50/80">
                          <tr>
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Día</th>
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Horario</th>
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Aula</th>
                            <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-zinc-100">
                          {isLoading ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
                                  <span className="text-sm text-zinc-500">Cargando horarios...</span>
                                </div>
                              </td>
                            </tr>
                          ) : horarios.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <Clock className="h-8 w-8 text-zinc-300" />
                                  <p className="text-sm text-zinc-500">No hay horarios asignados</p>
                                  <p className="text-xs text-zinc-400">Agrega una nueva sesión usando el formulario inferior</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            horarios.map((horario) => (
                              <tr key={horario.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-zinc-900 font-medium">
                                  {horario.diaSemanaTexto}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-700 font-mono bg-zinc-100 px-2 py-0.5 rounded">
                                    <Clock className="h-3 w-3 text-zinc-400" />
                                    {horario.horaInicio} - {horario.horaFin}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    horario.tipo === 'Teoría' 
                                      ? 'bg-zinc-100 text-zinc-700' 
                                      : 'bg-zinc-800 text-white'
                                  }`}>
                                    <BookOpen className="h-3 w-3" />
                                    {horario.tipo}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-zinc-600">
                                  {horario.aula ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <MapPin className="h-3 w-3 text-zinc-400" />
                                      {horario.aula}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => handleDelete(horario.id)}
                                    className="inline-flex items-center justify-center h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Eliminar horario"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sección Inferior: Formulario */}
                  <div className="bg-zinc-50/50 rounded-lg border border-zinc-200 p-5">
                    <h4 className="text-sm font-medium text-zinc-900 mb-4 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-zinc-500" />
                      Agregar Nueva Sesión
                    </h4>

                    {/* Alerta de Conflicto */}
                    {conflictoError && (
                      <div className="mb-4 rounded-lg bg-amber-50 p-4 border border-amber-200">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-amber-800">Conflicto de horario detectado</h3>
                            <p className="mt-1 text-sm text-amber-700">{conflictoError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                      {/* Día */}
                      <div className="sm:col-span-2">
                        <label htmlFor="diaSemana" className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Día de la semana
                        </label>
                        <select
                          id="diaSemana"
                          {...register('diaSemana', { required: true })}
                          className={inputClasses}
                        >
                          {DIAS_SEMANA.map(dia => (
                            <option key={dia.id} value={dia.id}>{dia.nombre}</option>
                          ))}
                        </select>
                      </div>

                      {/* Hora Inicio */}
                      <div className="sm:col-span-1">
                        <label htmlFor="horaInicio" className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Inicio
                        </label>
                        <input
                          type="time"
                          id="horaInicio"
                          {...register('horaInicio', { required: true })}
                          className={inputClasses}
                        />
                      </div>

                      {/* Hora Fin */}
                      <div className="sm:col-span-1">
                        <label htmlFor="horaFin" className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Fin
                        </label>
                        <input
                          type="time"
                          id="horaFin"
                          {...register('horaFin', { required: true })}
                          className={inputClasses}
                        />
                      </div>

                      {/* Tipo */}
                      <div className="sm:col-span-1">
                        <label htmlFor="tipo" className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Tipo
                        </label>
                        <select
                          id="tipo"
                          {...register('tipo', { required: true })}
                          className={inputClasses}
                        >
                          <option value="Teoría">Teoría</option>
                          <option value="Práctica">Práctica</option>
                        </select>
                      </div>

                      {/* Aula */}
                      <div className="sm:col-span-1">
                        <label htmlFor="aula" className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Aula
                        </label>
                        <input
                          type="text"
                          id="aula"
                          placeholder="301"
                          {...register('aula')}
                          className={inputClasses}
                        />
                      </div>

                      {/* Botón Submit */}
                      <div className="sm:col-span-6 flex justify-end pt-2 border-t border-zinc-200 mt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Agregar Sesión
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
