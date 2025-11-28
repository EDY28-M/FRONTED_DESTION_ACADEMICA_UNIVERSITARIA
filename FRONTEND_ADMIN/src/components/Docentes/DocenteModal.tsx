import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
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

  const title = isCreateMode ? 'Nuevo Docente' : isEditMode ? 'Editar Docente' : 'Ver Docente'

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      {title}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label">Apellidos *</label>
                          <input
                            type="text"
                            {...register('apellidos', { required: 'Los apellidos son requeridos' })}
                            className="input"
                            disabled={isViewMode}
                          />
                          {errors.apellidos && (
                            <p className="mt-1 text-sm text-red-600">{errors.apellidos.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="label">Nombres *</label>
                          <input
                            type="text"
                            {...register('nombres', { required: 'Los nombres son requeridos' })}
                            className="input"
                            disabled={isViewMode}
                          />
                          {errors.nombres && (
                            <p className="mt-1 text-sm text-red-600">{errors.nombres.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="label">Profesión</label>
                        <input
                          type="text"
                          {...register('profesion')}
                          className="input"
                          disabled={isViewMode}
                        />
                      </div>

                      <div>
                        <label className="label">Correo Electrónico</label>
                        <input
                          type="email"
                          {...register('correo', {
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Ingrese un correo válido'
                            }
                          })}
                          className="input"
                          disabled={isViewMode}
                        />
                        {errors.correo && (
                          <p className="mt-1 text-sm text-red-600">{errors.correo.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          {...register('fechaNacimiento')}
                          className="input"
                          disabled={isViewMode}
                        />
                      </div>

                      {docente && isViewMode && (
                        <div>
                          <label className="label">Cursos Asignados</label>
                          <div className="mt-2">
                            {docente.cursos.length > 0 ? (
                              <div className="space-y-2">
                                {docente.cursos.map((curso) => (
                                  <div key={curso.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">{curso.nombreCurso}</span>
                                    <span className="text-xs text-gray-500">Ciclo {curso.ciclo}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No tiene cursos asignados</p>
                            )}
                          </div>
                        </div>
                      )}

                      {!isViewMode && (
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="btn btn-primary btn-md w-full sm:ml-3 sm:w-auto"
                            disabled={createMutation.isPending || updateMutation.isPending}
                          >
                            {createMutation.isPending || updateMutation.isPending
                              ? 'Guardando...'
                              : isCreateMode
                              ? 'Crear Docente'
                              : 'Actualizar Docente'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-md mt-3 w-full sm:mt-0 sm:w-auto"
                            onClick={onClose}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default DocenteModal

