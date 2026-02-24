import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, FileText, Code } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { facultadesApi } from '../../services/facultadesApi'
import { Facultad, CrearFacultad, ActualizarFacultad } from '../../types/facultad'

interface FacultadModalProps {
    isOpen: boolean
    onClose: () => void
    facultad?: Facultad | null
    mode: 'create' | 'edit' | 'view'
}

const FacultadModal: React.FC<FacultadModalProps> = ({
    isOpen,
    onClose,
    facultad,
    mode,
}) => {
    const queryClient = useQueryClient()
    const isViewMode = mode === 'view'
    const isEditMode = mode === 'edit'
    const isCreateMode = mode === 'create'

    const [autoGenerateCode, setAutoGenerateCode] = useState(true)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<CrearFacultad | ActualizarFacultad>()

    const nombreValue = watch('nombre')
    const [debouncedNombre, setDebouncedNombre] = useState(nombreValue)

    // Debounce nombre
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedNombre(nombreValue)
        }, 500)
        return () => clearTimeout(timer)
    }, [nombreValue])

    // Query for suggestion
    const { data: suggestedCode } = useQuery({
        queryKey: ['suggestCode', debouncedNombre],
        queryFn: () => facultadesApi.suggestCode(debouncedNombre!),
        enabled: isCreateMode && autoGenerateCode && !!debouncedNombre && debouncedNombre.length > 2,
        staleTime: Infinity, // Keep prediction until parameters change
    })

    // Update code value when suggestion arrives
    useEffect(() => {
        if (isCreateMode && autoGenerateCode && suggestedCode) {
            setValue('codigo', suggestedCode)
        } else if (isCreateMode && autoGenerateCode && (!debouncedNombre || debouncedNombre.length <= 2)) {
            setValue('codigo', '')
        }
    }, [suggestedCode, autoGenerateCode, isCreateMode, setValue, debouncedNombre])

    useEffect(() => {
        if (isOpen && facultad && (isEditMode || isViewMode)) {
            setValue('nombre', facultad.nombre)
            setValue('codigo', facultad.codigo || '')
            setValue('descripcion', facultad.descripcion || '')
            if (isEditMode) {
                // @ts-ignore
                setValue('activo', facultad.activo)
            }
            setAutoGenerateCode(false)
        } else if (isOpen && isCreateMode) {
            reset()
            setAutoGenerateCode(true)
            setValue('codigo', '')
        }
    }, [isOpen, facultad, mode, setValue, reset, isEditMode, isViewMode, isCreateMode])

    // Clear code when auto-generate is enabled
    useEffect(() => {
        if (isCreateMode && autoGenerateCode) {
            setValue('codigo', '')
        }
    }, [autoGenerateCode, isCreateMode, setValue])

    const createMutation = useMutation({
        mutationFn: facultadesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facultades'] })
            toast.success('Facultad creada exitosamente')
            onClose()
        },
        onError: (error) => {
            toast.error('Error al crear facultad')
            console.error('Error:', error)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ActualizarFacultad }) =>
            facultadesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facultades'] })
            toast.success('Facultad actualizada exitosamente')
            onClose()
        },
        onError: (error) => {
            toast.error('Error al actualizar facultad')
            console.error('Error:', error)
        },
    })

    const onSubmit = (data: CrearFacultad | ActualizarFacultad) => {
        if (isCreateMode) {
            // Ensure code is empty if auto-generate is checked, so backend handles it
            if (autoGenerateCode) {
                data.codigo = ''
            }
            createMutation.mutate(data as CrearFacultad)
        } else if (isEditMode && facultad) {
            // Ensure 'activo' is included for updates
            const updateData = { ...data, activo: facultad.activo } as ActualizarFacultad
            updateMutation.mutate({ id: facultad.id, data: updateData })
        }
    }

    const title = isCreateMode ? 'Nueva Facultad' : isEditMode ? 'Editar Facultad' : 'Detalle de Facultad'

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
                                        {/* Nombre */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                Nombre <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('nombre', { required: 'El nombre es requerido' })}
                                                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${errors.nombre
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-zinc-200 focus:border-zinc-900'
                                                    }`}
                                                placeholder="Ej: Facultad de Ingeniería"
                                                disabled={isViewMode}
                                            />
                                            {errors.nombre && (
                                                <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>
                                            )}
                                        </div>

                                        {/* Código */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-sm font-medium text-zinc-700">
                                                    <span className="flex items-center gap-1.5">
                                                        <Code className="h-3.5 w-3.5" />
                                                        Código
                                                    </span>
                                                </label>
                                                {isCreateMode && (
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={autoGenerateCode}
                                                            onChange={(e) => setAutoGenerateCode(e.target.checked)}
                                                            className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                                                        />
                                                        <span className="text-xs text-zinc-600 font-medium">Generar automáticamente</span>
                                                    </label>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                {...register('codigo')}
                                                readOnly={isViewMode || (isCreateMode && autoGenerateCode)}
                                                className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 ${autoGenerateCode && isCreateMode
                                                    ? 'bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed'
                                                    : 'bg-white border-zinc-200 focus:border-zinc-900'
                                                    }`}
                                                placeholder={isCreateMode && autoGenerateCode ? "Generando código..." : "Ej: FI-001"}
                                            />
                                            {isCreateMode && autoGenerateCode && (
                                                <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    El sistema asignará un código único al guardar
                                                </p>
                                            )}
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                                <span className="flex items-center gap-1.5">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Descripción
                                                </span>
                                            </label>
                                            <textarea
                                                {...register('descripcion')}
                                                rows={3}
                                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                                placeholder="Descripción opcional de la facultad..."
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
                                                        ? 'Crear Facultad'
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

export default FacultadModal
