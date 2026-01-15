import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';
import logoImg from '../assets/logo-lighthouse.png';

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  role?: 'user' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, role = 'user' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div
        className="sidebar-logo clickable"
        onClick={() => navigate('/dashboard')}
        role="button"
        aria-label="Go to Home"
      >
        <img src={logoImg} alt="Project Alerto Logo" />
        <h2>Project Alerto</h2>
        <p>MarikeÃ±os Readiness Hub</p>
      </div>


    <nav className="nav-menu">
      {role === 'admin' ? (
        <>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/map"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Evacuation Map
          </NavLink>

          <NavLink
            to="/admin/community-status"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Community Status
          </NavLink>

           <NavLink
            to="/admin/verification"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Verification
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>

          <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Evacuation Map
          </NavLink>

          <NavLink to="/community-status" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Community Status
          </NavLink>

          <NavLink to="/hotlines" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Emergency Hotlines
          </NavLink>

          <NavLink to="/residence" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Residence Card
          </NavLink>
        </>
      )}
    </nav>


      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </aside>
  );
};

export default Sidebar;