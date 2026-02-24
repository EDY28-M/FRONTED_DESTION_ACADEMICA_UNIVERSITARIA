import { useState } from 'react'
import { Plus, Search, Landmark, Pencil, Trash2, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { facultadesApi } from '../../services/facultadesApi'
import { Facultad } from '../../types/facultad'
import FacultadModal from '../../components/Facultades/FacultadModal'
import { toast } from 'react-toastify'
import ConfirmModal from '../../components/Common/ConfirmModal'

const GestionFacultadesPage = () => {
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFacultad, setSelectedFacultad] = useState<Facultad | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [facultadToDelete, setFacultadToDelete] = useState<Facultad | null>(null)

    const { data: facultades, isLoading } = useQuery({
        queryKey: ['facultades'],
        queryFn: facultadesApi.getAll,
    })

    // Mutación para eliminar
    const deleteMutation = useMutation({
        mutationFn: facultadesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facultades'] })
            toast.success('Facultad eliminada exitosamente')
            setIsDeleteModalOpen(false)
            setFacultadToDelete(null)
        },
        onError: (error) => {
            toast.error('Error al eliminar facultad')
            console.error(error)
        }
    })

    // Mutación para cambiar estado
    const toggleActiveMutation = useMutation({
        mutationFn: facultadesApi.toggleActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facultades'] })
            toast.success('Estado actualizado correctamente')
        },
        onError: (error) => {
            toast.error('Error al cambiar estado')
            console.error(error)
        }
    })

    const handleCreate = () => {
        setSelectedFacultad(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEdit = (facultad: Facultad) => {
        setSelectedFacultad(facultad)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleView = (facultad: Facultad) => {
        setSelectedFacultad(facultad)
        setModalMode('view')
        setIsModalOpen(true)
    }

    const handleDeleteClick = (facultad: Facultad) => {
        setFacultadToDelete(facultad)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = () => {
        if (facultadToDelete) {
            deleteMutation.mutate(facultadToDelete.id)
        }
    }

    const filteredFacultades = facultades?.filter(f =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.codigo && f.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Gestión de Facultades</h1>
                    <p className="text-zinc-500 mt-1">Administra las facultades de la institución</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Facultad
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Facultades</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{facultades?.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Activas</p>
                            <h3 className="text-2xl font-bold text-zinc-900">
                                {facultades?.filter(f => f.activo).length || 0}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50/50 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Escuelas</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        Cargando facultades...
                                    </td>
                                </tr>
                            ) : filteredFacultades?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        No se encontraron facultades
                                    </td>
                                </tr>
                            ) : (
                                filteredFacultades?.map((facultad) => (
                                    <tr key={facultad.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                                    <Landmark className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">{facultad.nombre}</p>
                                                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">{facultad.descripcion}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                                                {facultad.codigo || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {facultad.totalEscuelas} escuelas
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActiveMutation.mutate(facultad.id)}
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${facultad.activo
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    } transition-colors cursor-pointer`}
                                            >
                                                {facultad.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(facultad)}
                                                    className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(facultad)}
                                                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(facultad)}
                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FacultadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                facultad={selectedFacultad}
                mode={modalMode}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Facultad"
                message={`¿Estás seguro que deseas eliminar la facultad "${facultadToDelete?.nombre}"? Esta acción no se puede deshacer y podría afectar a las escuelas asociadas.`}
                type="danger"
            />
        </div>
    )
}

export default GestionFacultadesPage
