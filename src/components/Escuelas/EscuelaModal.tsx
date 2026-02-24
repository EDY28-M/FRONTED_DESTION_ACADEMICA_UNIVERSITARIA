import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, GraduationCap, FileText, Code, Clock, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { escuelasApi } from '../../services/escuelasApi'
import { facultadesApi } from '../../services/facultadesApi'
import { Escuela, CrearEscuela, ActualizarEscuela } from '../../types/escuela'

interface EscuelaModalProps {
    isOpen: boolean
    onClose: () => void
    escuela?: Escuela | null
    mode: 'create' | 'edit' | 'view'
}

const EscuelaModal: React.FC<EscuelaModalProps> = ({
    isOpen,
    onClose,
    escuela,
    mode,
}) => {
    const queryClient = useQueryClient()
    const isViewMode = mode === 'view'
    const isEditMode = mode === 'edit'
    const isCreateMode = mode === 'create'

    const { data: facultades } = useQuery({
        queryKey: ['facultades'],
        queryFn: facultadesApi.getAll,
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<CrearEscuela | ActualizarEscuela>()

    useEffect(() => {
        if (isOpen && escuela && (isEditMode || isViewMode)) {
            setValue('facultadId', escuela.facultadId)
            setValue('nombre', escuela.nombre)
            setValue('codigo', escuela.codigo || '')
            setValue('descripcion', escuela.descripcion || '')
            // @ts-ignore
            setValue('duracionAnios', escuela.duracionAnios)
            // @ts-ignore
            setValue('totalCreditos', escuela.totalCreditos)
            if (isEditMode) {
                // @ts-ignore
                setValue('activo', escuela.activo)
            }
        } else if (isOpen && isCreateMode) {
            reset()
        }
    }, [isOpen, escuela, mode, setValue, reset, isEditMode, isViewMode, isCreateMode])

    const createMutation = useMutation({
        mutationFn: escuelasApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escuelas'] })
            toast.success('Escuela creada exitosamente')
            onClose()
        },
        onError: (error) => {
            toast.error('Error al crear escuela')
            console.error('Error:', error)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ActualizarEscuela }) =>
            escuelasApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escuelas'] })
            toast.success('Escuela actualizada exitosamente')
            onClose()
        },
        onError: (error) => {
            toast.error('Error al actualizar escuela')
            console.error('Error:', error)
        },
    })

    const onSubmit = (data: CrearEscuela | ActualizarEscuela) => {
        // Convert numerical values from strings
        data.facultadId = Number(data.facultadId)
        // @ts-ignore
        if (data.duracionAnios) data.duracionAnios = Number(data.duracionAnios)
        // @ts-ignore
        if (data.totalCreditos) data.totalCreditos = Number(data.totalCreditos)

        if (isCreateMode) {
            createMutation.mutate(data as CrearEscuela)
        } else if (isEditMode && escuela) {
            const updateData = { ...data, activo: escuela.activo } as ActualizarEscuela
            updateMutation.mutate({ id: escuela.id, data: updateData })
        }
    }

    const title = isCreateMode ? 'Nueva Escuela' : isEditMode ? 'Editar Escuela' : 'Detalle de Escuela'

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
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-900">
                                        {title}
                                    </Dialog.Title>
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

                                        {/* Facultad Select */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                Facultad <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                {...register('facultadId', { required: 'La facultad es requerida' })}
                                                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${errors.facultadId ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-900'
                                                    }`}
                                                disabled={isViewMode}
                                            >
                                                <option value="">Seleccione una facultad</option>
                                                {facultades?.map(f => (
                                                    <option key={f.id} value={f.id}>{f.nombre}</option>
                                                ))}
                                            </select>
                                            {errors.facultadId && (
                                                <p className="mt-1 text-xs text-red-500">{errors.facultadId.message}</p>
                                            )}
                                        </div>

                                        {/* Nombre */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                Nombre de la Escuela <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('nombre', { required: 'El nombre es requerido' })}
                                                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${errors.nombre
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-zinc-200 focus:border-zinc-900'
                                                    }`}
                                                placeholder="Ej: Ingeniería de Sistemas"
                                                disabled={isViewMode}
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>
                                            )}
                                        </div>

                                        {/* Código y Duración */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                    Código
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('codigo')}
                                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                                    placeholder="Ej: IS"
                                                    disabled={isViewMode}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                    Duración (Años)
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('duracionAnios')}
                                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                                    placeholder="5"
                                                    disabled={isViewMode}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                Total Créditos
                                            </label>
                                            <input
                                                type="number"
                                                {...register('totalCreditos')}
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                                placeholder="220"
                                                disabled={isViewMode}
                                            />
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                Descripción
                                            </label>
                                            <textarea
                                                {...register('descripcion')}
                                                rows={3}
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                                placeholder="Descripción opcional de la escuela..."
                                                disabled={isViewMode}
                                            />
                                        </div>
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
                                                        ? 'Crear Escuela'
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

export default EscuelaModal
