import React, { useState } from 'react';
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
  Award
} from 'lucide-react';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, markAsRead } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Inicio', href: '/estudiante/inicio', icon: Home },
    { name: 'Mis Cursos', href: '/estudiante/mis-cursos', icon: BookOpen },
    { name: 'Matrícula', href: '/estudiante/matricula', icon: ClipboardList },
    { name: 'Notas', href: '/estudiante/notas', icon: FileText },
    { name: 'Registro de Notas', href: '/estudiante/registro-notas', icon: Award },
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
          className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-purple-700 to-purple-900 transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 bg-purple-800">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Portal Estudiante</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-800 text-white'
                      : 'text-purple-100 hover:bg-purple-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-purple-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-purple-100 rounded-lg hover:bg-purple-800 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-purple-700 to-purple-900 overflow-y-auto">
          <div className="flex items-center h-16 px-6 bg-purple-800">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Portal Estudiante</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-800 text-white shadow-lg'
                      : 'text-purple-100 hover:bg-purple-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-purple-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-purple-100 rounded-lg hover:bg-purple-800 hover:text-white transition-colors"
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
            <div className="flex items-center space-x-4">
              <Notifications
                notifications={notifications}
                onClear={clearNotifications}
                onMarkAsRead={markAsRead}
              />
              <div className="hidden sm:flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.nombres} {user?.apellidos}</p>
                  <p className="text-xs text-gray-500">Estudiante</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
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
