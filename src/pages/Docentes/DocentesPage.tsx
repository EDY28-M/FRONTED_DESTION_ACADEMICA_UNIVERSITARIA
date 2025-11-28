import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
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
            className="mt-2 btn btn-primary"
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:flex md:items-center md:justify-between"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestión de Docentes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra la información de los profesores del sistema
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={handleCreate}
            className="btn btn-primary btn-md"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Docente
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Buscar docentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center text-sm text-gray-500">
            {filteredDocentes.length} docente{filteredDocentes.length !== 1 ? 's' : ''} encontrado{filteredDocentes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </motion.div>

      {/* Docentes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDocentes.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron docentes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando un nuevo docente'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="btn btn-primary btn-md"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Docente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Docente</th>
                  <th className="table-header-cell">Profesión</th>
                  <th className="table-header-cell">Contacto</th>
                  <th className="table-header-cell">Cursos</th>
                  <th className="table-header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredDocentes.map((docente, index) => (
                  <motion.tr
                    key={docente.id}
                    className="table-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {docente.nombres} {docente.apellidos}
                          </div>
                          {docente.fechaNacimiento && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {format(new Date(docente.fechaNacimiento), 'dd/MM/yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {docente.profesion || 'Sin especificar'}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {docente.correo && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{docente.correo}</span>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {docente.cursos.length} curso{docente.cursos.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(docente)}
                          className="p-1 text-gray-400 hover:text-primary-700 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(docente)}
                          className="p-1 text-gray-400 hover:text-primary-700 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(docente)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

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


