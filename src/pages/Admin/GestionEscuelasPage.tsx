import { useState } from 'react'
import { Plus, Search, School, Pencil, Trash2, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { escuelasApi } from '../../services/escuelasApi'
import { Escuela } from '../../types/escuela'
import EscuelaModal from '../../components/Escuelas/EscuelaModal'
import { toast } from 'react-toastify'
import ConfirmModal from '../../components/Common/ConfirmModal'

const GestionEscuelasPage = () => {
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedEscuela, setSelectedEscuela] = useState<Escuela | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [escuelaToDelete, setEscuelaToDelete] = useState<Escuela | null>(null)

    const { data: escuelas, isLoading } = useQuery({
        queryKey: ['escuelas'],
        queryFn: escuelasApi.getAll,
    })

    const deleteMutation = useMutation({
        mutationFn: escuelasApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escuelas'] })
            toast.success('Escuela eliminada exitosamente')
            setIsDeleteModalOpen(false)
            setEscuelaToDelete(null)
        },
        onError: (error) => {
            toast.error('Error al eliminar escuela')
            console.error(error)
        }
    })

    // Mutación para cambiar estado
    const toggleActiveMutation = useMutation({
        mutationFn: escuelasApi.toggleActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escuelas'] })
            toast.success('Estado actualizado correctamente')
        },
        onError: (error) => {
            toast.error('Error al cambiar estado')
            console.error(error)
        }
    })

    const handleCreate = () => {
        setSelectedEscuela(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleEdit = (escuela: Escuela) => {
        setSelectedEscuela(escuela)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleView = (escuela: Escuela) => {
        setSelectedEscuela(escuela)
        setModalMode('view')
        setIsModalOpen(true)
    }

    const handleDeleteClick = (escuela: Escuela) => {
        setEscuelaToDelete(escuela)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = () => {
        if (escuelaToDelete) {
            deleteMutation.mutate(escuelaToDelete.id)
        }
    }

    const filteredEscuelas = escuelas?.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.codigo && e.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Gestión de Escuelas</h1>
                    <p className="text-zinc-500 mt-1">Administra las escuelas profesionales</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Escuela
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Escuelas</p>
                            <h3 className="text-2xl font-bold text-zinc-900">{escuelas?.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Activas</p>
                            <h3 className="text-2xl font-bold text-zinc-900">
                                {escuelas?.filter(e => e.activo).length || 0}
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Facultad</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Alumnos</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        Cargando escuelas...
                                    </td>
                                </tr>
                            ) : filteredEscuelas?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        No se encontraron escuelas
                                    </td>
                                </tr>
                            ) : (
                                filteredEscuelas?.map((escuela) => (
                                    <tr key={escuela.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                                    <School className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">{escuela.nombre}</p>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800">
                                                        {escuela.codigo || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600">
                                            {escuela.facultadNombre}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600">
                                            {escuela.totalEstudiantes}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActiveMutation.mutate(escuela.id)}
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${escuela.activo
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    } transition-colors cursor-pointer`}
                                            >
                                                {escuela.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(escuela)}
                                                    className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(escuela)}
                                                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(escuela)}
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

            <EscuelaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                escuela={selectedEscuela}
                mode={modalMode}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Escuela"
                message={`¿Estás seguro que deseas eliminar la escuela "${escuelaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                type="danger"
            />
        </div>
    )
}

export default GestionEscuelasPage
