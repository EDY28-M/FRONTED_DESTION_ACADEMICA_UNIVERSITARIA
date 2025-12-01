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
  Clock
} from 'lucide-react';

// ============================================
// Extracted Components for cleaner code
// ============================================

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, isActive, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className={`
      group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
      transition-all duration-150 relative
      ${isActive 
        ? 'bg-zinc-100 text-zinc-900' 
        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
      }
    `}
  >
    {isActive && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-zinc-900 rounded-r-full" />
    )}
    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-700' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
    {label}
  </Link>
);

const LogoSection: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
      <GraduationCap className="w-4 h-4 text-white" />
    </div>
    <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">
      Portal Estudiante
    </span>
  </div>
);

// ============================================
// Main Layout Component
// ============================================

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [clientIp, setClientIp] = useState<string>('—');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setClientIp(data.ip);
      } catch {
        setClientIp('No disponible');
      }
    };
    fetchIp();
  }, []);

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
    { name: 'Mi Horario', href: '/estudiante/horario', icon: Clock },
    { name: 'Registro de Notas', href: '/estudiante/registro-notas', icon: Award },
    { name: 'Orden de Mérito', href: '/estudiante/orden-merito', icon: GraduationCap },
    { name: 'Perfil', href: '/estudiante/perfil', icon: User },
  ];

  const currentPageName = navigation.find(item => item.href === location.pathname)?.name || 'Portal';

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== Mobile Sidebar ==================== */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-zinc-900/20 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-zinc-200 
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-100">
            <LogoSection />
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                label={item.name}
                isActive={location.pathname === item.href}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
          <div className="p-3 border-t border-zinc-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-[13px] font-medium text-zinc-500 
                hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* ==================== Desktop Sidebar ==================== */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[240px] lg:flex-col bg-white border-r border-zinc-200">
        <div className="flex items-center h-14 px-4 border-b border-zinc-100">
          <LogoSection />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-[13px] font-medium text-zinc-500 
              hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ==================== Main Content ==================== */}
      <div className="lg:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-[15px] font-semibold text-zinc-900 tracking-tight">
                {currentPageName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Notifications
                notifications={notifications}
                onClear={clearNotifications}
                onMarkAsRead={markAsRead}
              />
              
              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[13px] font-medium text-zinc-900 leading-tight">
                      {user?.nombres} {user?.apellidos}
                    </p>
                    <p className="text-[11px] text-zinc-500">Estudiante</p>
                  </div>
                  <ChevronDown className={`hidden sm:block w-4 h-4 text-zinc-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-zinc-200 shadow-xl shadow-zinc-200/50 py-1 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">
                            {user?.nombres} {user?.apellidos}
                          </p>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                            Estudiante
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Session Info */}
                    <div className="px-4 py-2.5 border-b border-zinc-100 space-y-1.5">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Sesión Actual</p>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-600">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {user?.ultimoAcceso 
                            ? new Date(user.ultimoAcceso).toLocaleString('es-PE', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })
                            : new Date().toLocaleString('es-PE', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-600">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-mono">{clientIp}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <Link
                        to="/estudiante/perfil"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/estudiante/perfil');
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-zinc-400" />
                        Cambiar Contraseña
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-zinc-100 py-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-zinc-50/50 min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
