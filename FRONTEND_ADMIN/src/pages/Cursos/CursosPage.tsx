import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2,
  BookOpen,
  Clock,
  Award,
  User
} from 'lucide-react'
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
            Gestión de Cursos
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Administra los cursos académicos del sistema
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Curso
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              placeholder="Buscar cursos o docentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
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
            
            <span className="text-sm text-zinc-500 whitespace-nowrap">
              {filteredCursos.length} resultado{filteredCursos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Cursos Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-zinc-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCursos.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-lg bg-zinc-100">
              <BookOpen className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-zinc-900">No se encontraron cursos</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {searchTerm || selectedCiclo ? 'Intenta con otros filtros' : 'Comienza agregando un nuevo curso'}
            </p>
            {!searchTerm && !selectedCiclo && (
              <button
                onClick={handleCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Nuevo Curso
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Docente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Detalles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Ciclo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCursos.map((curso) => (
                  <tr key={curso.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                          <BookOpen className="h-4 w-4 text-zinc-600" />
                        </div>
                        <span className="text-sm font-medium text-zinc-900">
                          {curso.nombreCurso}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {curso.docente ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-400" />
                          <div>
                            <p className="text-sm text-zinc-900">
                              {curso.docente.nombres} {curso.docente.apellidos}
                            </p>
                            <p className="text-xs text-zinc-500">{curso.docente.profesion}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4 text-sm text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-zinc-400" />
                          {curso.creditos} cr
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-zinc-400" />
                          {curso.horasSemanal}h/sem
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700">
                        Ciclo {curso.ciclo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(curso)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleHorario(curso)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                          title="Gestionar Horario"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(curso)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(curso)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

