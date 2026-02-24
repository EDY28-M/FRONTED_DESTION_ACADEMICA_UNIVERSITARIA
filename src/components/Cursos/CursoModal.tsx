import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { cursosApi } from '../../services/cursosService'
import { Curso, CursoCreate, CursoUpdate, Docente } from '../../types'
import { Facultad } from '../../types/facultad'
import { Escuela } from '../../types/escuela'
import { useNotifications } from '../../contexts/NotificationContext'

interface CursoModalProps {
  isOpen: boolean
  onClose: () => void
  curso?: Curso | null
  mode: 'create' | 'edit' | 'view'
  docentes: Docente[]
  facultades: Facultad[]
  escuelas: Escuela[]
}

const CursoModal: React.FC<CursoModalProps> = ({
  isOpen,
  onClose,
  curso,
  mode,
  docentes,
  facultades,
  escuelas,
}) => {
  const queryClient = useQueryClient()
  const { createNotification } = useNotifications()
  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'
  const isCreateMode = mode === 'create'
  const [selectedPrerequisitos, setSelectedPrerequisitos] = useState<number[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CursoCreate | CursoUpdate>()

  const cicloActual = watch('ciclo')

  // Obtener lista de cursos para prerequisitos
  const { data: cursosDisponiblesResponse } = useQuery({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  })
  const cursosDisponibles: Curso[] = Array.isArray(cursosDisponiblesResponse) ? cursosDisponiblesResponse : [];

  useEffect(() => {
    if (isOpen && curso && (isEditMode || isViewMode)) {
      setValue('codigo', curso.codigo || '')
      setValue('nombreCurso', curso.nombreCurso)
      setValue('creditos', curso.creditos)
      setValue('horasSemanal', curso.horasSemanal)
      setValue('horasTeoria', curso.horasTeoria || undefined)
      setValue('horasTotales', curso.horasTotales || undefined)
      setValue('ciclo', curso.ciclo)
      setValue('idDocente', curso.idDocente || undefined)
      setValue('idFacultad', curso.idFacultad || undefined)
      setValue('idEscuela', curso.idEscuela || undefined)
      setSelectedPrerequisitos(curso.prerequisitosIds || [])
    } else if (isOpen && isCreateMode) {
      reset()
      setSelectedPrerequisitos([])
    }
  }, [isOpen, curso, mode, setValue, reset, isEditMode, isViewMode, isCreateMode])

  const createMutation = useMutation({
    mutationFn: cursosApi.create,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      toast.success('Curso creado exitosamente')
      await createNotification({
        type: 'curso',
        action: 'crear',
        nombre: variables.nombreCurso
      })
      onClose()
    },
    onError: (error) => {
      toast.error('Error al crear curso')
      console.error('Error:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CursoUpdate }) =>
      cursosApi.update(id, data),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      toast.success('Curso actualizado exitosamente')
      await createNotification({
        type: 'curso',
        action: 'editar',
        nombre: variables.data.nombreCurso
      })
      onClose()
    },
    onError: (error) => {
      toast.error('Error al actualizar curso')
      console.error('Error:', error)
    },
  })

  const onSubmit = (data: CursoCreate | CursoUpdate) => {
    const formData = {
      ...data,
      idDocente: data.idDocente ? Number(data.idDocente) : undefined,
      idFacultad: data.idFacultad ? Number(data.idFacultad) : undefined,
      idEscuela: data.idEscuela ? Number(data.idEscuela) : undefined,
      prerequisitosIds: selectedPrerequisitos,
    }

    if (isCreateMode) {
      createMutation.mutate(formData as CursoCreate)
    } else if (isEditMode && curso) {
      updateMutation.mutate({ id: curso.id, data: formData as CursoUpdate })
    }
  }

  const handlePrerequisitosChange = (cursoId: number) => {
    setSelectedPrerequisitos(prev =>
      prev.includes(cursoId)
        ? prev.filter(id => id !== cursoId)
        : [...prev, cursoId]
    )
  }

  // Filtrar escuelas por la facultad seleccionada
  const selectedFacultadId = watch('idFacultad')
  const filteredEscuelas = escuelas.filter(
    (escuela: any) => !selectedFacultadId || escuela.facultadId === Number(selectedFacultadId)
  )

  // Filtrar cursos para prerequisitos (solo cursos de ciclos anteriores)
  const cursosParaPrerequisitos = cursosDisponibles.filter(c => {
    const cicloSeleccionado = Number(cicloActual)
    return c.ciclo < cicloSeleccionado && c.id !== curso?.id
  })

  const title = isCreateMode ? 'Nuevo Curso' : isEditMode ? 'Editar Curso' : 'Detalle del Curso'

  // Input classes helper
  const inputClasses = (hasError: boolean = false) => `
    w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors 
    placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10
    ${hasError ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900'}
    disabled:bg-zinc-50 disabled:text-zinc-500
  `

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
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
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
                  <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Código y Nombre */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Código
                        </label>
                        <input
                          type="text"
                          {...register('codigo')}
                          className={inputClasses()}
                          placeholder="IS040101"
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Nombre del Curso <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('nombreCurso', { required: 'El nombre es requerido' })}
                          className={inputClasses(!!errors.nombreCurso)}
                          placeholder="Ej: Programación Web"
                          disabled={isViewMode}
                        />
                        {errors.nombreCurso && (
                          <p className="mt-1 text-xs text-red-500">{errors.nombreCurso.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Créditos, Horas, Ciclo */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Créditos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          {...register('creditos', {
                            required: 'Requerido',
                            min: { value: 1, message: 'Mín. 1' },
                            max: { value: 10, message: 'Máx. 10' }
                          })}
                          className={inputClasses(!!errors.creditos)}
                          disabled={isViewMode}
                        />
                        {errors.creditos && (
                          <p className="mt-1 text-xs text-red-500">{errors.creditos.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Horas/Semana <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          {...register('horasSemanal', {
                            required: 'Requerido',
                            min: { value: 1, message: 'Mín. 1' },
                            max: { value: 40, message: 'Máx. 40' }
                          })}
                          className={inputClasses(!!errors.horasSemanal)}
                          disabled={isViewMode}
                        />
                        {errors.horasSemanal && (
                          <p className="mt-1 text-xs text-red-500">{errors.horasSemanal.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Ciclo <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('ciclo', { required: 'Requerido' })}
                          className={inputClasses(!!errors.ciclo)}
                          disabled={isViewMode}
                        >
                          <option value="">Seleccionar</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ciclo) => (
                            <option key={ciclo} value={ciclo}>
                              Ciclo {ciclo}
                            </option>
                          ))}
                        </select>
                        {errors.ciclo && (
                          <p className="mt-1 text-xs text-red-500">{errors.ciclo.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Horas detalladas */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Horas Teoría
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          {...register('horasTeoria')}
                          className={inputClasses()}
                          disabled={isViewMode}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Horas Práctica
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          {...register('horasPractica')}
                          className={inputClasses()}
                          disabled={isViewMode}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Horas Totales
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          {...register('horasTotales')}
                          className={inputClasses()}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    {/* Docente, Facultad y Escuela */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Docente */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Docente Asignado
                        </label>
                        <select
                          {...register('idDocente')}
                          className={inputClasses()}
                          disabled={isViewMode}
                        >
                          <option value="">Sin asignar</option>
                          {docentes.map((docente) => (
                            <option key={docente.id} value={docente.id}>
                              {docente.nombres} {docente.apellidos}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Facultad */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Facultad
                        </label>
                        <select
                          {...register('idFacultad')}
                          className={inputClasses()}
                          disabled={isViewMode}
                        >
                          <option value="">General (Todas)</option>
                          {facultades.map((facultad) => (
                            <option key={facultad.id} value={facultad.id}>
                              {facultad.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Escuela */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Escuela Profesional
                        </label>
                        <select
                          {...register('idEscuela')}
                          className={inputClasses()}
                          disabled={isViewMode || (!selectedFacultadId && filteredEscuelas.length === 0)}
                        >
                          <option value="">General (Todas)</option>
                          {filteredEscuelas.map((escuela) => (
                            <option key={escuela.id} value={escuela.id}>
                              {escuela.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Prerequisitos - Edit/Create mode */}
                    {!isViewMode && cicloActual && Number(cicloActual) > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Prerequisitos
                        </label>

                        {/* Selected pills */}
                        {selectedPrerequisitos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedPrerequisitos.map(id => {
                              const c = cursosDisponibles.find((curso: Curso) => curso.id === id)
                              return c ? (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700"
                                >
                                  {c.nombreCurso}
                                  <button
                                    type="button"
                                    onClick={() => handlePrerequisitosChange(id)}
                                    className="text-zinc-400 hover:text-zinc-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ) : null
                            })}
                          </div>
                        )}

                        <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 divide-y divide-zinc-100">
                          {cursosParaPrerequisitos.length > 0 ? (
                            cursosParaPrerequisitos.map((c) => (
                              <label
                                key={c.id}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPrerequisitos.includes(c.id)}
                                  onChange={() => handlePrerequisitosChange(c.id)}
                                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 accent-zinc-900"
                                />
                                <span className="flex-1 text-sm text-zinc-700">
                                  {c.codigo ? `${c.codigo} - ` : ''}{c.nombreCurso}
                                </span>
                                <span className="text-xs text-zinc-400">Ciclo {c.ciclo}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-zinc-500 px-3 py-4 text-center">
                              No hay cursos disponibles como prerequisitos
                            </p>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-400">
                          Solo se muestran cursos de ciclos anteriores
                        </p>
                      </div>
                    )}

                    {/* Prerequisitos - View mode */}
                    {isViewMode && curso?.prerequisitos && curso.prerequisitos.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Prerequisitos
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {curso.prerequisitos.map((p: any) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-zinc-100 text-zinc-700 border border-zinc-200"
                            >
                              {p.codigo ? `${p.codigo} - ` : ''}{p.nombreCurso}
                              <span className="ml-2 text-xs text-zinc-400">(Ciclo {p.ciclo})</span>
                            </span>
                          ))}
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
                            ? 'Crear Curso'
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

export default CursoModal

