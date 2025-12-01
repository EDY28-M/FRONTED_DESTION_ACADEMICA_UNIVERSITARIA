import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon, 
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
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
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 7, nombre: 'Domingo' },
];

export default function GestionHorarioModal({ isOpen, onClose, curso }: GestionHorarioModalProps) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictoError, setConflictoError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateHorarioDto>({
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900">
                      Gestión de Horarios
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-slate-500">
                      {curso?.nombreCurso} - {curso?.codigo}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-8">
                  {/* Sección Superior: Lista de Horarios */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-slate-500" />
                      Horarios Asignados
                    </h4>
                    
                    <div className="overflow-hidden rounded-md border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Día</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Horario</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aula</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {isLoading ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                Cargando horarios...
                              </td>
                            </tr>
                          ) : horarios.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                No hay horarios asignados a este curso.
                              </td>
                            </tr>
                          ) : (
                            horarios.map((horario) => (
                              <tr key={horario.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                                  {horario.diaSemanaTexto}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                                  {horario.horaInicio} - {horario.horaFin}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    horario.tipo === 'Teoría' 
                                      ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' 
                                      : 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                                  }`}>
                                    {horario.tipo}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {horario.aula || '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleDelete(horario.id)}
                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                    title="Eliminar horario"
                                  >
                                    <TrashIcon className="h-4 w-4" />
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
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
                    <h4 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                      <PlusIcon className="h-4 w-4 text-slate-500" />
                      Agregar Nueva Sesión
                    </h4>

                    {/* Alerta de Conflicto */}
                    {conflictoError && (
                      <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Conflicto de horario detectado</h3>
                            <div className="mt-1 text-sm text-red-700">
                              {conflictoError}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                      {/* Día */}
                      <div className="sm:col-span-2">
                        <label htmlFor="diaSemana" className="block text-xs font-medium text-slate-700 mb-1">
                          Día
                        </label>
                        <select
                          id="diaSemana"
                          {...register('diaSemana', { required: true })}
                          className="block w-full rounded-md border-slate-300 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm sm:leading-6"
                        >
                          {DIAS_SEMANA.map(dia => (
                            <option key={dia.id} value={dia.id}>{dia.nombre}</option>
                          ))}
                        </select>
                      </div>

                      {/* Hora Inicio */}
                      <div className="sm:col-span-1">
                        <label htmlFor="horaInicio" className="block text-xs font-medium text-slate-700 mb-1">
                          Inicio
                        </label>
                        <input
                          type="time"
                          id="horaInicio"
                          {...register('horaInicio', { required: true })}
                          className="block w-full rounded-md border-slate-300 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm sm:leading-6"
                        />
                      </div>

                      {/* Hora Fin */}
                      <div className="sm:col-span-1">
                        <label htmlFor="horaFin" className="block text-xs font-medium text-slate-700 mb-1">
                          Fin
                        </label>
                        <input
                          type="time"
                          id="horaFin"
                          {...register('horaFin', { required: true })}
                          className="block w-full rounded-md border-slate-300 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm sm:leading-6"
                        />
                      </div>

                      {/* Tipo */}
                      <div className="sm:col-span-1">
                        <label htmlFor="tipo" className="block text-xs font-medium text-slate-700 mb-1">
                          Tipo
                        </label>
                        <select
                          id="tipo"
                          {...register('tipo', { required: true })}
                          className="block w-full rounded-md border-slate-300 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm sm:leading-6"
                        >
                          <option value="Teoría">Teoría</option>
                          <option value="Práctica">Práctica</option>
                        </select>
                      </div>

                      {/* Aula */}
                      <div className="sm:col-span-1">
                        <label htmlFor="aula" className="block text-xs font-medium text-slate-700 mb-1">
                          Aula
                        </label>
                        <input
                          type="text"
                          id="aula"
                          placeholder="Ej. 301"
                          {...register('aula')}
                          className="block w-full rounded-md border-slate-300 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm sm:leading-6"
                        />
                      </div>

                      {/* Botón Submit */}
                      <div className="sm:col-span-6 flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Guardando...' : 'Agregar Sesión'}
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
