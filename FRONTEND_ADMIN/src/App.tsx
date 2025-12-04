import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import { DocenteAuthProvider } from './contexts/DocenteAuthContext'
import Layout from './components/Layout/Layout'
import StudentLayout from './components/Layout/StudentLayout'
import DocenteLayout from './components/Layout/DocenteLayout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { ProtectedDocenteRoute } from './components/ProtectedDocenteRoute'
import LoginPage from './pages/Auth/LoginPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import { 
  DashboardDocentePage,
  GestionCursoDocentePage,
  LoginDocentePage,
  ForgotPasswordDocentePage,
  ResetPasswordDocentePage,
  PerfilDocentePage,
  MisCursosDocentePage,
  EstudiantesDocentePage,
  AsistenciasDocentePage,
  HorarioDocentePage
} from './pages/Docente'
import Dashboard from './pages/Dashboard'
import DocentesPage from './pages/Docente/DocentesPage'
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
import AumentoCursosPage from './pages/Student/AumentoCursosPage'
import RetiroCursosPage from './pages/Student/RetiroCursosPage'
import NotasPage from './pages/Student/NotasPage'
import AsistenciasPage from './pages/Student/AsistenciasPage'
import PerfilEstudiantePage from './pages/Student/PerfilEstudiantePage'
import RegistroNotasPage from './pages/Student/RegistroNotasPage'
import OrdenMeritoPage from './pages/Student/OrdenMeritoPage'
import { HorarioEstudiantePage } from './pages/Student/HorarioEstudiantePage'

function App() {
  const { isAuthenticated, user } = useAuth()

  // Eliminar el loading bloqueante - la autenticación ahora es instantánea
  // El AuthContext ya inicializa con datos del localStorage

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

        {/* Ruta de recuperación de contraseña - accesible sin autenticación */}
        <Route 
          path="/forgot-password" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.rol === 'Estudiante' ? "/estudiante/inicio" : "/dashboard"} replace />
            ) : (
              <ForgotPasswordPage />
            )
          } 
        />

        {/* Ruta de resetear contraseña - accesible sin autenticación */}
        <Route 
          path="/reset-password" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.rol === 'Estudiante' ? "/estudiante/inicio" : "/dashboard"} replace />
            ) : (
              <ResetPasswordPage />
            )
          } 
        />

        {/* Ruta de login para docentes - página separada */}
        <Route path="/docente/login" element={<LoginDocentePage />} />

        {/* Ruta de recuperación de contraseña para docentes */}
        <Route path="/docente/forgot-password" element={<ForgotPasswordDocentePage />} />

        {/* Ruta de resetear contraseña para docentes */}
        <Route path="/docente/reset-password" element={<ResetPasswordDocentePage />} />

        {/* Rutas protegidas de docente - requieren autenticación como docente */}
        <Route
          path="/docente"
          element={
            <ProtectedDocenteRoute>
              <DocenteLayout />
            </ProtectedDocenteRoute>
          }
        >
          <Route index element={<Navigate to="/docente/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardDocentePage />} />
          <Route path="mis-cursos" element={<MisCursosDocentePage />} />
          <Route path="estudiantes" element={<EstudiantesDocentePage />} />
          <Route path="asistencias" element={<AsistenciasDocentePage />} />
          <Route path="horario" element={<HorarioDocentePage />} />
          <Route path="curso/:id" element={<GestionCursoDocentePage />} />
          <Route path="perfil" element={<PerfilDocentePage />} />
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
        <Route path="aumento-cursos" element={<AumentoCursosPage />} />
        <Route path="retiro-cursos" element={<RetiroCursosPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="registro-notas" element={<RegistroNotasPage />} />
        <Route path="asistencias" element={<AsistenciasPage />} />
        <Route path="horario" element={<HorarioEstudiantePage />} />
        <Route path="orden-merito" element={<OrdenMeritoPage />} />
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
