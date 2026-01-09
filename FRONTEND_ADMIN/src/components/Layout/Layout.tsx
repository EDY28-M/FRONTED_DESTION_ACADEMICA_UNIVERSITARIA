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
    return () => {
      document.body.classList.remove('admin-square')
    }
  }, [])

  return (
    <div className="h-screen bg-zinc-50/50 admin-square">
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-5 sm:py-5 lg:px-5 lg:py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
