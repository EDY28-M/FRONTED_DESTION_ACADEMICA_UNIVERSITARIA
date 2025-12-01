import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, User, Mail, Briefcase, Calendar, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { docentesApi } from '../../services/docentesService'
import { Docente, DocenteCreate, DocenteUpdate } from '../../types'
import { useNotifications } from '../../contexts/NotificationContext'

interface DocenteModalProps {
  isOpen: boolean
  onClose: () => void
  docente?: Docente | null
  mode: 'create' | 'edit' | 'view'
}

const DocenteModal: React.FC<DocenteModalProps> = ({
  isOpen,
  onClose,
  docente,
  mode,
}) => {
  const queryClient = useQueryClient()
  const { createNotification } = useNotifications()
  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'
  const isCreateMode = mode === 'create'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DocenteCreate | DocenteUpdate>()

  useEffect(() => {
    if (isOpen && docente && (isEditMode || isViewMode)) {
      setValue('apellidos', docente.apellidos)
      setValue('nombres', docente.nombres)
      setValue('profesion', docente.profesion || '')
      setValue('correo', docente.correo || '')
      setValue('fechaNacimiento', docente.fechaNacimiento ? docente.fechaNacimiento.split('T')[0] : '')
    } else if (isOpen && isCreateMode) {
      reset()
    }
  }, [isOpen, docente, mode, setValue, reset, isEditMode, isViewMode, isCreateMode])

  const createMutation = useMutation({
    mutationFn: docentesApi.create,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] })
      toast.success('Docente creado exitosamente')
      await createNotification({
        type: 'docente',
        action: 'crear',
        nombre: `${variables.nombres} ${variables.apellidos}`
      })
      onClose()
    },
    onError: (error) => {
      toast.error('Error al crear docente')
      console.error('Error:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocenteUpdate }) =>
      docentesApi.update(id, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] })
      toast.success('Docente actualizado exitosamente')
      await createNotification({
        type: 'docente',
        action: 'editar',
        nombre: `${variables.data.nombres} ${variables.data.apellidos}`
      })
      onClose()
    },
    onError: (error) => {
      toast.error('Error al actualizar docente')
      console.error('Error:', error)
    },
  })

  const onSubmit = (data: DocenteCreate | DocenteUpdate) => {
    if (isCreateMode) {
      createMutation.mutate(data as DocenteCreate)
    } else if (isEditMode && docente) {
      updateMutation.mutate({ id: docente.id, data: data as DocenteUpdate })
    }
  }

  const title = isCreateMode ? 'Nuevo Docente' : isEditMode ? 'Editar Docente' : 'Detalle del Docente'

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                      <User className="h-4 w-4 text-zinc-600" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-900">
                      {title}
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="px-6 py-5 space-y-5">
                    {/* Two columns for names */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('apellidos', { required: 'Los apellidos son requeridos' })}
                          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${
                            errors.apellidos 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-zinc-200 focus:border-zinc-900'
                          }`}
                          placeholder="Ej: García López"
                          disabled={isViewMode}
                        />
                        {errors.apellidos && (
                          <p className="mt-1 text-xs text-red-500">{errors.apellidos.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('nombres', { required: 'Los nombres son requeridos' })}
                          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${
                            errors.nombres 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-zinc-200 focus:border-zinc-900'
                          }`}
                          placeholder="Ej: Juan Carlos"
                          disabled={isViewMode}
                        />
                        {errors.nombres && (
                          <p className="mt-1 text-xs text-red-500">{errors.nombres.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Profesión */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          Profesión
                        </span>
                      </label>
                      <input
                        type="text"
                        {...register('profesion')}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="Ej: Ingeniero de Sistemas"
                        disabled={isViewMode}
                      />
                    </div>

                    {/* Two columns for email and date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            Correo Electrónico
                          </span>
                        </label>
                        <input
                          type="email"
                          {...register('correo', {
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Correo inválido'
                            }
                          })}
                          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${
                            errors.correo 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-zinc-200 focus:border-zinc-900'
                          }`}
                          placeholder="ejemplo@email.com"
                          disabled={isViewMode}
                        />
                        {errors.correo && (
                          <p className="mt-1 text-xs text-red-500">{errors.correo.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Fecha de Nacimiento
                          </span>
                        </label>
                        <input
                          type="date"
                          {...register('fechaNacimiento')}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    {/* Cursos asignados (view mode only) */}
                    {docente && isViewMode && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Cursos Asignados
                          </span>
                        </label>
                        <div className="mt-2">
                          {docente.cursos.length > 0 ? (
                            <div className="space-y-2">
                              {docente.cursos.map((curso) => (
                                <div key={curso.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                  <span className="text-sm font-medium text-zinc-900">{curso.nombreCurso}</span>
                                  <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                                    Ciclo {curso.ciclo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                              No tiene cursos asignados
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {!isViewMode && (
                    <div className="flex items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                        onClick={onClose}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {createMutation.isPending || updateMutation.isPending
                          ? 'Guardando...'
                          : isCreateMode
                          ? 'Crear Docente'
                          : 'Actualizar'}
                      </button>
                    </div>
                  )}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default DocenteModal

