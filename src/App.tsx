  import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import ObservabilityTracker from './components/Observability/ObservabilityTracker'
import { DocenteAuthProvider } from './contexts/DocenteAuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { ProtectedDocenteRoute } from './components/ProtectedDocenteRoute'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import LoginAdminPage from './pages/Admin/LoginAdminPage'
import ForgotPasswordAdminPage from './pages/Admin/ForgotPasswordAdminPage'
import ResetPasswordAdminPage from './pages/Admin/ResetPasswordAdminPage'
import LoginEstudiantePage from './pages/Student/LoginEstudiantePage'
import ForgotPasswordEstudiantePage from './pages/Student/ForgotPasswordEstudiantePage'
import ResetPasswordEstudiantePage from './pages/Student/ResetPasswordEstudiantePage'
import { LoginDocentePage } from './pages/Docente/LoginDocentePage'
import { ForgotPasswordDocentePage } from './pages/Docente/ForgotPasswordDocentePage'
import { ResetPasswordDocentePage } from './pages/Docente/ResetPasswordDocentePage'

const Layout = lazy(() => import('./components/Layout/Layout'))
const StudentLayout = lazy(() => import('./components/Layout/StudentLayout'))
const DocenteLayout = lazy(() => import('./components/Layout/DocenteLayout'))

const DashboardDocentePage = lazy(() =>
  import('./pages/Docente/DashboardDocentePage').then((module) => ({ default: module.DashboardDocentePage }))
)
const GestionCursoDocentePage = lazy(() =>
  import('./pages/Docente/GestionCursoDocentePage').then((module) => ({ default: module.GestionCursoDocentePage }))
)
const PerfilDocentePage = lazy(() =>
  import('./pages/Docente/PerfilDocentePage').then((module) => ({ default: module.PerfilDocentePage }))
)
const MisCursosDocentePage = lazy(() =>
  import('./pages/Docente/MisCursosDocentePage').then((module) => ({ default: module.MisCursosDocentePage }))
)
const EstudiantesDocentePage = lazy(() =>
  import('./pages/Docente/EstudiantesDocentePage').then((module) => ({ default: module.EstudiantesDocentePage }))
)
const AsistenciasDocentePage = lazy(() =>
  import('./pages/Docente/AsistenciasDocentePage').then((module) => ({ default: module.AsistenciasDocentePage }))
)
const HorarioDocentePage = lazy(() =>
  import('./pages/Docente/HorarioDocentePage').then((module) => ({ default: module.HorarioDocentePage }))
)
const EstadisticasDocentePage = lazy(() =>
  import('./pages/Docente/EstadisticasDocentePage').then((module) => ({ default: module.EstadisticasDocentePage }))
)
const NotasConsolidadasDocentePage = lazy(() =>
  import('./pages/Docente/NotasConsolidadasDocentePage').then((module) => ({ default: module.NotasConsolidadasDocentePage }))
)
const AnunciosDocentePage = lazy(() =>
  import('./pages/Docente/AnunciosDocentePage').then((module) => ({ default: module.AnunciosDocentePage }))
)
const MaterialesDocentePage = lazy(() =>
  import('./pages/Docente/MaterialesDocentePage').then((module) => ({ default: module.MaterialesDocentePage }))
)

const Dashboard = lazy(() => import('./pages/Dashboard'))
const DocentesPage = lazy(() => import('./pages/Docente/DocentesPage'))
const CursosPage = lazy(() => import('./pages/Cursos/CursosPage'))
const GestionHorariosPage = lazy(() => import('./pages/Admin/GestionHorariosPage'))
const EstadisticasPage = lazy(() => import('./pages/Estadisticas/EstadisticasPage'))
const PerfilPage = lazy(() => import('./pages/Perfil/PerfilPage'))
const GestionEstudiantesPage = lazy(() => import('./pages/Admin/GestionEstudiantesPage'))
const CursosDirigidosPage = lazy(() => import('./pages/Admin/CursosDirigidosPage'))
const GestionPeriodosPage = lazy(() => import('./pages/Admin/GestionPeriodosPage'))
const VisualizacionEstudiantesPage = lazy(() => import('./pages/Admin/VisualizacionEstudiantesPage'))
const GestionDocentesPasswordPage = lazy(() => import('./pages/Admin/GestionDocentesPasswordPage'))
const GestionAsistenciasPage = lazy(() => import('./pages/Admin/GestionAsistenciasPage'))
const NotasConsolidadasAdminPage = lazy(() => import('./pages/Admin/NotasConsolidadasAdminPage'))
const AnunciosAdminPage = lazy(() => import('./pages/Admin/AnunciosAdminPage'))
const MaterialesAdminPage = lazy(() => import('./pages/Admin/MaterialesAdminPage'))
const ActivacionCursosPage = lazy(() => import('./pages/Admin/ActivacionCursosPage'))
const GestionFacultadesPage = lazy(() => import('./pages/Admin/GestionFacultadesPage'))
const GestionEscuelasPage = lazy(() => import('./pages/Admin/GestionEscuelasPage'))

const InicioDashboard = lazy(() => import('./pages/Student/InicioDashboard'))
const MisCursosPage = lazy(() => import('./pages/Student/MisCursosPage'))
const MatriculaPage = lazy(() => import('./pages/Student/MatriculaPage'))
const PagoMatriculaPage = lazy(() => import('./pages/Student/PagoMatriculaPage'))
const PagoMatriculaInicialPage = lazy(() => import('./pages/Student/PagoMatriculaInicialPage'))
const AumentoCursosPage = lazy(() => import('./pages/Student/AumentoCursosPage'))
const RetiroCursosPage = lazy(() => import('./pages/Student/RetiroCursosPage'))
const NotasPage = lazy(() => import('./pages/Student/NotasPage'))
const AsistenciasPage = lazy(() => import('./pages/Student/AsistenciasPage'))
const PerfilEstudiantePage = lazy(() => import('./pages/Student/PerfilEstudiantePage'))
const RegistroNotasPage = lazy(() => import('./pages/Student/RegistroNotasPage'))
const OrdenMeritoPage = lazy(() => import('./pages/Student/OrdenMeritoPage'))
const HorarioEstudiantePage = lazy(() =>
  import('./pages/Student/HorarioEstudiantePage').then((module) => ({ default: module.HorarioEstudiantePage }))
)
const TrabajosPage = lazy(() => import('./pages/Student/TrabajosPage'))
const TrabajoDetallePage = lazy(() => import('./pages/Student/TrabajoDetallePage'))
const AnunciosPage = lazy(() =>
  import('./pages/Student/AnunciosPage').then((module) => ({ default: module.AnunciosPage }))
)
const MaterialesPage = lazy(() =>
  import('./pages/Student/MaterialesPage').then((module) => ({ default: module.MaterialesPage }))
)
const PagoExitosoPage = lazy(() => import('./pages/Student/PagoExitosoPage'))
const PagoCanceladoPage = lazy(() => import('./pages/Student/PagoCanceladoPage'))

const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
  </div>
)

function App() {
  const { isAuthenticated, user } = useAuth()

  // Eliminar el loading bloqueante - la autenticación ahora es instantánea
  // El AuthContext ya inicializa con datos del localStorage

  return (
    <DocenteAuthProvider>
      <ObservabilityTracker />
      <Suspense fallback={<RouteLoadingFallback />}>
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
          <Route path="pago-matricula-inicial" element={<PagoMatriculaInicialPage />} />
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
          <Route path="pago-exitoso" element={<PagoExitosoPage />} />
          <Route path="pago-cancelado" element={<PagoCanceladoPage />} />
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
          <Route path="facultades" element={<GestionFacultadesPage />} />
          <Route path="escuelas" element={<GestionEscuelasPage />} />
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
      </Suspense>
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
