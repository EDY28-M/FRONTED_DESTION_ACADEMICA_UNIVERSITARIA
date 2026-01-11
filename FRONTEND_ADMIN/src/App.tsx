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
import LoginAdminPage from './pages/Admin/LoginAdminPage'
import ForgotPasswordAdminPage from './pages/Admin/ForgotPasswordAdminPage'
import ResetPasswordAdminPage from './pages/Admin/ResetPasswordAdminPage'
import LoginEstudiantePage from './pages/Student/LoginEstudiantePage'
import ForgotPasswordEstudiantePage from './pages/Student/ForgotPasswordEstudiantePage'
import ResetPasswordEstudiantePage from './pages/Student/ResetPasswordEstudiantePage'
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
  HorarioDocentePage,
  EstadisticasDocentePage,
  NotasConsolidadasDocentePage,
  AnunciosDocentePage,
  MaterialesDocentePage
} from './pages/Docente'
import Dashboard from './pages/Dashboard'
import DocentesPage from './pages/Docente/DocentesPage'
import CursosPage from './pages/Cursos/CursosPage'
import GestionHorariosPage from './pages/Admin/GestionHorariosPage'
import EstadisticasPage from './pages/Estadisticas/EstadisticasPage'
import PerfilPage from './pages/Perfil/PerfilPage'
import GestionEstudiantesPage from './pages/Admin/GestionEstudiantesPage'
import CursosDirigidosPage from './pages/Admin/CursosDirigidosPage'
import GestionPeriodosPage from './pages/Admin/GestionPeriodosPage'
import VisualizacionEstudiantesPage from './pages/Admin/VisualizacionEstudiantesPage'
import GestionDocentesPasswordPage from './pages/Admin/GestionDocentesPasswordPage'
import GestionAsistenciasPage from './pages/Admin/GestionAsistenciasPage'
import NotasConsolidadasAdminPage from './pages/Admin/NotasConsolidadasAdminPage'
import AnunciosAdminPage from './pages/Admin/AnunciosAdminPage'
import MaterialesAdminPage from './pages/Admin/MaterialesAdminPage'
import ActivacionCursosPage from './pages/Admin/ActivacionCursosPage'
import InicioDashboard from './pages/Student/InicioDashboard'
import MisCursosPage from './pages/Student/MisCursosPage'
import MatriculaPage from './pages/Student/MatriculaPage'
import PagoMatriculaPage from './pages/Student/PagoMatriculaPage'
import AumentoCursosPage from './pages/Student/AumentoCursosPage'
import RetiroCursosPage from './pages/Student/RetiroCursosPage'
import NotasPage from './pages/Student/NotasPage'
import AsistenciasPage from './pages/Student/AsistenciasPage'
import PerfilEstudiantePage from './pages/Student/PerfilEstudiantePage'
import RegistroNotasPage from './pages/Student/RegistroNotasPage'
import OrdenMeritoPage from './pages/Student/OrdenMeritoPage'
import { HorarioEstudiantePage } from './pages/Student/HorarioEstudiantePage'
import TrabajosPage from './pages/Student/TrabajosPage'
import TrabajoDetallePage from './pages/Student/TrabajoDetallePage'
import { AnunciosPage } from './pages/Student/AnunciosPage'
import { MaterialesPage } from './pages/Student/MaterialesPage'

function App() {
  const { isAuthenticated, user } = useAuth()

  // Eliminar el loading bloqueante - la autenticación ahora es instantánea
  // El AuthContext ya inicializa con datos del localStorage

  return (
    <DocenteAuthProvider>
      <Routes>
        {/* Rutas de Admin - accesibles sin autenticación */}
        <Route 
          path="/admin/login" 
          element={
            isAuthenticated && user?.rol === 'Administrador' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <LoginAdminPage />
            )
          } 
        />
        <Route 
          path="/admin/forgot-password" 
          element={
            isAuthenticated && user?.rol === 'Administrador' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <ForgotPasswordAdminPage />
            )
          } 
        />
        <Route 
          path="/admin/reset-password" 
          element={<ResetPasswordAdminPage />}
        />

        {/* Rutas de Estudiante - accesibles sin autenticación */}
        <Route 
          path="/estudiante/login" 
          element={
            isAuthenticated && user?.rol === 'Estudiante' ? (
              <Navigate to="/estudiante/inicio" replace />
            ) : (
              <LoginEstudiantePage />
            )
          } 
        />
        <Route 
          path="/estudiante/forgot-password" 
          element={
            isAuthenticated && user?.rol === 'Estudiante' ? (
              <Navigate to="/estudiante/inicio" replace />
            ) : (
              <ForgotPasswordEstudiantePage />
            )
          } 
        />
        <Route 
          path="/estudiante/reset-password" 
          element={<ResetPasswordEstudiantePage />}
        />

        {/* Rutas de Docente - accesibles sin autenticación */}
        <Route path="/docente/login" element={<LoginDocentePage />} />
        <Route path="/docente/forgot-password" element={<ForgotPasswordDocentePage />} />
        <Route path="/docente/reset-password" element={<ResetPasswordDocentePage />} />

        {/* Rutas legacy (mantener para compatibilidad, redirigir a admin) */}
        <Route 
          path="/login" 
          element={<Navigate to="/admin/login" replace />}
        />
        <Route 
          path="/forgot-password" 
          element={<Navigate to="/admin/forgot-password" replace />}
        />
        <Route 
          path="/reset-password" 
          element={<ResetPasswordPage />}
        />

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
          <Route path="estadisticas" element={<EstadisticasDocentePage />} />
          <Route path="notas-consolidadas" element={<NotasConsolidadasDocentePage />} />
          <Route path="anuncios" element={<AnunciosDocentePage />} />
          <Route path="materiales" element={<MaterialesDocentePage />} />
          <Route path="curso/:id" element={<GestionCursoDocentePage />} />
          <Route path="perfil" element={<PerfilDocentePage />} />
        </Route>

        {/* Rutas de estudiante - requieren autenticación y rol Estudiante */}
      <Route
        path="/estudiante"
        element={
          <ProtectedRoute requiredRoles={['Estudiante']}>
            <StudentLayout>
              <Outlet />
            </StudentLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/estudiante/inicio" replace />} />
        <Route path="inicio" element={<InicioDashboard />} />
        <Route path="mis-cursos" element={<MisCursosPage />} />
        <Route path="anuncios" element={<AnunciosPage />} />
        <Route path="materiales" element={<MaterialesPage />} />
        <Route path="matricula" element={<MatriculaPage />} />
        <Route path="pago-matricula" element={<PagoMatriculaPage />} />
        <Route path="aumento-cursos" element={<AumentoCursosPage />} />
        <Route path="retiro-cursos" element={<RetiroCursosPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="registro-notas" element={<RegistroNotasPage />} />
        <Route path="asistencias" element={<AsistenciasPage />} />
        <Route path="horario" element={<HorarioEstudiantePage />} />
        <Route path="orden-merito" element={<OrdenMeritoPage />} />
        <Route path="perfil" element={<PerfilEstudiantePage />} />
        <Route path="trabajos/curso/:idCurso" element={<TrabajosPage />} />
        <Route path="trabajos/:id" element={<TrabajoDetallePage />} />
      </Route>

      {/* Rutas protegidas de administrador - requieren autenticación */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={['Administrador']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="docentes" element={<DocentesPage />} />
        <Route path="docentes/gestion-passwords" element={<GestionDocentesPasswordPage />} />
        <Route path="cursos" element={<CursosPage />} />
        <Route path="horarios" element={<GestionHorariosPage />} />
        <Route path="asistencias" element={<GestionAsistenciasPage />} />
        <Route path="estudiantes" element={<GestionEstudiantesPage />} />
        <Route path="estudiantes/visualizar" element={<VisualizacionEstudiantesPage />} />
        <Route path="cursos-dirigidos" element={<CursosDirigidosPage />} />
        <Route path="periodos" element={<GestionPeriodosPage />} />
        <Route path="estadisticas" element={<EstadisticasPage />} />
        <Route path="notas-consolidadas" element={<NotasConsolidadasAdminPage />} />
        <Route path="anuncios" element={<AnunciosAdminPage />} />
        <Route path="materiales" element={<MaterialesAdminPage />} />
        <Route path="activacion-cursos" element={<ActivacionCursosPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>

      {/* Ruta por defecto - redirigir según autenticación y rol */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.rol === 'Estudiante' ? "/estudiante/inicio" : "/admin/dashboard")
                : "/admin/login"
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
