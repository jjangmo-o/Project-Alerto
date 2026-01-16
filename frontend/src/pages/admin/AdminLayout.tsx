import { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const { profile } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Listen for close-sidebar event from Sidebar component
  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarOpen(false);
    document.addEventListener('close-sidebar', handleCloseSidebar);
    return () => document.removeEventListener('close-sidebar', handleCloseSidebar);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ADMIN SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        role="admin"
      />

      <main className="main-content">
        {/* ADMIN HEADER */}
        <Header
          onMenuClick={toggleSidebar}
          role="admin"
          username={profile?.first_name || 'Admin'}
        />

        {/* ADMIN PAGE CONTENT */}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;