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
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { cursosApi } from '../../services/cursosService'
import { docentesApi } from '../../services/docentesService'
import { Curso } from '../../types'
import CursoModal from '../../components/Cursos/CursoModal'
import GestionHorarioModal from '../../components/Cursos/GestionHorarioModal'
import ConfirmModal from '../../components/Common/ConfirmModal'
import { useNotifications } from '../../contexts/NotificationContext'

const CursosPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [cursoToDelete, setCursoToDelete] = useState<Curso | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedCiclo, setSelectedCiclo] = useState<string>('')

  const queryClient = useQueryClient()
  const { createNotification } = useNotifications()

  const { data: cursos, isLoading, error } = useQuery({
    queryKey: ['cursos'],
    queryFn: cursosApi.getAll,
  })

  const { data: docentes } = useQuery({
    queryKey: ['docentes'],
    queryFn: docentesApi.getAll,
  })

  const deleteCursoMutation = useMutation({
    mutationFn: cursosApi.delete,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      toast.success('Curso eliminado exitosamente')
      await createNotification({
        type: 'curso',
        action: 'eliminar',
        nombre: cursoToDelete?.nombreCurso || 'Curso'
      })
      setIsDeleteModalOpen(false)
      setCursoToDelete(null)
    },
    onError: (error) => {
      toast.error('Error al eliminar curso')
      console.error('Error:', error)
    },
  })

  const filteredCursos = cursos?.filter(curso => {
    const matchesSearch = curso.nombreCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.docente?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.docente?.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCiclo = selectedCiclo === '' || curso.ciclo.toString() === selectedCiclo
    
    return matchesSearch && matchesCiclo
  }) || []

  const ciclos = Array.from(new Set(cursos?.map(curso => curso.ciclo) || [])).sort()

  const handleCreate = () => {
    setModalMode('create')
    setSelectedCurso(null)
    setIsModalOpen(true)
  }

  const handleEdit = (curso: Curso) => {
    setModalMode('edit')
    setSelectedCurso(curso)
    setIsModalOpen(true)
  }

  const handleView = (curso: Curso) => {
    setModalMode('view')
    setSelectedCurso(curso)
    setIsModalOpen(true)
  }

  const handleHorario = (curso: Curso) => {
    setSelectedCurso(curso)
    setIsHorarioModalOpen(true)
  }

  const handleDelete = (curso: Curso) => {
    setCursoToDelete(curso)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (cursoToDelete) {
      deleteCursoMutation.mutate(cursoToDelete.id)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg">Error al cargar los cursos</div>
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
            Gestión de Cursos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra los cursos académicos del sistema
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={handleCreate}
            className="btn btn-primary btn-md"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Curso
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Buscar cursos o docentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              className="input"
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(e.target.value)}
            >
              <option value="">Todos los ciclos</option>
              {ciclos.map((ciclo) => (
                <option key={ciclo} value={ciclo.toString()}>
                  Ciclo {ciclo}
                </option>
              ))}
            </select>
            
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {filteredCursos.length} curso{filteredCursos.length !== 1 ? 's' : ''} encontrado{filteredCursos.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cursos List */}
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
                  <div className="rounded-lg bg-gray-300 h-16 w-16"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCursos.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron cursos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCiclo ? 'Intenta con otros filtros de búsqueda' : 'Comienza agregando un nuevo curso'}
            </p>
            {!searchTerm && !selectedCiclo && (
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="btn btn-primary btn-md"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Curso
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Curso</th>
                  <th className="table-header-cell">Docente</th>
                  <th className="table-header-cell">Detalles</th>
                  <th className="table-header-cell">Ciclo</th>
                  <th className="table-header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredCursos.map((curso, index) => (
                  <motion.tr
                    key={curso.id}
                    className="table-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <BookOpenIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {curso.nombreCurso}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {curso.docente ? (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {curso.docente.nombres} {curso.docente.apellidos}
                            </div>
                            <div className="text-xs text-gray-500">
                              {curso.docente.profesion}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin asignar</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <TrophyIcon className="h-4 w-4 mr-1" />
                          {curso.creditos} crédito{curso.creditos !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {curso.horasSemanal} hrs/sem
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Ciclo {curso.ciclo}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(curso)}
                          className="p-1 text-gray-400 hover:text-primary-700 transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleHorario(curso)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Gestionar Horario"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(curso)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(curso)}
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
      <CursoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        curso={selectedCurso}
        mode={modalMode}
        docentes={docentes || []}
      />

      <GestionHorarioModal
        isOpen={isHorarioModalOpen}
        onClose={() => setIsHorarioModalOpen(false)}
        curso={selectedCurso}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Curso"
        message={`¿Estás seguro de que deseas eliminar el curso "${cursoToDelete?.nombreCurso}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export default CursosPage

