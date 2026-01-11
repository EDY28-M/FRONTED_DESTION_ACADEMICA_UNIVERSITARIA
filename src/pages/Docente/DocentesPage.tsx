import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2,
  User,
  Mail,
  Briefcase,
  Calendar
} from 'lucide-react'
import { docentesApi } from '../../services/docentesService'
import { Docente } from '../../types'
import DocenteModal from '../../components/Docentes/DocenteModal'
import ConfirmModal from '../../components/Common/ConfirmModal'
import { format } from 'date-fns'
import { useNotifications } from '../../contexts/NotificationContext'

const DocentesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [docenteToDelete, setDocenteToDelete] = useState<Docente | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const queryClient = useQueryClient()
  const { createNotification } = useNotifications()

  const { data: docentes, isLoading, error } = useQuery({
    queryKey: ['docentes'],
    queryFn: docentesApi.getAll,
  })

  const deleteDocenteMutation = useMutation({
    mutationFn: docentesApi.delete,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] })
      const nombreCompleto = `${docenteToDelete?.nombres} ${docenteToDelete?.apellidos}`
      toast.success('Docente eliminado exitosamente')
      await createNotification({
        type: 'docente',
        action: 'eliminar',
        nombre: nombreCompleto
      })
      setIsDeleteModalOpen(false)
      setDocenteToDelete(null)
    },
    onError: (error) => {
      toast.error('Error al eliminar docente')
      console.error('Error:', error)
    },
  })

  const filteredDocentes = docentes?.filter(docente =>
    docente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.profesion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreate = () => {
    setModalMode('create')
    setSelectedDocente(null)
    setIsModalOpen(true)
  }

  const handleEdit = (docente: Docente) => {
    setModalMode('edit')
    setSelectedDocente(docente)
    setIsModalOpen(true)
  }

  const handleView = (docente: Docente) => {
    setModalMode('view')
    setSelectedDocente(docente)
    setIsModalOpen(true)
  }

  const handleDelete = (docente: Docente) => {
    setDocenteToDelete(docente)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (docenteToDelete) {
      deleteDocenteMutation.mutate(docenteToDelete.id)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg">Error al cargar los docentes</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Gestión de Docentes
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Administra la información de los profesores del sistema
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nuevo Docente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-zinc-200 pl-10 text-sm focus:border-zinc-900 focus:ring-zinc-900 placeholder:text-zinc-400"
              placeholder="Buscar por nombre, correo o profesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center text-sm text-zinc-500 whitespace-nowrap">
            {filteredDocentes.length} docente{filteredDocentes.length !== 1 ? 's' : ''} encontrado{filteredDocentes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Docentes List */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="rounded-full bg-zinc-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDocentes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">No se encontraron docentes</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando un nuevo docente'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Docente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-zinc-900">Docente</th>
                  <th className="px-6 py-3 font-medium text-zinc-900">Profesión</th>
                  <th className="px-6 py-3 font-medium text-zinc-900">Contacto</th>
                  <th className="px-6 py-3 font-medium text-zinc-900">Cursos</th>
                  <th className="px-6 py-3 font-medium text-zinc-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDocentes.map((docente) => (
                  <tr
                    key={docente.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">
                            {docente.nombres} {docente.apellidos}
                          </div>
                          {docente.fechaNacimiento && (
                            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(docente.fechaNacimiento), 'dd/MM/yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Briefcase className="h-4 w-4 text-zinc-400" />
                        <span>{docente.profesion || 'Sin especificar'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {docente.correo && (
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span>{docente.correo}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {docente.cursos.length} curso{docente.cursos.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(docente)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(docente)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(docente)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modals */}
      <DocenteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        docente={selectedDocente}
        mode={modalMode}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Docente"
        message={`¿Estás seguro de que deseas eliminar a ${docenteToDelete?.nombres} ${docenteToDelete?.apellidos}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export default DocentesPage


