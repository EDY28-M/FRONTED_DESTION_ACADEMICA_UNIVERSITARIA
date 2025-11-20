import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notifications } from './Notifications';
import {
  BookOpen,
  ClipboardList,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
  Award,
  ChevronDown,
  Shield,
  Calendar,
  MapPin
} from 'lucide-react';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, markAsRead } = useNotifications();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Inicio', href: '/estudiante/inicio', icon: Home },
    { name: 'Mis Cursos', href: '/estudiante/mis-cursos', icon: BookOpen },
    { name: 'Matrícula', href: '/estudiante/matricula', icon: ClipboardList },
    { name: 'Notas', href: '/estudiante/notas', icon: FileText },
    { name: 'Asistencias', href: '/estudiante/asistencias', icon: Calendar },
    { name: 'Registro de Notas', href: '/estudiante/registro-notas', icon: Award },
    { name: 'Orden de Mérito', href: '/estudiante/orden-merito', icon: GraduationCap },
    { name: 'Perfil', href: '/estudiante/perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-white border-r border-gray-200 transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Portal Estudiante</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">Portal Estudiante</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === location.pathname)?.name || 'Portal Estudiante'}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Notifications
                notifications={notifications}
                onClear={clearNotifications}
                onMarkAsRead={markAsRead}
              />
              
              {/* Menú del Perfil con Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                {/* Botón Desktop */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="hidden sm:flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.nombres} {user?.apellidos}</p>
                    <p className="text-xs text-gray-500">Estudiante</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Botón Mobile - Solo Avatar */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex sm:hidden items-center justify-center hover:bg-gray-50 rounded-full p-1 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-w-sm">
                    {/* Header del menú */}
                    <div className="px-3 sm:px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 uppercase truncate">{user?.nombres} {user?.apellidos}</p>
                          <p className="text-[10px] sm:text-xs text-gray-600 font-medium">ABENDAÑO MEZA</p>
                          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-100 text-emerald-700">
                            Alumno {user?.email?.split('@')[0] || '0020210096'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Último Acceso */}
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1.5 sm:mb-2">Último Acceso:</p>
                      <div className="space-y-1 sm:space-y-1.5">
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-700">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">Fecha:</span>
                          <span className="ml-auto text-right">{new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-700">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">Dirección IP:</span>
                          <span className="ml-auto">190.43.75.15</span>
                        </div>
                      </div>
                    </div>

                    {/* Roles */}
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1.5 sm:mb-2">Roles Asignados:</p>
                      <div className="flex items-center text-xs sm:text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0" />
                        <span className="text-indigo-600 font-medium">Alumno</span>
                        <span className="ml-auto text-[10px] sm:text-xs text-gray-500">{user?.email?.split('@')[0] || '0020210096'}</span>
                      </div>
                    </div>

                    {/* Opciones */}
                    <div className="py-1">
                      <Link
                        to="/estudiante/perfil"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                        Información Personal
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          // Aquí puedes abrir un modal para cambiar contraseña si lo deseas
                          navigate('/estudiante/perfil');
                        }}
                        className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                        Cambiar Contraseña
                      </button>
                    </div>

                    {/* Cerrar Sesión */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
