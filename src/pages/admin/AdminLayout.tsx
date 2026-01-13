import { useState } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="dashboard-container">
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