import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useDocenteAuth } from '../../contexts/DocenteAuthContext';
import { toast } from 'react-hot-toast';

import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MegaphoneIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

// ============================================
// SIDEBAR ITEM COMPONENT
// ============================================
const SidebarItem = ({
  to,
  icon: Icon,
  label,
  end = false
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
      transition-opacity duration-150
      ${isActive
        ? 'text-zinc-900 bg-zinc-100'
        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
      }
    `}
  >
    <Icon className="h-[18px] w-[18px] stroke-[1.5]" />
    <span>{label}</span>
  </NavLink>
);

// ============================================
// SIDEBAR BUTTON COMPONENT (para acciones)
// ============================================
const SidebarButton = ({
  icon: Icon,
  label,
  onClick,
  danger = false
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
      transition-opacity duration-150
      ${danger
        ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
      }
    `}
  >
    <Icon className="h-[18px] w-[18px] stroke-[1.5]" />
    <span>{label}</span>
  </button>
);

// ============================================
// MAIN LAYOUT COMPONENT
// ============================================
export const DocenteLayout = () => {
  const navigate = useNavigate();
  const { docente, logout } = useDocenteAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Only auto-close when going to mobile view
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/docente/login');
  };

  const getInitials = (nombre?: string) => {
    return nombre?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DC';
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ========== MOBILE OVERLAY ========== */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========== SIDEBAR ========== */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo/Brand */}
        <div className="h-16 px-4 flex items-center border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-start rounded-lg bg-white">
              <img
                src="/src/image/fondouni.svg"
                alt="Logo Universidad"
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-zinc-900">Portal Docente</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-zinc-500 hover:bg-zinc-100 rounded-md"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarItem
            to="/docente/dashboard"
            icon={HomeIcon}
            label="Dashboard"
            end
          />
          <SidebarItem
            to="/docente/mis-cursos"
            icon={BookOpenIcon}
            label="Mis Cursos"
          />
          <SidebarItem
            to="/docente/estudiantes"
            icon={UsersIcon}
            label="Estudiantes"
          />
          <SidebarItem
            to="/docente/asistencias"
            icon={CalendarIcon}
            label="Asistencias"
          />
          <SidebarItem
            to="/docente/horario"
            icon={CalendarDaysIcon}
            label="Mi Horario"
          />
          <SidebarItem
            to="/docente/anuncios"
            icon={MegaphoneIcon}
            label="Anuncios"
          />
          <SidebarItem
            to="/docente/materiales"
            icon={PaperClipIcon}
            label="Materiales"
          />
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-zinc-100 space-y-1">
          <SidebarItem
            to="/docente/perfil"
            icon={Cog6ToothIcon}
            label="Configuración"
          />
          <SidebarButton
            icon={ArrowRightStartOnRectangleIcon}
            label="Cerrar sesión"
            onClick={handleLogout}
          />
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {getInitials(docente?.nombreCompleto)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{docente?.nombreCompleto}</p>
              <p className="text-xs text-zinc-500 truncate">{docente?.correo}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CONTENT WRAPPER ========== */}
      <div className={`
        min-h-screen flex flex-col transition-all duration-300
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
      `}>
        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 h-14 flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="ml-3 font-medium text-zinc-900 lg:hidden">Menú</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DocenteLayout;
