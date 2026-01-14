import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // HeadlessUI Dialog renderiza en un portal al <body>, así que ponemos la marca ahí
  // para que el "no rounded" aplique también a modales del admin.
  useEffect(() => {
    document.body.classList.add('admin-square')
    document.body.classList.add('admin-light')
    return () => {
      document.body.classList.remove('admin-square')
      document.body.classList.remove('admin-light')
    }
  }, [])

  return (
    <div className="h-screen bg-white admin-square overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className={`flex flex-col h-full transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isCollapsed={sidebarCollapsed}
        />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-6 bg-white">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 bg-white px-6 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-mono tracking-wide text-zinc-700">
            <p>© 2026 Sistema de Gestión Académica. Build v.4.0.2</p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <span className="cursor-pointer hover:text-lime-400 transition-colors">Privacidad</span>
              <span className="cursor-pointer hover:text-lime-400 transition-colors">Términos</span>
              <div className="flex items-center gap-2 border border-green-700/30 bg-green-50 px-2 py-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 animate-pulse"></div>
                <span className="text-green-500 font-bold">SISTEMA ONLINE</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
