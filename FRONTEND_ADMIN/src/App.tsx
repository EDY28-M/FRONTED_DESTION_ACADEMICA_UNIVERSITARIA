import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import { DocenteAuthProvider } from './contexts/DocenteAuthContext'
import Layout from './components/Layout/Layout'
import StudentLayout from './components/Layout/StudentLayout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { ProtectedDocenteRoute } from './components/ProtectedDocenteRoute'
import LoginPage from './pages/Auth/LoginPage'
import { LoginDocentePage } from './pages/Docente/LoginDocentePage'
import { DashboardDocentePage } from './pages/Docente/DashboardDocentePage'
import { GestionCursoDocentePage } from './pages/Docente/GestionCursoDocentePage'
import Dashboard from './pages/Dashboard'
import DocentesPage from './pages/Docentes/DocentesPage'
import CursosPage from './pages/Cursos/CursosPage'
import EstadisticasPage from './pages/Estadisticas/EstadisticasPage'
import PerfilPage from './pages/Perfil/PerfilPage'
import GestionEstudiantesPage from './pages/Admin/GestionEstudiantesPage'
import CursosDirigidosPage from './pages/Admin/CursosDirigidosPage'
import GestionPeriodosPage from './pages/Admin/GestionPeriodosPage'
import VisualizacionEstudiantesPage from './pages/Admin/VisualizacionEstudiantesPage'
import GestionDocentesPasswordPage from './pages/Admin/GestionDocentesPasswordPage'
import InicioDashboard from './pages/Student/InicioDashboard'
import MisCursosPage from './pages/Student/MisCursosPage'
import MatriculaPage from './pages/Student/MatriculaPage'
import NotasPage from './pages/Student/NotasPage'
import PerfilEstudiantePage from './pages/Student/PerfilEstudiantePage'
import RegistroNotasPage from './pages/Student/RegistroNotasPage'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <DocenteAuthProvider>
      <Routes>
        {/* Ruta de login - accesible sin autenticación */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.rol === 'Estudiante' ? "/estudiante/inicio" : "/dashboard"} replace />
            ) : (
              <LoginPage />
            )
          } 
        />

        {/* Ruta de login para docentes - accesible sin autenticación */}
        <Route path="/docente/login" element={<LoginDocentePage />} />

        {/* Rutas protegidas de docente - requieren autenticación como docente */}
        <Route
          path="/docente"
          element={
            <ProtectedDocenteRoute>
              <Outlet />
            </ProtectedDocenteRoute>
          }
        >
          <Route index element={<Navigate to="/docente/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardDocentePage />} />
          <Route path="curso/:id" element={<GestionCursoDocentePage />} />
        </Route>

        {/* Rutas de estudiante - requieren autenticación y rol Estudiante */}
      <Route
        path="/estudiante"
        element={
          <ProtectedRoute>
            {user?.rol === 'Estudiante' ? (
              <StudentLayout>
                <Outlet />
              </StudentLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/estudiante/inicio" replace />} />
        <Route path="inicio" element={<InicioDashboard />} />
        <Route path="mis-cursos" element={<MisCursosPage />} />
        <Route path="matricula" element={<MatriculaPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="registro-notas" element={<RegistroNotasPage />} />
        <Route path="perfil" element={<PerfilEstudiantePage />} />
      </Route>

      {/* Rutas protegidas de administrador - requieren autenticación */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.rol === 'Estudiante' ? (
              <Navigate to="/estudiante/inicio" replace />
            ) : (
              <Layout />
            )}
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="docentes" element={<DocentesPage />} />
        <Route path="docentes/gestion-passwords" element={<GestionDocentesPasswordPage />} />
        <Route path="cursos" element={<CursosPage />} />
        <Route path="estudiantes" element={<GestionEstudiantesPage />} />
        <Route path="estudiantes/visualizar" element={<VisualizacionEstudiantesPage />} />
        <Route path="cursos-dirigidos" element={<CursosDirigidosPage />} />
        <Route path="periodos" element={<GestionPeriodosPage />} />
        <Route path="estadisticas" element={<EstadisticasPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>

      {/* Ruta por defecto - redirigir según autenticación y rol */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.rol === 'Estudiante' ? "/estudiante/inicio" : "/dashboard")
                : "/login"
            } 
            replace 
          />
        } 
      />
    </Routes>
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
    </DocenteAuthProvider>
  )
}

export default App
