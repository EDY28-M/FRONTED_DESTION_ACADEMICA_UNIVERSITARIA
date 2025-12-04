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
  MapPin,
  Clock,
  Plus,
  Minus,
  Building2
} from 'lucide-react';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [registroAcademicoOpen, setRegistroAcademicoOpen] = useState(true);
  const [clientIp, setClientIp] = useState<string>('Obteniendo...');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, markAsRead } = useNotifications();

  // Obtener IP del cliente
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setClientIp(data.ip);
      } catch (error) {
        setClientIp('No disponible');
      }
    };
    fetchIp();
  }, []);

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
    { name: 'Notas', href: '/estudiante/notas', icon: FileText },
    { name: 'Asistencias', href: '/estudiante/asistencias', icon: Calendar },
    { name: 'Mi Horario', href: '/estudiante/horario', icon: Clock },
    { name: 'Registro de Notas', href: '/estudiante/registro-notas', icon: Award },
    { name: 'Orden de Mérito', href: '/estudiante/orden-merito', icon: GraduationCap },
    { name: 'Perfil', href: '/estudiante/perfil', icon: User },
  ];

  // Submenú de Registro Académico
  const registroAcademicoSubMenu = [
    { name: 'Matrícula', href: '/estudiante/matricula', icon: ClipboardList },
    { name: 'Aumento de Cursos', href: '/estudiante/aumento-cursos', icon: Plus },
    { name: 'Retiro de Cursos', href: '/estudiante/retiro-cursos', icon: Minus },
  ];

  // Verificar si alguna ruta del submenú está activa
  const isRegistroAcademicoActive = location.pathname.includes('/estudiante/matricula') || 
    location.pathname.includes('/estudiante/aumento-cursos') || 
    location.pathname.includes('/estudiante/retiro-cursos');

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-white border-r border-zinc-200 transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-zinc-900 rounded-md flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-zinc-900">Portal Estudiante</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.slice(0, 2).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-zinc-700' : ''}`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Submenú Registro Académico */}
            <div className="py-1">
              <button
                onClick={() => setRegistroAcademicoOpen(!registroAcademicoOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isRegistroAcademicoActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`h-4 w-4 ${isRegistroAcademicoActive ? 'text-teal-600' : ''}`} />
                  <span>Registro Académico</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${registroAcademicoOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {registroAcademicoOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-teal-200 pl-3">
                  {registroAcademicoSubMenu.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          isSubActive
                            ? 'bg-teal-100 text-teal-800'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                      >
                        <subItem.icon className={`h-3.5 w-3.5 ${isSubActive ? 'text-teal-600' : ''}`} />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {navigation.slice(2).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-zinc-700' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-3 border-t border-zinc-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-zinc-500 rounded-md hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-zinc-200 overflow-y-auto">
          <div className="flex items-center h-14 px-4 border-b border-zinc-200">
            <div className="h-7 w-7 bg-zinc-900 rounded-md flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="ml-2 text-sm font-semibold text-zinc-900">Portal Estudiante</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navigation.slice(0, 2).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-zinc-700' : ''}`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Submenú Registro Académico - Desktop */}
            <div className="py-1">
              <button
                onClick={() => setRegistroAcademicoOpen(!registroAcademicoOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isRegistroAcademicoActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`h-4 w-4 ${isRegistroAcademicoActive ? 'text-teal-600' : ''}`} />
                  <span>Registro Académico</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${registroAcademicoOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {registroAcademicoOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-teal-200 pl-3">
                  {registroAcademicoSubMenu.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          isSubActive
                            ? 'bg-teal-100 text-teal-800'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                      >
                        <subItem.icon className={`h-3.5 w-3.5 ${isSubActive ? 'text-teal-600' : ''}`} />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {navigation.slice(2).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-zinc-700' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-3 border-t border-zinc-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-zinc-500 rounded-md hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-60">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-medium text-zinc-900">
                {navigation.find((item) => item.href === location.pathname)?.name || 'Portal Estudiante'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
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
                  className="hidden sm:flex items-center gap-2 hover:bg-zinc-50 rounded-md px-2 py-1.5 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-zinc-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-zinc-900">{user?.nombres} {user?.apellidos}</p>
                    <p className="text-[10px] text-zinc-500">Estudiante</p>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Botón Mobile - Solo Avatar */}
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex sm:hidden items-center justify-center hover:bg-zinc-50 rounded-md p-1 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-zinc-600" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-50">
                    {/* Header del menú */}
                    <div className="px-3 py-3 border-b border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{user?.nombres} {user?.apellidos}</p>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 mt-0.5">
                            {user?.email?.split('@')[0] || 'estudiante'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Último Acceso */}
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Último Acceso</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-zinc-600">
                          <Calendar className="h-3 w-3 mr-1.5 text-zinc-400 flex-shrink-0" />
                          <span className="font-mono tabular-nums">
                            {user?.ultimoAcceso 
                              ? new Date(user.ultimoAcceso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(user.ultimoAcceso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                              : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-zinc-600">
                          <MapPin className="h-3 w-3 mr-1.5 text-zinc-400 flex-shrink-0" />
                          <span className="font-mono tabular-nums">{clientIp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Opciones */}
                    <div className="py-1">
                      <Link
                        to="/estudiante/perfil"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <User className="h-4 w-4 text-zinc-400" />
                        Información Personal
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/estudiante/perfil');
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <Shield className="h-4 w-4 text-zinc-400" />
                        Cambiar Contraseña
                      </button>
                    </div>

                    {/* Cerrar Sesión */}
                    <div className="border-t border-zinc-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
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
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
